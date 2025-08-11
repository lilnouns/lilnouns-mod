import { getBlockNumber } from '@/services/ethereum/get-block-number'
import { getBlockTimestamp } from '@/services/ethereum/get-block-timestamp'
import { getProposals } from '@/services/lilnouns/get-proposals'
import { getMe } from '@/services/warpcast/get-me'
import { logger } from '@/utilities/logger'
import { DateTime } from 'luxon'
import { createHash } from 'node:crypto'
import { chunk, filter, isTruthy, pipe } from 'remeda'
import { getUserByVerificationAddress } from '@nekofar/warpcast'

interface DirectCastBody {
  type: 'direct-cast'
  data: {
    recipientFid: number
    message: string
    idempotencyKey: string
  }
}

/**
 * Calculate the number of hours left until a given timestamp.
 * @param timestamp - The target time in milliseconds since the Unix epoch.
 * @returns The number of hours left until the given timestamp. Returns 0 if the timestamp is in the past.
 */
function hoursLeftUntil(timestamp: number): number {
  const targetTime = DateTime.fromSeconds(timestamp)
  const now = DateTime.now()

  // Calculate the difference in hours
  const diff = targetTime.diff(now, 'hours').hours

  // Return the difference, ensuring it's not negative
  return diff > 0 ? diff : 0
}

/**
 * Handles the proposal by retrieving or fetching delegates from KV store and logging them.
 * @param env - The environment object.
 * @returns - A promise that resolves once the proposal is handled.
 */
export async function reminderHandler(env: Env) {
  const { KV: kv, QUEUE: queue } = env

  logger.info('Fetching current user data...')
  const { user } = await getMe(env)

  logger.info('Fetching Farcaster voters from KV...')
  const farcasterVoters =
    (await kv.get<number[] | null>('lilnouns-farcaster-voters', {
      type: 'json',
    })) ?? []

  logger.info(
    { farcasterVotersCount: farcasterVoters.length },
    'Fetched Farcaster voters.',
  )

  logger.info('Fetching current block number...')
  const blockNumber = await getBlockNumber(env)

  logger.info('Fetching active proposals...')
  let { proposals } = await getProposals(env)

  proposals = filter(
    proposals,
    (proposal) =>
      proposal.status === 'ACTIVE' && Number(proposal.endBlock) > blockNumber,
  )

  logger.info(
    { activeProposalsCount: proposals.length },
    'Filtered active proposals.',
  )

  const batch: MessageSendRequest<DirectCastBody>[] = []

  for (const proposal of proposals) {
    const { votes, endBlock, id } = proposal

    logger.debug(
      { proposalId: id },
      'Fetching end block timestamp for proposal.',
    )
    const endBlockTimestamp = await getBlockTimestamp(env, Number(endBlock))

    if (endBlockTimestamp && hoursLeftUntil(endBlockTimestamp) > 2) {
      logger.debug(
        { proposalId: id },
        'Proposal voting ends in more than 2 hours, skipping.',
      )
      continue
    }

    logger.info(
      { proposalId: id },
      'Processing proposal nearing end of voting period.',
    )

    const voters = await Promise.all(
      votes.map(async (vote) => {
        try {
          const {
            data: {
              result: { user },
            },
          } = await getUserByVerificationAddress<true>({
            auth: () => env.WARPCAST_ACCESS_TOKEN,
            query: {
              address: vote.voter.id.toLowerCase(),
            },
          })
          return user?.fid
        } catch (error) {
          if (
            error instanceof Error &&
            !error.message.startsWith('No FID has connected')
          ) {
            logger.error(
              { error, voterId: vote.voter.id },
              'Error fetching Farcaster user for voter.',
            )
          }
          return null
        }
      }),
    ).then((results) => filter(results, isTruthy))

    logger.info(
      { votersCount: voters.length, proposalId: id },
      'Fetched and filtered voters for the proposal.',
    )

    const message =
      `Hey there! Just a heads-up that voting on proposal #${id.toString()} is closing in less than two hours ⏳.
      If you’ve got a moment, we'd love for you to cast your vote! 🙌
      https://lilnouns.camp/proposals/${id.toString()}`.replace(/\n\s+/g, '\n')

    const idempotencyKey = createHash('sha256').update(message).digest('hex')

    for (const recipientFid of farcasterVoters) {
      if (recipientFid === user.fid || voters.includes(recipientFid)) {
        logger.debug(
          { recipientFid },
          'Skipping current user or already voted.',
        )
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
    logger.info(
      { batchSize: batch.length },
      'Sending reminder batch to the queue...',
    )
    try {
      const batchSizeLimit = 100

      const chunkedBatches = pipe(batch, chunk(batchSizeLimit))

      for (const chunk of chunkedBatches) {
        await queue.sendBatch(chunk)
        logger.info({ chunk }, 'Chunk enqueued successfully')
      }
      logger.info({ batchSize: batch.length }, 'Batch enqueued successfully.')
    } catch (error) {
      logger.error({ error, batch }, 'Error enqueuing reminder batch.')
    }
  } else {
    logger.debug('No reminders to send at this time.')
  }
}
