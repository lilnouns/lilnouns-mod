import { getBlockNumber } from '@/services/ethereum/get-block-number'
import { getBlockTimestamp } from '@/services/ethereum/get-block-timestamp'
import { getProposals } from '@/services/lilnouns/get-proposals'
import { getMe } from '@/services/warpcast/get-me'
import { getUserByVerification } from '@/services/warpcast/get-user-by-verification'
import { DateTime } from 'luxon'
import { createHash } from 'node:crypto'
import { filter, isTruthy } from 'remeda'

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
  const targetTime = DateTime.fromMillis(timestamp)
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

  const { user } = await getMe(env)

  const farcasterVoters: number[] =
    (await kv.get('lilnouns-farcaster-voters', { type: 'json' })) ?? []

  const blockNumber = await getBlockNumber(env)
  let { proposals } = await getProposals(env)

  proposals = filter(
    proposals,
    (proposal) =>
      proposal.status === 'ACTIVE' && Number(proposal.endBlock) > blockNumber,
  )

  const batch: MessageSendRequest<DirectCastBody>[] = []

  for (const proposal of proposals) {
    const { votes, endBlock, id } = proposal

    const endBlockTimestamp = await getBlockTimestamp(env, Number(endBlock))

    if (hoursLeftUntil(endBlockTimestamp) > 2) {
      continue
    }

    const voters = await Promise.all(
      votes.map(async (vote) => {
        try {
          const { user } = await getUserByVerification(
            env,
            vote.voter.id.toLowerCase(),
          )
          return user.fid
        } catch (error) {
          if (
            error instanceof Error &&
            !error.message.startsWith('No FID has connected')
          ) {
            console.error(`An error occurred: ${error.message}`)
          }
          return null
        }
      }),
    ).then((results) => filter(results, isTruthy))

    const message =
      `Hey mate, quick reminder fa ya, voting on proposal #${id.toString()} wraps up in under two hours ⏳` +
      ` Would appreciate if you could take a sec and cast your vote! 🙌`
    const idempotencyKey = createHash('sha256').update(message).digest('hex')

    for (const recipientFid of farcasterVoters) {
      if (recipientFid === user.fid || voters.includes(recipientFid)) {
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
    try {
      await queue.sendBatch(batch)
      console.log('Batch enqueued successfully:', batch)
    } catch (error) {
      console.error('Error enqueuing batch:', error)
    }
  }
}
