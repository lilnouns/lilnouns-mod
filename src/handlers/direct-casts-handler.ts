import { getMe } from '@/services/warpcast/get-me'
import { logger } from '@/utilities/logger'
import { getDirectCastInbox } from '@nekofar/warpcast'
import { createHash } from 'node:crypto'
import {
  chunk,
  filter,
  flat,
  flatMap,
  isNullish,
  map,
  pipe,
  sort,
  unique,
} from 'remeda'

interface DirectCastBody {
  type: 'direct-cast'
  data: {
    recipientFid: number
    message: string
    idempotencyKey: string
  }
}

/**
 * Handles the subscribers by retrieving conversations and participants,
 * filtering out duplicates, and storing the subscribers in KV.
 * @param env - The environment object containing required dependencies.
 * @returns - A Promise that resolves once the subscribers are handled.
 */
async function handleSubscribers(env: Env) {
  const { KV: kv } = env
  const cacheKey = 'lilnouns-farcaster-subscribers'
  const categories = ['default', 'requests']

  logger.info('Fetching current subscribers from KV...')
  const subscribers: number[] =
    (await kv.get<number[] | null>(cacheKey, { type: 'json' })) ?? []

  logger.info(
    { subscribersCount: subscribers.length },
    'Fetched current subscribers.',
  )

  const newSubscribers = await Promise.all(
    map(categories, async (category) => {
      logger.info({ category }, 'Fetching conversations for category.')
      const { data, error } = await getDirectCastInbox({
        auth: () => env.WARPCAST_ACCESS_TOKEN,
        query: {
          limit: 100,
          category: category as 'default' | 'requests' | 'spam',
        },
      })

      if (error) {
        logger.error({ error, category }, 'Failed to fetch conversations')
        return []
      }

      const conversations = data.result.conversations
      logger.info(
        { category, conversationsCount: conversations.length },
        'Fetched conversations.',
      )

      // Filter out conversations with no participants
      const participantIds = pipe(
        conversations,
        flatMap(({ participants }) => participants),
        map((p) => p?.fid),
        filter((p) => !isNullish(p)),
      )

      return participantIds
    }),
  )

  const updatedSubscribers = pipe(
    [...subscribers, ...flat(newSubscribers)],
    unique(),
    sort((a, b) => a - b),
  )

  logger.info(
    { updatedSubscribersCount: updatedSubscribers.length },
    'Updated subscribers list.',
  )

  await kv.put(cacheKey, JSON.stringify(updatedSubscribers))
  logger.info('Subscribers list saved to KV.')
}

/**
 * Handles unread messages by sending an automated response to the participants
 * in the unread direct cast conversations.
 * @param env - The environment object containing configuration and services.
 * @returns A promise that resolves when the messages have been handled.
 */
async function handleMessages(env: Env) {
  const { KV: kv, QUEUE: queue } = env
  const cacheKey = 'lilnouns-farcaster-responders'

  logger.info('Fetching current responders from KV...')
  const respondedFids: number[] =
    (await kv.get<number[] | null>(cacheKey, { type: 'json' })) ?? []

  logger.info(
    { respondedFidsCount: respondedFids.length },
    'Fetched FIDs who have already responded.',
  )

  logger.info('Fetching current user data...')
  const { user } = await getMe(env)

  logger.info('Fetching unread conversations...')
  const { data, error } = await getDirectCastInbox({
    auth: () => env.WARPCAST_ACCESS_TOKEN,
    query: {
      limit: 100,
      category: 'default',
      filter: 'unread',
    },
  })

  if (error) {
    logger.error({ error }, 'Failed to fetch unread conversations')
    return
  }

  logger.info(
    { conversationsCount: data.result.conversations.length },
    'Fetched unread conversations.',
  )

  const recipientFids = pipe(
    data.result.conversations,
    flatMap(({ participants }) => participants),
    map((p) => p?.fid),
    filter((p) => !isNullish(p)),
  )

  const batch: MessageSendRequest<DirectCastBody>[] = []

  for (const recipientFid of recipientFids) {
    if (recipientFid === user.fid) {
      logger.debug({ recipientFid }, 'Skipping message for current user.')
      continue
    }

    if (respondedFids.includes(recipientFid)) {
      logger.debug({ recipientFid }, 'Skipping already responded user.')
      continue
    }

    const message =
      'This account runs on autopilot, so please don’t send messages directly here. ' +
      'If you have any issues or questions, just reach out to @nekofar! 😊'
    const idempotencyKey = createHash('sha256').update(message).digest('hex')

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
    respondedFids.push(recipientFid)
  }

  if (batch.length > 0) {
    logger.info(
      { batchSize: batch.length },
      'Sending message batch to the queue...',
    )
    try {
      const batchSizeLimit = 100

      const chunkedBatches = pipe(batch, chunk(batchSizeLimit))

      for (const chunk of chunkedBatches) {
        await queue.sendBatch(chunk)
        logger.info({ chunk }, 'Chunk enqueued successfully')
      }
      logger.info({ batchSize: batch.length }, 'Batch enqueued successfully.')

      // Update the KV store with the new list of responded users
      await kv.put(cacheKey, JSON.stringify(respondedFids))
      logger.info('Updated responders list saved to KV.')
    } catch (error) {
      logger.error({ error, batch }, 'Error enqueuing message batch.')
    }
  } else {
    logger.debug('No messages to send at this time.')
  }
}

/**
 * Updates the subscriber list by adding any new participants from direct cast conversations.
 * @param env - The environment object containing the KV store.
 * @returns - A promise that resolves after the update is completed.
 */
export async function directCastsHandler(env: Env) {
  logger.info('Starting direct cast handler process...')
  await handleMessages(env)
  await handleSubscribers(env)
  logger.info('Direct cast handler process completed.')
}
