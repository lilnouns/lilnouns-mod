import { getBlockNumber } from '@/services/ethereum/get-block-number'
import { getBlockTimestamp } from '@/services/ethereum/get-block-timestamp'
import { getProposals } from '@/services/lilnouns/get-proposals'
import { getMe } from '@/services/warpcast/get-me'
import { logger } from '@/utilities/logger'
import { getUserByVerificationAddress } from '@nekofar/warpcast'
import { DateTime } from 'luxon'
import { createHash } from 'node:crypto'
import { chunk, filter, isTruthy, pipe } from 'remeda'

interface DirectCastBody {
  type: 'direct-cast'
  data: {
    recipientFid: number
    message: string
    idempotencyKey: string
  }
}

/**
 * Converts a given timestamp to a relative time string.
 * @param timestamp - The timestamp to be converted.
 * @returns A relative time string.
 */
function toRelativeTime(timestamp: number) {
  return DateTime.fromSeconds(timestamp).toRelative({
    style: 'long',
    unit: ['hours', 'minutes'],
  })
}

/**
 * Handles the proposal by retrieving or fetching delegates from KV store and logging them.
 * @param env - The environment object.
 * @returns - A promise that resolves once the proposal is handled.
 */
export async function proposalHandler(env: Env) {
  const { KV: kv, QUEUE: queue } = env

  logger.info('Fetching current user data...')
  const { user } = await getMe(env)

  logger.info('Fetching Farcaster users and subscribers from KV...')
  const farcasterUsers =
    (await kv.get<number[] | null>('lilnouns-farcaster-users', {
      type: 'json',
    })) ?? []
  const farcasterSubscribers =
    (await kv.get<number[] | null>('lilnouns-farcaster-subscribers', {
      type: 'json',
    })) ?? []

  logger.info(
    {
      farcasterUsersCount: farcasterUsers.length,
      farcasterSubscribersCount: farcasterSubscribers.length,
    },
    'Fetched Farcaster users and subscribers.',
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
    const { votes, endBlock, startBlock, id } = proposal

    logger.debug({ proposalId: id }, 'Fetching timestamps for proposal blocks.')
    const [startBlockTimestamp, endBlockTimestamp] = await Promise.all([
      getBlockTimestamp(env, Number(startBlock)),
      getBlockTimestamp(env, Number(endBlock)),
    ])

    const proposalStart = toRelativeTime(startBlockTimestamp)
    const proposalEnd = toRelativeTime(endBlockTimestamp)

    logger.debug(
      { proposalId: id, start: proposalStart, end: proposalEnd },
      'Processed proposal timeframes.',
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
      `🗳️ Lil Nouns, your vote matters! Proposal #${id.toString()} is live.
      Voting opened ${proposalStart ?? 'unknown'} and closes ${proposalEnd ?? 'unknown'}.
      You haven't voted yet; make your voice count before time runs out! ⏳🚀
      https://lilnouns.camp/proposals/${id.toString()}`.replace(/\n\s+/g, '\n')

    const idempotencyKey = createHash('sha256').update(message).digest('hex')

    for (const recipientFid of farcasterSubscribers) {
      if (
        recipientFid === user.fid ||
        voters.includes(recipientFid) ||
        !farcasterUsers.includes(recipientFid)
      ) {
        logger.debug(
          { fid: recipientFid },
          'Skipping user as they have already voted or are the current user.',
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
    } catch (error) {
      logger.error({ error, batch }, 'Error enqueuing message batch.')
    }
  } else {
    logger.debug('No messages to send at this time.')
  }
}
