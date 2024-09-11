import { getBlockNumber } from '@/services/ethereum/get-block-number'
import { getBlockTimestamp } from '@/services/ethereum/get-block-timestamp'
import { getProposals } from '@/services/lilnouns/get-proposals'
import { getMe } from '@/services/warpcast/get-me'
import { getUserByVerification } from '@/services/warpcast/get-user-by-verification'
import { createHash } from 'crypto'
import { DateTime } from 'luxon'
import { filter, isTruthy } from 'remeda'

interface DirectCastBody {
  type: 'direct-cast';
  data: {
    recipientFid: number;
    message: string;
    idempotencyKey: string;
  };
}

/**
 * Converts a given timestamp to a relative time string.
 * @param timestamp - The timestamp to be converted.
 * @returns A relative time string.
 */
function toRelativeTime(timestamp: number): string {
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

  const { user } = await getMe(env)

  const farcasterUsers: number[] =
    (await kv.get('lilnouns-farcaster-users', { type: 'json' })) ?? []

  const farcasterSubscribers: number[] =
    (await kv.get('lilnouns-farcaster-subscribers', { type: 'json' })) ?? []

  const blockNumber = await getBlockNumber(env)
  let { proposals } = await getProposals(env)

  proposals = filter(
    proposals,
    (proposal) =>
      proposal.status === 'ACTIVE' && Number(proposal.endBlock) > blockNumber,
  )

  const batch: MessageSendRequest<DirectCastBody>[] = []

  for (const proposal of proposals) {
    const { votes, endBlock, startBlock, id } = proposal

    const [startBlockTimestamp, endBlockTimestamp] = await Promise.all([
      getBlockTimestamp(env, Number(startBlock)),
      getBlockTimestamp(env, Number(endBlock)),
    ])

    const proposalStart = toRelativeTime(startBlockTimestamp)
    const proposalEnd = toRelativeTime(endBlockTimestamp)

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
      `🗳️ It's voting time, Lil Nouns fam! Proposal #${id.toString()} is live and ready for your voice. ` +
      `Voting started ${proposalStart} and wraps up ${proposalEnd}. ` +
      `You received this message because you haven't voted yet. Don't miss out, cast your vote now! 🌟`
    const idempotencyKey = createHash('sha256').update(message).digest('hex')

    for (const recipientFid of farcasterSubscribers) {
      if (
        recipientFid === user.fid ||
        voters.includes(recipientFid) ||
        !farcasterUsers.includes(recipientFid)
      ) {
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
        }
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
