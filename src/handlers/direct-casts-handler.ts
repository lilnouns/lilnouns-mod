import { getDirectCastConversations } from '@/services/warpcast/get-direct-cast-conversations'

/**
 *
 * @param env
 */
export async function directCastsHandler(env: Env) {
  const { KV: kv } = env

  let subscribers: number[] =
    (await kv.get('lilnouns-subscribers', { type: 'json' })) ?? []

  const { conversations } = await getDirectCastConversations(env, 100)

  for (const conversation of conversations) {
    for (const participant of conversation.participants) {
      subscribers = [...new Set([...subscribers, participant.fid])]
    }
  }

  await kv.put('lilnouns-subscribers', JSON.stringify(subscribers))
}
