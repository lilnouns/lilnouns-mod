import { getBlockNumber } from '@/services/ethereum/get-block-number'
import { getBlockTimestamp } from '@/services/ethereum/get-block-timestamp'
import { getProposals } from '@/services/lilnouns/get-proposals'
import { createWarpcastUserLookup } from '@/services/warpcast/user'
import { logger } from '@/utilities/logger'
import { getCurrentUser } from '@nekofar/warpcast'
import { DateTime } from 'luxon'
import { createHash } from 'node:crypto'
import { chunk, filter, first, isTruthy, pipe } from 'remeda'

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
  const { data: useData, error: userError } = await getCurrentUser({
    auth: () => env.WARPCAST_ACCESS_TOKEN,
  })

  if (userError) {
    logger.error({ error: userError }, 'Failed to get current user')
    return
  }

  const user = useData.result.user

  const warpcastUsers = createWarpcastUserLookup({
    auth: () => env.WARPCAST_ACCESS_TOKEN,
  })

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
        const address = vote.voter.id.toLowerCase()
        const maxRetries = 3
        const baseDelayMs = 300

        let attempt = 0
        // Retry loop with exponential backoff
        // Known "No FID has connected" case is not retried and returns null
        while (true) {
          attempt += 1
          try {
            const { data, error } =
              await warpcastUsers.getUserByVerificationAddress(address)

            if (error) {
              const primaryError = first(error.errors ?? [])
              const isNoFIDError = primaryError?.message?.startsWith(
                'No FID has connected',
              )

              if (isNoFIDError) {
                logger.warn(
                  { address, proposalId: id },
                  'No FID has connected for address',
                )
                return null
              }

              if (attempt < maxRetries) {
                logger.warn(
                  { address, proposalId: id, attempt, error },
                  'Transient error fetching Farcaster user. Retrying...',
                )
                await new Promise((resolve) =>
                  setTimeout(resolve, baseDelayMs * 2 ** (attempt - 1)),
                )
                continue
              }

              logger.error(
                { address, proposalId: id, attempts: attempt, error },
                'Failed to fetch Farcaster user after retries. Aborting.',
              )
              throw new Error(primaryError?.message ?? 'Farcaster API error')
            }

            // Success path
            return data?.result?.user?.fid ?? null
          } catch (err) {
            if (attempt < maxRetries) {
              logger.warn(
                { address, proposalId: id, attempt, error: err },
                'Exception fetching Farcaster user. Retrying...',
              )
              await new Promise((resolve) =>
                setTimeout(resolve, baseDelayMs * 2 ** (attempt - 1)),
              )
              continue
            }

            logger.error(
              { address, proposalId: id, attempts: attempt, error: err },
              'Exception fetching Farcaster user after retries. Aborting.',
            )
            // Halt execution to avoid proceeding with partial/invalid data
            throw err
          }
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
