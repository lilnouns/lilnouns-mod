import { dayjs } from '@/libs/dayjs'
import { getBlockNumber } from '@/services/ethereum/get-block-number'
import { getBlockTimestamp } from '@/services/ethereum/get-block-timestamp'
import { getProposals } from '@/services/lilnouns/get-proposals'
import { getMe } from '@/services/warpcast/get-me'
import { getUserByVerification } from '@/services/warpcast/get-user-by-verification'
import { sendDirectCast } from '@/services/warpcast/send-direct-cast'
import { createHash } from 'node:crypto'
import { delay } from 'unicorn-magic'

/**
 * Handles the proposal by retrieving or fetching delegates from KV store and logging them.
 * @param env - The environment object.
 * @returns - A promise that resolves once the proposal is handled.
 */
export async function proposalHandler(env: Env) {
  const { KV: kv } = env

  const { user } = await getMe(env)

  const farcasterUsers: number[] =
    (await kv.get('lilnouns-farcaster-users', { type: 'json' })) ?? []

  const farcasterSubscribers: number[] =
    (await kv.get('lilnouns-farcaster-subscribers', { type: 'json' })) ?? []

  const blockNumber = await getBlockNumber(env)
  let { proposals } = await getProposals(env)

  proposals = proposals.filter((proposal) => {
    return (
      proposal.status === 'ACTIVE' && Number(proposal.endBlock) > blockNumber
    )
  })

  for (const proposal of proposals) {
    const { votes, endBlock, startBlock, id } = proposal
    let voters: number[] = []

    const startBlockTimestamp = await getBlockTimestamp(env, Number(startBlock))
    const endBlockTimestamp = await getBlockTimestamp(env, Number(endBlock))

    const proposalStart = dayjs.unix(startBlockTimestamp).fromNow(true)
    const proposalEnd = dayjs.unix(endBlockTimestamp).toNow(true)

    for (const vote of votes) {
      try {
        const { user } = await getUserByVerification(
          env,
          vote.voter.id.toLowerCase(),
        )
        voters = [...voters, user.fid]
      } catch (error) {
        if (error instanceof Error) {
          if (!error.message.startsWith('No FID has connected')) {
            console.error(`An error occurred: ${error.message}`)
          }
        }
      }
    }

    const message =
      `🗳️ It's voting time, Lil Nouns fam! Proposal #${id.toString()} is live and ready for your voice. ` +
      `Voting started ${proposalStart} ago and wraps up in ${proposalEnd}. ` +
      `You received this message because you haven't voted yet. Don't miss out, cast your vote now! 🌟`
    const idempotencyKey = createHash('sha256').update(message).digest('hex')

    for (const subscriber of farcasterSubscribers) {
      if (
        subscriber === user.fid ||
        voters.includes(subscriber) ||
        !farcasterUsers.includes(subscriber)
      ) {
        continue
      }

      await sendDirectCast(env, subscriber, message, idempotencyKey)
      await delay({ seconds: 10 })
    }
  }
}
