import { getDirectCastConversations } from '@/services/warpcast/get-direct-cast-conversations'

/**
 * Handles the subscribers by retrieving conversations and participants,
 * filtering out duplicates, and storing the subscribers in KV.
 * @param env - The environment object containing required dependencies.
 * @returns - A Promise that resolves once the subscribers are handled.
 */
async function subscribersHandler(env: Env) {
  const { KV: kv } = env

  const categories = ['default', 'request']

  let farcasterSubscribers: number[] =
    (await kv.get('lilnouns-farcaster-subscribers', { type: 'json' })) ?? []

  for (const category of categories) {
    const { conversations } = await getDirectCastConversations(
      env,
      100,
      category,
    )

    for (const conversation of conversations) {
      const { participants } = conversation
      for (const participant of participants) {
        farcasterSubscribers = [
          ...new Set([...farcasterSubscribers, participant.fid]),
        ]
      }
    }
  }

  const sortedFarcasterSubscribers = farcasterSubscribers.sort((a, b) => a - b)
  const serializedSubscribers = JSON.stringify(sortedFarcasterSubscribers)
  await kv.put('lilnouns-farcaster-subscribers', serializedSubscribers)
}

/**
 * Updates the subscriber list by adding any new participants from direct cast conversations.
 * @param env - The environment object containing the KV store.
 * @returns - A promise that resolves after the update is completed.
 */
export async function directCastsHandler(env: Env) {
  await subscribersHandler(env)
}
