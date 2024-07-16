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
  const expirationTtl = 60 * 60 * 24

  let holdersAddresses: string[] =
    (await kv.get('lilnouns-holders-addresses', { type: 'json' })) ?? []
  if (holdersAddresses.length === 0) {
    const { accounts } = await fetchAccounts(env)
    holdersAddresses = accounts.map((account) => account.id)
    const serializedHoldersAddresses = JSON.stringify(holdersAddresses)
    await kv.put('lilnouns-holders-addresses', serializedHoldersAddresses, {
      expirationTtl,
    })
  }

  let delegatesAddresses: string[] =
    (await kv.get('lilnouns-delegates-addresses', { type: 'json' })) ?? []
  if (delegatesAddresses.length === 0) {
    const { delegates } = await fetchDelegates(env)
    delegatesAddresses = delegates.map((account) => account.id)
    const serializedDelegatesAddresses = JSON.stringify(delegatesAddresses)
    await kv.put('lilnouns-delegates-addresses', serializedDelegatesAddresses, {
      expirationTtl,
    })
  }

  let farcasterUsers: number[] =
    (await kv.get('lilnouns-farcaster-users', { type: 'json' })) ?? []
  if (farcasterUsers.length === 0) {
    const addresses = [...new Set([...holdersAddresses, ...delegatesAddresses])]
    for (const address of addresses) {
      try {
        const { user } = await getUserByVerification(env, address)
        farcasterUsers = [...new Set([...farcasterUsers, user.fid])]
      } catch (error) {
        if (error instanceof Error) {
          if (!error.message.startsWith('No FID has connected')) {
            console.error(`An error occurred: ${error.message}`)
          }
        }
      }
    }

    const sortedFarcasterUsers = farcasterUsers.sort((a, b) => a - b)
    const serializedFarcasterUsers = JSON.stringify(sortedFarcasterUsers)
    await kv.put('lilnouns-farcaster-users', serializedFarcasterUsers, {
      expirationTtl,
    })
  }
  console.log(farcasterUsers)
}
