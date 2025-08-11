import { getBlockNumber } from '@/services/ethereum/get-block-number'
import { fetchAccounts } from '@/services/lilnouns/fetch-accounts'
import { fetchDelegates } from '@/services/lilnouns/fetch-delegates'
import { fetchVoters } from '@/services/lilnouns/fetch-voters'
import { logger } from '@/utilities/logger'
import { getUserByVerificationAddress } from '@nekofar/warpcast'
import { DateTime } from 'luxon'
import { chunk, first, isNumber, map, pipe, sortBy, unique } from 'remeda'

const expirationTtl = 60 * 60 * 24

/**
 * Fetches the holder addresses from the KV storage or, if not available,
 * from the account list, and stores them in the KV storage.
 * @param env - The environment object containing the KV storage.
 * @returns - A promise that resolves to an array of holder addresses.
 */
async function fetchHolderAddresses(env: Env): Promise<string[]> {
  const { KV: kv } = env
  const cacheKey = 'lilnouns-holders-addresses'

  logger.info('Loading holder addresses from KV...')
  let holdersAddresses =
    (await kv.get<string[] | null>(cacheKey, { type: 'json' })) ?? []

  if (holdersAddresses.length > 0) {
    logger.debug(
      { addresses: holdersAddresses },
      'Holder addresses loaded from KV.',
    )
    return holdersAddresses
  }

  logger.info('Fetching holder addresses from API...')
  const { accounts } = await fetchAccounts(env)
  holdersAddresses = accounts.map((account) => account.id)

  logger.debug(
    { addresses: holdersAddresses },
    'Fetched holder addresses from API.',
  )
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

  logger.info('Loading delegate addresses from KV...')
  let delegatesAddresses: string[] =
    (await kv.get<string[] | null>(cacheKey, { type: 'json' })) ?? []

  if (delegatesAddresses.length > 0) {
    logger.debug(
      { addresses: delegatesAddresses },
      'Delegate addresses found in KV.',
    )
    return delegatesAddresses
  }

  logger.info('Fetching delegate addresses from API...')
  const { delegates } = await fetchDelegates(env)
  delegatesAddresses = delegates.map((delegate) => delegate.id)

  logger.debug(
    { addresses: delegatesAddresses },
    'Fetched delegate addresses from API.',
  )
  await kv.put(cacheKey, JSON.stringify(delegatesAddresses), { expirationTtl })

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

  logger.info('Loading Farcaster users from KV...')
  let farcasterUsers: number[] =
    (await kv.get<number[] | null>(cacheKey, { type: 'json' })) ?? []

  if (farcasterUsers.length > 0) {
    logger.debug({ users: farcasterUsers }, 'Farcaster users already cached.')
    return
  }

  logger.info('Fetching Farcaster users from API...')
  const holdersAddresses = await fetchHolderAddresses(env)
  const delegatesAddresses = await fetchDelegateAddresses(env)

  const addresses = pipe([...holdersAddresses, ...delegatesAddresses], unique())

  // Process in parallel batches to control concurrency
  const batchSize = 20
  const addressBatches = pipe(addresses, chunk(batchSize))
  const collectedFids: number[] = []

  // Process each batch: concurrently fetch Farcaster users for addresses,
  // map to FIDs (or null), then append numeric FIDs to collectedFids.
  for (const group of addressBatches) {
    const results = await Promise.all(
      group.map(async (address) => {
        logger.debug({ address }, 'Fetching Farcaster user for address.')
        const { data, error } = await getUserByVerificationAddress({
          auth: () => env.WARPCAST_ACCESS_TOKEN,
          query: { address },
        })

        // Handle API error: warn for an expected “No FID has connected” case,
        // otherwise log error, then skip this address by returning null.
        if (error) {
          const primaryError = first(error.errors ?? [])
          const isNoFIDError = primaryError?.message?.startsWith(
            'No FID has connected',
          )
          if (isNoFIDError) {
            logger.warn({ address }, 'No FID has connected')
          } else {
            logger.error({ error, address }, 'Error fetching Farcaster user.')
          }
          return null
        }

        // Validate the API response: if a numeric FID exists, log and return it;
        // otherwise log absence and return null.
        const fid = data.result.user?.fid
        if (typeof fid === 'number') {
          logger.debug({ fid, address }, 'Farcaster user fetched.')
          return fid
        } else {
          logger.debug({ address }, 'No Farcaster user found for address.')
          return null
        }
      }),
    )

    // Filter out null values and add numeric FIDs to collectedFids.
    for (const fid of results) {
      if (isNumber(fid)) {
        collectedFids.push(fid)
      }
    }
  }

  // Sort and deduplicate collectedFids, then store in KV.
  farcasterUsers = pipe(
    [...farcasterUsers, ...collectedFids],
    unique(),
    sortBy((x) => x),
  )
  logger.debug(
    { users: farcasterUsers },
    'Fetched and processed Farcaster users.',
  )

  // Store the sorted and deduplicated list of FIDs in KV.
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

  logger.info('Loading Farcaster voters from KV...')
  let farcasterVoters: number[] =
    (await kv.get<number[] | null>(cacheKey, { type: 'json' })) ?? []

  if (farcasterVoters.length > 0) {
    logger.debug(
      { voters: farcasterVoters },
      'Farcaster voters already cached.',
    )
    return
  }

  const now = DateTime.now()
  const blockTimeInSeconds = 12
  const threeMonthsAgo = now.minus({ months: 3 })
  const secondsInThreeMonths = now.diff(threeMonthsAgo, 'seconds').seconds
  const blocksInThreeMonths = secondsInThreeMonths / blockTimeInSeconds
  const startBlock = (await getBlockNumber(env)) - blocksInThreeMonths

  logger.info('Fetching Farcaster voters from API...')
  const { voters } = await fetchVoters(env, startBlock)
  const addresses = pipe(
    voters,
    map((voter) => voter.id),
  )

  // Process in parallel batches to control concurrency
  const batchSize = 20
  const addressBatches = pipe(addresses, chunk(batchSize))
  const collectedFids: number[] = []

  // Process each batch: concurrently fetch Farcaster users for addresses,
  // map to FIDs (or null), then append numeric FIDs to collectedFids.
  for (const group of addressBatches) {
    const results = await Promise.all(
      group.map(async (address) => {
        logger.debug({ address }, 'Fetching Farcaster user for voter address.')

        // Fetch Farcaster user data for the voter address.
        const { data, error } = await getUserByVerificationAddress({
          auth: () => env.WARPCAST_ACCESS_TOKEN,
          query: { address },
        })

        // Handle error cases from Farcaster API: If error indicates no FID connection,
        // log a warning since this is an expected case. For other errors, log them
        // as errors. In both cases, skip processing this address by returning null.
        if (error) {
          const primaryError = first(error.errors ?? [])
          const isNoFIDError = primaryError?.message?.startsWith(
            'No FID has connected',
          )
          if (isNoFIDError) {
            logger.warn({ address }, 'No FID has connected')
          } else {
            logger.error({ error, address }, 'Error fetching Farcaster user.')
          }
          return null
        }

        // Validate the API response: if a numeric FID exists, log and return it;
        // otherwise log absence and return null.
        const fid = data.result.user?.fid
        if (typeof fid === 'number') {
          logger.debug({ fid, address }, 'Farcaster user fetched for voter.')
          return fid
        } else {
          logger.debug(
            { address },
            'No Farcaster user found for voter address.',
          )
          return null
        }
      }),
    )

    for (const fid of results) {
      if (isNumber(fid)) {
        collectedFids.push(fid)
      }
    }
  }

  // Sort and deduplicate collectedFids, then store in KV.
  farcasterVoters = pipe(
    [...farcasterVoters, ...collectedFids],
    unique(),
    sortBy((x) => x),
  )
  logger.debug(
    { voters: farcasterVoters },
    'Fetched and processed Farcaster voters.',
  )

  // Store the sorted and deduplicated list of FIDs in KV.
  await kv.put(cacheKey, JSON.stringify(farcasterVoters), { expirationTtl })
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
