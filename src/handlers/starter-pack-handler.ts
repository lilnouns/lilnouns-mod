import { getMe } from '@/services/warpcast/get-me'
import { updateStarterPack } from '@/services/warpcast/update-starter-pack'
import { logger } from '@/utilities/logger'
import { getUserStarterPacks } from '@nekofar/warpcast'
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

  const { user } = await getMe(env)
  const firstStarterPack = await fetchFirstMatchingStarterPack(env, user.fid)

  if (!firstStarterPack) {
    logger.warn(
      { event: 'StarterPackLookup', userFid: user.fid },
      'No matching starter pack found',
    )
    return
  }

  const { id, name, description, labels } = firstStarterPack

  // Retry logic with a limit
  const maxRetries = 3
  const retryDelayMs = 5000 // 5 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const { success } = await updateStarterPack(
      env,
      id,
      name,
      description,
      [...farcasterVoters],
      labels,
    )

    if (success) {
      logger.info(
        { event: 'StarterPackUpdate', starterPackId: id },
        'Successfully updated starter pack',
      )
      return
    } else {
      logger.error(
        {
          event: 'StarterPackUpdateError',
          starterPackId: id,
          attempt,
        },
        'Attempt failed to update starter pack',
      )

      if (attempt < maxRetries) {
        logger.info(
          { event: 'RetryDelay', attempt, retryDelayMs },
          'Retrying in a few milliseconds...',
        )
        await delay({ milliseconds: retryDelayMs }) // Wait before retrying
      } else {
        logger.error(
          {
            event: 'StarterPackUpdateFailure',
            starterPackId: id,
            maxRetries,
          },
          'All retry attempts to update starter pack failed',
        )
      }
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
