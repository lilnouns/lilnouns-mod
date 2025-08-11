import { logger } from '@/utilities/logger'
import {
  getCurrentUser,
  getUserStarterPacks,
  updateStarterPack,
} from '@nekofar/warpcast'
import { filter, first, pipe } from 'remeda'
import { delay } from 'unicorn-magic'

/**
 * Handles the starter pack processing for the provided environment.
 * @param env - Environment configuration for the handler.
 */
export async function starterPackHandler(env: Env): Promise<void> {
  const farcasterVoters = await getFarcasterVoters(env)

  // Prevent update if farcasterVoters is empty
  if (farcasterVoters.length === 0) {
    logger.warn(
      { event: 'StartProcessing', message: 'No Farcaster voters found' },
      'Skipping starter pack update',
    )
    return
  }

  // Fetch current user data
  const { data, error } = await getCurrentUser({
    auth: () => env.WARPCAST_ACCESS_TOKEN,
  })

  // Prevent update if current user data is not found
  if (error) {
    logger.error({ error }, 'Failed to get current user')
    return
  }

  // Check if user has a Farcaster ID
  if (!data.result?.user?.fid) {
    logger.error('No Farcaster ID found for the current user')
    return
  }

  // Fetch the first matching starter pack
  const firstStarterPack = await fetchFirstMatchingStarterPack(
    env,
    data.result.user.fid,
  )

  // Prevent update if no matching starter pack is found
  if (!firstStarterPack) {
    logger.warn(
      { event: 'StarterPackLookup', userFid: data.result.user.fid },
      'No matching starter pack found',
    )
    return
  }

  const { id, name, description, labels } = firstStarterPack

  // Validate required properties
  if (!id || !name || !description || !labels) {
    logger.error(
      { starterPackId: id },
      'Missing required properties in starter pack',
    )
    return
  }

  // Retry logic with a limit
  const maxRetries = 3
  const retryDelayMs = 5000 // 5 seconds

  // Update the starter pack with the new voters
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const { data, error, response } = await updateStarterPack({
      auth: () => env.WARPCAST_ACCESS_TOKEN,
      body: {
        id,
        name,
        description,
        labels,
        fids: [...farcasterVoters],
      },
    })

    if (error) {
      logger.error(
        {
          starterPackId: id,
          attempt,
          error,
        },
        'Failed to update starter pack',
      )

      // Retry only if it's a temporary error (e.g., network issues, rate limits)
      if (attempt < maxRetries && response.status >= 500) {
        continue
      }
      return
    }

    // Check if the update was successful
    if (data.result.starterPack) {
      logger.info(
        { event: 'StarterPackUpdate', starterPackId: id },
        'Successfully updated starter pack',
      )
      return
    }

    logger.error(
      { starterPackId: id, attempt },
      'Attempt failed to update starter pack',
    )

    // Retry only if it's a temporary error (e.g., network issues, rate limits)'
    if (attempt < maxRetries) {
      logger.info(
        { event: 'RetryDelay', attempt, retryDelayMs },
        'Retrying in a few milliseconds...',
      )
      await delay({ milliseconds: retryDelayMs }) // Wait before retrying
    } else {
      logger.error(
        {
          starterPackId: id,
          maxRetries,
        },
        'All retry attempts to update starter pack failed',
      )
    }
  }
}

/**
 * Retrieves the list of Farcaster voters from the KV storage.
 * @param env - Environment configuration containing the KV namespace.
 * @returns A list of Farcaster voter IDs or an empty array if none are found.
 */
async function getFarcasterVoters(env: Env): Promise<number[]> {
  const { KV: kv } = env
  return (
    (await kv.get<number[] | null>('lilnouns-farcaster-voters', {
      type: 'json',
    })) ?? []
  )
}

/**
 * Fetches the first starter pack that matches the "Nouns-Radar" prefix.
 * @param env - Environment configuration.
 * @param fid - The Farcaster ID of the current user.
 * @returns The first matching starter pack or `null` if no match is found.
 */
async function fetchFirstMatchingStarterPack(env: Env, fid: number) {
  const { data, error } = await getUserStarterPacks({
    auth: () => env.WARPCAST_ACCESS_TOKEN,
    query: {
      fid,
    },
  })

  if (error) {
    logger.error({ error }, 'Failed to fetch starter packs')
    return null
  }

  return pipe(
    data.result.starterPacks,
    filter((pack) => pack.id.startsWith('Lil-Legends')),
    first(),
  )
}
