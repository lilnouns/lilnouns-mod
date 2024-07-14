import { getDirectCastConversations } from '@/services/warpcast/get-direct-cast-conversations'

/**
 * Updates the subscriber list by adding any new participants from direct cast conversations.
 * @param env - The environment object containing the KV store.
 * @returns - A promise that resolves after the update is completed.
 */
export async function directCastsHandler(env: Env) {
  const { KV: kv } = env

  const categories = ['default', 'request']

  let subscribers: { fid: number }[] =
    (await kv.get('lilnouns-subscribers', { type: 'json' })) ?? []

  for (const category of categories) {
    const { conversations } = await getDirectCastConversations(
      env,
      100,
      category,
    )

    for (const conversation of conversations) {
      const { participants } = conversation
      for (const participant of participants) {
        subscribers = [...new Set([...subscribers, participant])]
      }
    }
  }

  await kv.put('lilnouns-subscribers', JSON.stringify(subscribers))
}
