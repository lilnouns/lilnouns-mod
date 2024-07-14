import { getBlockNumber } from '@/services/ethereum/get-block-number'
import { getBlockTimestamp } from '@/services/ethereum/get-block-timestamp'
import { getProposals } from '@/services/lilnouns/get-proposals'
import { getUserByVerification } from '@/services/warpcast/get-user-by-verification'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

/**
 * Handles the proposal by retrieving or fetching delegates from KV store and logging them.
 * @param env - The environment object.
 * @returns - A promise that resolves once the proposal is handled.
 */
export async function proposalHandler(env: Env) {
  const { KV: kv } = env

  const blockNumber = await getBlockNumber(env)
  let { proposals } = await getProposals(env)

  const subscribers: { fid: number }[] =
    (await kv.get('lilnouns-subscribers', { type: 'json' })) ?? []

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
      `Hi there! ` +
      `It’s voting time for proposal number ${id.toString()}. ` +
      `Voting started ${proposalStart} ago and finishes in ${proposalEnd}. ` +
      `Make sure to vote!`

    for (const subscriber of subscribers) {
      if (voters.includes(subscriber.fid)) {
        continue
      }

      console.log(message)
    }
  }
}
