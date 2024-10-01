import { getBlockNumber } from '@/services/ethereum/get-block-number'
import { fetchAccounts } from '@/services/lilnouns/fetch-accounts'
import { fetchDelegates } from '@/services/lilnouns/fetch-delegates'
import { fetchVoters } from '@/services/lilnouns/fetch-voters'
import { getUserByVerification } from '@/services/warpcast/get-user-by-verification'
import { DateTime } from 'luxon'
import { map, pipe, sortBy, unique } from 'remeda'

const expirationTtl = 60 * 60 * 24

/**
 * Fetches the holder addresses from the KV storage or, if not available,
 * from the accounts list, and stores them in the KV storage.
 * @param env - The environment object containing the KV storage.
 * @returns - A promise that resolves to an array of holder addresses.
 */
async function fetchHolderAddresses(env: Env) {
  const { KV: kv } = env

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
  return holdersAddresses
}

/**
 * Fetches delegate addresses from the KVNamespace.
 * If addresses are not available, fetches them from an external environment
 * and stores them in the KVNamespace.
 * @param env - The environment configuration used to fetch delegate data.
 * @returns A promise that resolves to an array of delegate addresses.
 */
async function fetchDelegateAddresses(env: Env) {
  const { KV: kv } = env

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
  return delegatesAddresses
}

/**
 * Fetches and stores Farcaster users into a Key-Value store.
 *
 * This method retrieves the addresses of holders and delegates,
 * fetches the corresponding Farcaster user data, and stores the
 * unique and sorted list of user FIDs in a Key-Value store.
 * @param env - The environment object containing necessary configurations and KV store.
 * @returns A promise that resolves when the process is complete.
 */
async function fetchAndStoreFarcasterUsers(env: Env) {
  const { KV: kv } = env

  const holdersAddresses = await fetchHolderAddresses(env)

  const delegatesAddresses = await fetchDelegateAddresses(env)

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
          [...farcasterUsers, user.fid],
          unique(),
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

/**
 * Fetches and stores Farcaster voters' addresses and FIDs
 * (Farcaster IDs) in the given key-value store.
 * @param env - The environment object containing configuration and KV store.
 * @returns A Promise that resolves when the operation is completed.
 */
async function fetchAndStoreFarcasterVoters(env: Env) {
  const { KV: kv } = env

  let votersAddresses: string[]
  let farcasterVoters: number[] =
    (await kv.get('lilnouns-farcaster-voters', { type: 'json' })) ?? []
  if (farcasterVoters.length === 0) {
    const now = DateTime.now()
    const blockTimeInSeconds = 12
    const threeMonthsAgo = now.minus({ months: 3 })
    const secondsInThreeMonths = now.diff(threeMonthsAgo, 'seconds').seconds
    const blocksInThreeMonths = secondsInThreeMonths / blockTimeInSeconds

    const startBlock = (await getBlockNumber(env)) - blocksInThreeMonths
    const { voters } = await fetchVoters(env, startBlock)
    votersAddresses = pipe(
      voters,
      map((voter) => voter.id),
    )

    for (const address of votersAddresses) {
      try {
        const { user } = await getUserByVerification(env, address)
        farcasterVoters = pipe(
          [...farcasterVoters, user.fid],
          unique(),
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

    await kv.put('lilnouns-farcaster-voters', JSON.stringify(farcasterVoters), {
      expirationTtl,
    })
  }
}

/**
 * Handles caching of data for LilNouns application.
 * @param env - The environment object containing KV storage.
 * @returns - A promise that resolves when caching is complete.
 */
export async function cacheHandler(env: Env): Promise<void> {
  await Promise.all([
    fetchAndStoreFarcasterUsers(env),
    fetchAndStoreFarcasterVoters(env),
  ])
}
