import { getBlockNumber } from '@/services/ethereum/get-block-number'
import { fetchAccounts } from '@/services/lilnouns/fetch-accounts'
import { fetchDelegates } from '@/services/lilnouns/fetch-delegates'
import { fetchVoters } from '@/services/lilnouns/fetch-voters'
import { getUserByVerification } from '@/services/warpcast/get-user-by-verification'
import { logger } from '@/utilities/logger'
import { DateTime } from 'luxon'
import { map, pipe, sortBy, unique } from 'remeda'

const expirationTtl = 60 * 60 * 24

/**
 * Fetches the holder addresses from the KV storage or, if not available,
 * from the accounts list, and stores them in the KV storage.
 * @param env - The environment object containing the KV storage.
 * @returns - A promise that resolves to an array of holder addresses.
 */
async function fetchHolderAddresses(env: Env): Promise<string[]> {
  const { KV: kv } = env
  const cacheKey = 'lilnouns-holders-addresses'

  let holdersAddresses =
    (await kv.get<string[] | null>(cacheKey, { type: 'json' })) ?? []

  if (holdersAddresses.length !== 0) {
    logger.debug(
      { addresses: holdersAddresses },
      'Holder addresses found in KV storage:',
    )
    return holdersAddresses
  }

  logger.info('Holder addresses not found in KV storage, fetching from API...')
  const { accounts } = await fetchAccounts(env)
  holdersAddresses = accounts.map((account) => account.id)

  logger.debug({ addresses: holdersAddresses }, 'Fetched holder addresses')
  await kv.put(cacheKey, JSON.stringify(holdersAddresses), { expirationTtl })

  return holdersAddresses
}

/**
 * Fetches delegate addresses from the KVNamespace.
 * If addresses are not available, fetches them from an external environment
 * and stores them in the KVNamespace.
 * @param env - The environment configuration used to fetch delegate data.
 * @returns A promise that resolves to an array of delegate addresses.
 */
async function fetchDelegateAddresses(env: Env): Promise<string[]> {
  const { KV: kv } = env
  const cacheKey = 'lilnouns-delegates-addresses'

  logger.info('Fetching delegate addresses from KV storage...')
  let delegatesAddresses: string[] =
    (await kv.get<string[] | null>(cacheKey, { type: 'json' })) ?? []

  if (delegatesAddresses.length > 0) {
    logger.debug(
      { addresses: delegatesAddresses },
      'Delegate addresses found in KV storage',
    )
    return delegatesAddresses
  }

  logger.info(
    'Delegate addresses not found in KV storage, fetching from API...',
  )
  const { delegates } = await fetchDelegates(env)
  delegatesAddresses = delegates.map((delegate) => delegate.id)

  logger.debug({ addresses: delegatesAddresses }, 'Fetched delegate addresses')
  await kv.put(cacheKey, JSON.stringify(delegatesAddresses), {
    expirationTtl,
  })

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
async function fetchAndStoreFarcasterUsers(env: Env): Promise<void> {
  const { KV: kv } = env
  const cacheKey = 'lilnouns-farcaster-users'

  logger.info('Fetching Farcaster users from KV storage...')
  const holdersAddresses = await fetchHolderAddresses(env)
  const delegatesAddresses = await fetchDelegateAddresses(env)

  let farcasterUsers: number[] =
    (await kv.get<number[] | null>(cacheKey, { type: 'json' })) ?? []

  if (farcasterUsers.length > 0) {
    logger.debug({ users: farcasterUsers }, 'Farcaster users already stored')
    return
  }

  logger.info('No Farcaster users found in KV storage, fetching from API...')
  const addresses = pipe([...holdersAddresses, ...delegatesAddresses], unique())

  for (const address of addresses) {
    try {
      logger.debug({ address }, `Fetching Farcaster user for address`)
      const { user } = await getUserByVerification(env, address)
      farcasterUsers = pipe(
        [...farcasterUsers, user.fid],
        unique(),
        sortBy((fid) => fid),
      )
      logger.debug(
        { fid: user.fid, address },
        `Fetched Farcaster user for address`,
      )
    } catch (error) {
      if (
        error instanceof Error &&
        !error.message.startsWith('No FID has connected')
      ) {
        logger.error({ error }, `An error occurred`)
      }
    }
  }

  farcasterUsers = pipe(
    farcasterUsers,
    unique(),
    sortBy((fid) => fid),
  )

  logger.debug(
    { users: farcasterUsers },
    'Fetched and processed Farcaster users',
  )
  await kv.put(cacheKey, JSON.stringify(farcasterUsers), { expirationTtl })
}

/**
 * Fetches and stores Farcaster voters' addresses and FIDs
 * (Farcaster IDs) in the given key-value store.
 * @param env - The environment object containing configuration and KV store.
 * @returns A Promise that resolves when the operation is completed.
 */
async function fetchAndStoreFarcasterVoters(env: Env) {
  const { KV: kv } = env
  const cacheKey = 'lilnouns-farcaster-voters'

  logger.info('Fetching Farcaster voters from KV storage...')
  let farcasterVoters: number[] =
    (await kv.get(cacheKey, { type: 'json' })) ?? []

  if (farcasterVoters.length > 0) {
    logger.debug({ voters: farcasterVoters }, 'Farcaster voters already stored')
    return
  }

  const now = DateTime.now()
  const blockTimeInSeconds = 12
  const threeMonthsAgo = now.minus({ months: 3 })
  const secondsInThreeMonths = now.diff(threeMonthsAgo, 'seconds').seconds
  const blocksInThreeMonths = secondsInThreeMonths / blockTimeInSeconds
  const startBlock = (await getBlockNumber(env)) - blocksInThreeMonths

  logger.info('No Farcaster voters found in KV storage, fetching from API...')
  const { voters } = await fetchVoters(env, startBlock)
  const addresses: string[] = pipe(
    voters,
    map((voter) => voter.id),
  )

  for (const address of addresses) {
    try {
      logger.debug({ address }, `Fetching Farcaster user for address`)
      const { user } = await getUserByVerification(env, address)
      farcasterVoters = pipe(
        [...farcasterVoters, user.fid],
        unique(),
        sortBy((fid) => fid),
      )
      logger.debug(
        { fid: user.fid, address },
        `Fetched Farcaster user for address`,
      )
    } catch (error) {
      if (
        error instanceof Error &&
        !error.message.startsWith('No FID has connected')
      ) {
        logger.error({ error }, `An error occurred`)
      }
    }
  }

  logger.debug(
    { voters: farcasterVoters },
    'Fetched and processed Farcaster voters',
  )
  await kv.put(cacheKey, JSON.stringify(farcasterVoters), {
    expirationTtl,
  })
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
