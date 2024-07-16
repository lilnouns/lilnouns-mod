import { fetchAccounts } from '@/services/lilnouns/fetch-accounts'
import { fetchDelegates } from '@/services/lilnouns/fetch-delegates'
import { getUserByVerification } from '@/services/warpcast/get-user-by-verification'

/**
 * Handles caching of data for LilNouns application.
 * @param env - The environment object containing KV storage.
 * @returns - A promise that resolves when caching is complete.
 */
export async function cacheHandler(env: Env) {
  const { KV: kv } = env

  let accounts: { id: string }[] | null = await env.KV.get(
    'lilnouns-accounts',
    { type: 'json' },
  )
  if (accounts === null) {
    const { accounts: newAccounts } = await fetchAccounts(env)

    await kv.put('lilnouns-accounts', JSON.stringify(newAccounts), {
      expirationTtl: 60 * 60 * 24,
    })

    accounts = newAccounts
  }

  let delegates: { id: string }[] | null = await env.KV.get(
    'lilnouns-delegates',
    { type: 'json' },
  )
  if (delegates === null) {
    const { delegates: newDelegates } = await fetchDelegates(env)

    await kv.put('lilnouns-delegates', JSON.stringify(newDelegates), {
      expirationTtl: 60 * 60 * 24,
    })

    delegates = newDelegates
  }

  let users: { fid: number }[] | null = await env.KV.get(
    'lilnouns-farcaster-users',
    {
      type: 'json',
    },
  )
  if (users === null) {
    users = []
    const addresses = [
      ...new Set([
        ...accounts.map((account) => account.id),
        ...delegates.map((account) => account.id),
      ]),
    ]
    for (const address of addresses) {
      try {
        const { user } = await getUserByVerification(env, address)
        users = [...new Set([...users, user])]
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        /* empty */
      }
    }

    await kv.put('lilnouns-farcaster-users', JSON.stringify(users), {
      expirationTtl: 60 * 60 * 24,
    })
  }
}
