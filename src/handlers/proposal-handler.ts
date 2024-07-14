import { getBlockNumber } from '@/services/ethereum/get-block-number'
import { getBlockTimestamp } from '@/services/ethereum/get-block-timestamp'
import { getProposals } from '@/services/lilnouns/get-proposals'
import { getUserByVerification } from '@/services/warpcast/get-user-by-verification'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { createHash } from 'node:crypto'
import { delay } from 'unicorn-magic'

dayjs.extend(relativeTime)

/**
 * Handles the proposal by retrieving or fetching delegates from KV store and logging them.
 * @param env - The environment object.
 * @returns - A promise that resolves once the proposal is handled.
 */
export async function proposalHandler(env: Env) {
  const { KV: kv } = env

  const users: { fid: number }[] =
    (await env.KV.get('lilnouns-farcaster-users', { type: 'json' })) ?? []
  const lilnouners = users.map((user) => user.fid)

  const subscribers: { fid: number }[] =
    (await kv.get('lilnouns-subscribers', { type: 'json' })) ?? []

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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        /* empty */
      }
    }

    const message =
      `🗳️ It's voting time, Lil Nouns fam! Proposal #${id.toString()} is live and ready for your voice. ` +
      `Voting started ${proposalStart} ago and wraps up in ${proposalEnd}. ` +
      `You received this message because you haven't voted yet. Don't miss out, cast your vote now! 🌟`
    const idempotencyKey = createHash('sha256').update(message).digest('hex')

    for (const subscriber of subscribers) {
      if (
        voters.includes(subscriber.fid) ||
        !lilnouners.includes(subscriber.fid)
      ) {
        continue
      }

      console.log(
        JSON.stringify({
          subscriber,
          message,
          idempotencyKey,
        }),
      )
      //await sendDirectCast(env, subscriber.fid, message, idempotencyKey)
      await delay({ seconds: 10 })
    }
  }
}
