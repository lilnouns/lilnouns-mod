import { getDirectCastConversations } from '@/services/warpcast/get-direct-cast-conversations'
import { flat, pipe, sort, unique } from 'remeda'

/**
 * Handles the subscribers by retrieving conversations and participants,
 * filtering out duplicates, and storing the subscribers in KV.
 * @param env - The environment object containing required dependencies.
 * @returns - A Promise that resolves once the subscribers are handled.
 */
async function subscribersHandler(env: Env) {
  const { KV: kv } = env

  const categories = ['default', 'request']

  const subscribers: number[] =
    (await kv.get('lilnouns-farcaster-subscribers', { type: 'json' })) ?? []

  const newSubscribers = await Promise.all(
    categories.map(async (category) => {
      const { conversations } = await getDirectCastConversations(
        env,
        100,
        category,
      )
      return conversations.flatMap(({ participants }) =>
        participants.map(({ fid }) => fid),
      )
    }),
  )

  const updatedSubscribers = pipe(
    [...subscribers, ...flat(newSubscribers)],
    unique(),
    sort((a, b) => a - b),
  )

  await kv.put(
    'lilnouns-farcaster-subscribers',
    JSON.stringify(updatedSubscribers),
  )
}

/**
 * Updates the subscriber list by adding any new participants from direct cast conversations.
 * @param env - The environment object containing the KV store.
 * @returns - A promise that resolves after the update is completed.
 */
export async function directCastsHandler(env: Env) {
  await subscribersHandler(env)
}
