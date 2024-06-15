import { fetchDelegates } from '@/services/lilnouns/fetch-delegates'

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
