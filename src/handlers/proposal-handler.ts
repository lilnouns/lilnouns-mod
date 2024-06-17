import { fetchDelegates } from '@/services/lilnouns/fetch-delegates'

/**
 * Handles the proposal by retrieving or fetching delegates from KV store and logging them.
 * @param env - The environment object.
 * @returns - A promise that resolves once the proposal is handled.
 */
export async function proposalHandler(env: Env) {
  const { KV: kv } = env

  let delegates = await env.KV.get('lilnouns-delegates', { type: 'json' })
  if (delegates === null) {
    delegates = await fetchDelegates()

    await kv.put('lilnouns-delegates', JSON.stringify(delegates), {
      expirationTtl: 60 * 60 * 24,
    })
  }

  console.log(JSON.stringify(delegates, undefined, 2))
}
