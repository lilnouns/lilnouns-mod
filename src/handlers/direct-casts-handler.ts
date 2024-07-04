import {
  getDirectCastConversations
} from '@/services/warpcast/get-direct-cast-conversations'

/**
 *
 * @param env
 */
export async function directCastsHandler(env: Env) {
  const { KV: kv } = env
  const { conversations } = await getDirectCastConversations(env, 100)

  for (const conversation of conversations) {
    console.log(conversation)
  }
}
