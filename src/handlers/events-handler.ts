import { logger } from '@/utilities/logger'
import { DateTime, WeekdayNumbers } from 'luxon'
import { chunk, pipe } from 'remeda'
import { getCurrentUser } from '@nekofar/warpcast'

interface DirectCastBody {
  type: 'direct-cast'
  data: {
    recipientFid: number
    message: string
    idempotencyKey: string
  }
}

interface EventInfo {
  weekday: WeekdayNumbers
  hour: number
  minute: number
  eventMessage: string
  eventLink: string
}

/**
 * Scheduled event handler that checks for upcoming events and sends notifications to a queue.
 * @param env - Cloudflare Worker environment variables
 */
export async function eventsHandler(env: Env) {
  const { KV: kv, QUEUE: queue } = env
  const cacheKey = 'lilnouns-farcaster-voters'

  logger.info('Fetching current user data...')
  const { data: useData, error: userError } = await getCurrentUser({
    auth: () => env.WARPCAST_ACCESS_TOKEN,
  })

  if (userError) {
    logger.error({ error: userError }, 'Failed to get current user')
    return
  }

  const user = useData.result.user

  logger.info('Fetching Farcaster voters from KV...')
  const farcasterVoters =
    (await kv.get<number[] | null>(cacheKey, { type: 'json' })) ?? []

  if (farcasterVoters.length === 0) {
    logger.warn('No Farcaster voters found in KV storage.')
    return
  }

  logger.info(
    { votersCount: farcasterVoters.length },
    'Farcaster voters loaded.',
  )

  const batch: MessageSendRequest<DirectCastBody>[] = []
  const now = DateTime.utc()

  const targetTimes: EventInfo[] = [
    {
      weekday: 2,
      hour: 16,
      minute: 15,
      eventMessage:
        'The Tuesday call is at 16:15 UTC. ' +
        'A "semi-focused" discussion on the tasks at hand in the DAO, ' +
        'with the goal of leaving each week with tangible objectives.',
      eventLink: 'https://discord.gg/pSX3yrCsHw',
    },
    {
      weekday: 4,
      hour: 21,
      minute: 0,
      eventMessage:
        'Join us for another Lil Nouns Happy Hour at 21:00 UTC. ' +
        'We will review proposals, air grievances, and probably argue about ' +
        'things that do not really matter, but hey, that is what makes it fun!',
      eventLink: 'https://discord.gg/6mVmyAUPYk',
    },
  ]

  for (const target of targetTimes) {
    const nextTargetTime = getNextTargetTime(
      target.weekday,
      target.hour,
      target.minute,
    )

    const minutesDifference = nextTargetTime.diff(now, 'minutes').minutes

    logger.debug(
      {
        event: target.eventMessage,
        nextTargetTime: nextTargetTime.toISO(),
        minutesDifference,
      },
      'Calculated next target time.',
    )

    if (minutesDifference <= 120 && minutesDifference >= 0) {
      const message = `${target.eventMessage}\nYou can join here: ${target.eventLink}`
      const idempotencyKey = crypto.randomUUID()

      for (const recipientFid of farcasterVoters) {
        if (recipientFid === user.fid) {
          logger.debug({ recipientFid }, 'Skipping current user.')
          continue
        }

        const task: MessageSendRequest<DirectCastBody> = {
          body: {
            type: 'direct-cast',
            data: {
              recipientFid,
              message,
              idempotencyKey,
            },
          },
        }

        batch.push(task)
      }
    }

    if (batch.length > 0) {
      logger.info({ batchSize: batch.length }, 'Sending batch to the queue.')
      try {
        const batchSizeLimit = 100

        const chunkedBatches = pipe(batch, chunk(batchSizeLimit))

        for (const chunk of chunkedBatches) {
          await queue.sendBatch(chunk)
          logger.info({ chunk }, 'Chunk enqueued successfully')
        }
        logger.info({ batchSize: batch.length }, 'Batch enqueued successfully.')
      } catch (error) {
        logger.error({ error, batch }, 'Error enqueuing batch.')
      }
    } else {
      logger.debug('No notifications to send at this time.')
    }
  }
}

/**
 * Calculates the next occurrence of a target time.
 * @param weekday - Day of the week (1-7)
 * @param hour - Hour of the day (0-23)
 * @param minute - Minute of the hour (0-59)
 * @returns The DateTime object representing the next occurrence.
 */
const getNextTargetTime = (
  weekday: WeekdayNumbers,
  hour: number,
  minute: number,
): DateTime => {
  const now = DateTime.utc()
  let targetDateTime = now.set({
    weekday,
    hour,
    minute,
    second: 0,
    millisecond: 0,
  })

  if (targetDateTime <= now) {
    targetDateTime = targetDateTime.plus({ weeks: 1 })
  }

  logger.debug(
    {
      weekday,
      hour,
      minute,
      targetDateTime: targetDateTime.toISO(),
    },
    'Calculated next target DateTime.',
  )

  return targetDateTime
}
