import { fetchAccounts } from '@/services/lilnouns/fetch-accounts'
import { fetchDelegates } from '@/services/lilnouns/fetch-delegates'
import { getUserByVerification } from '@/services/warpcast/get-user-by-verification'
import { map, pipe, sortBy, unique } from 'remeda'

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
    holdersAddresses = pipe(
      accounts,
      map((account) => account.id),
    )
    await kv.put(
      'lilnouns-holders-addresses',
      JSON.stringify(holdersAddresses),
      {
        expirationTtl,
      },
    )
  }

  let delegatesAddresses: string[] =
    (await kv.get('lilnouns-delegates-addresses', { type: 'json' })) ?? []
  if (delegatesAddresses.length === 0) {
    const { delegates } = await fetchDelegates(env)
    delegatesAddresses = pipe(
      delegates,
      map((account) => account.id),
    )
    await kv.put(
      'lilnouns-delegates-addresses',
      JSON.stringify(delegatesAddresses),
      {
        expirationTtl,
      },
    )
  }

  let farcasterUsers: number[] =
    (await kv.get('lilnouns-farcaster-users', { type: 'json' })) ?? []
  if (farcasterUsers.length === 0) {
    const addresses = pipe(
      [...holdersAddresses, ...delegatesAddresses],
      unique(),
    )

    for (const address of addresses) {
      try {
        const { user } = await getUserByVerification(env, address)
        farcasterUsers = pipe(
          farcasterUsers,
          (users) => unique([...users, user.fid]),
          sortBy((fid) => fid),
        )
      } catch (error) {
        if (
          error instanceof Error &&
          !error.message.startsWith('No FID has connected')
        ) {
          console.error(`An error occurred: ${error.message}`)
        }
      }
    }

    await kv.put('lilnouns-farcaster-users', JSON.stringify(farcasterUsers), {
      expirationTtl,
    })
  }
}
