import { logger } from '@/utilities/logger'
import {
  getCastLikes,
  getCurrentUser,
  getFeedItems,
  likeCast,
  recastCast,
} from '@nekofar/warpcast'
import { filter, map, pipe } from 'remeda'

/**
 * Fetches recent feed items for a given feed key and type.
 * @param env - The environment configuration object.
 * @param feedKey - The key identifying the feed.
 * @param feedType - The type of feed to fetch items from.
 * @returns An object containing an array of the fetched feed items.
 */
async function getRecentFeedItems(env: Env, feedKey: string, feedType: string) {
  logger.debug({ feedKey }, `Fetching feed items`)
  const allItems = []
  let fetchedItemsCount = 0
  const maxItems = 300

  let excludeItemIdPrefixes: string[] = []

  while (fetchedItemsCount < maxItems) {
    logger.debug({ excludeItemIdPrefixes }, 'Fetching feed items')
    const { data, error } = await getFeedItems({
      auth: () => env.WARPCAST_ACCESS_TOKEN,
      body: { feedKey, feedType, excludeItemIdPrefixes },
    })

    if (error) {
      logger.error(
        {
          error,
          feedKey,
          feedType,
          excludeItemIdPrefixes,
        },
        'Error fetching feed items',
      )
      return { items: [] }
    }

    // Normalize possibly-undefined to a safe default to avoid unsafe optional chaining.
    const items = data.result.items

    // Add the new items to the total collection.
    allItems.push(...items)
    fetchedItemsCount += items.length

    if (items.length === 0) {
      // No more items to fetch, exit the loop.
      logger.info('No more items to fetch')
      break
    }

    // Add new prefixes to `excludeItemIdPrefixes` without resetting it.
    const newPrefixes = pipe(
      items,
      map((item) => item.cast.hash.replace(/^0x/, '').slice(0, 8)),
    )
    excludeItemIdPrefixes = excludeItemIdPrefixes.concat(newPrefixes)
  }

  logger.debug({ fetchedItemsCount }, 'Fetched total items')
  return { items: allItems }
}

/**
 * Handles the noun channel in the given environment.
 * @param env - The environment object.
 * @returns - A promise that resolves with no value.
 */
export async function handleNounsChannel(env: Env) {
  logger.info('Handling nouns channel')
  const { KV: kv } = env

  // Fetch the current user
  logger.info('Fetching current user')
  const { data, error } = await getCurrentUser({
    auth: () => env.WARPCAST_ACCESS_TOKEN,
  })

  if (error) {
    logger.error(
      {
        error,
      },
      'Failed to get current user',
    )
    return
  }

  const user = data.result.user

  const farcasterUsers: number[] =
    (await kv.get('lilnouns-farcaster-users', { type: 'json' })) ?? []

  logger.debug({ users: farcasterUsers }, 'Farcaster users')

  if (farcasterUsers.length === 0) {
    logger.info('No farcaster users found')
    return
  }

  const { items } = await getRecentFeedItems(env, 'nouns', 'default')

  for (const item of items) {
    logger.debug({ item }, 'Processing item')

    // Fetch likes for the cast item
    const castHash = item.cast.hash
    logger.debug({ hash: castHash }, 'Fetching likes for item')
    const { data, error } = await getCastLikes({
      auth: () => env.WARPCAST_ACCESS_TOKEN,
      query: {
        castHash,
      },
    })

    if (error) {
      logger.error({ error, castHash }, 'Error fetching cast likes')
      continue
    }

    const likerIds = pipe(
      data.result?.likes ?? [],
      map((like) => like.reactor?.fid),
      filter((id): id is number => id !== undefined),
    )

    // Skip if the current user already liked the item
    if (likerIds.includes(user.fid)) {
      logger.debug({ hash: castHash }, 'Current user already liked the item:')
      continue
    }

    if (!farcasterUsers.includes(item.cast.author.fid)) {
      logger.debug(
        { fid: item.cast.author.fid },
        'Item author not in farcaster users:',
      )
      continue
    }

    await likeCast({
      auth: () => env.WARPCAST_ACCESS_TOKEN,
      body: {
        castHash,
      },
    })
    logger.debug({ hash: castHash }, 'Liked cast')
  }
}

/**
 * Handles the lilnouns channel by recasting and liking items based on certain conditions.
 * @param env - The environment object containing the necessary configurations.
 * @returns - A promise that resolves once all the items have been processed.
 */
async function handleLilNounsChannel(env: Env) {
  logger.info('Handling lilnouns channel')
  const owner = 'nekofar.eth'
  const { items } = await getRecentFeedItems(env, 'lilnouns', 'default')

  logger.info('Fetching current user')
  const { data, error } = await getCurrentUser({
    auth: () => env.WARPCAST_ACCESS_TOKEN,
  })

  if (error) {
    logger.error(
      {
        error,
      },
      'Failed to get current user',
    )
    return
  }

  const user = data.result.user

  for (const item of items) {
    logger.debug({ item }, 'Processing item')
    const hash = item.cast.hash

    logger.debug({ hash }, 'Fetching likes for item')
    const { data, error } = await getCastLikes({
      auth: () => env.WARPCAST_ACCESS_TOKEN,
      query: {
        castHash: hash,
      },
    })

    if (error) {
      logger.error({ error, hash }, 'Error fetching cast likes')
      continue
    }

    const likerIds = pipe(
      data.result?.likes ?? [],
      map((like) => like.reactor?.fid),
      filter((id): id is number => id !== undefined),
    )

    // Skip if the current user already liked the item
    if (likerIds.includes(user.fid)) {
      logger.debug({ hash }, 'Current user already liked the item:')
      continue
    }

    // If the item's cast author is the owner
    if (item.cast.author.username == owner) {
      await recastCast({
        auth: () => env.WARPCAST_ACCESS_TOKEN,
        body: {
          castHash: hash,
        },
      })
      logger.debug({ hash }, 'Re-casted by owner')
      await likeCast({
        auth: () => env.WARPCAST_ACCESS_TOKEN,
        body: {
          castHash: hash
        }
      })
      logger.debug({ hash }, 'Liked cast by owner')
    }

    // If the number of reactions on the item's cast is greater than 5
    else if (item.cast.reactions.count > 5) {
      await recastCast({
        auth: () => env.WARPCAST_ACCESS_TOKEN,
        body: {
          castHash: hash
        }
      })
      logger.debug({ hash }, 'Recast due to reactions > 5')
      await likeCast({
        auth: () => env.WARPCAST_ACCESS_TOKEN,
        body: {
          castHash: hash
        }
      })
      logger.debug({ hash }, 'Liked cast due to reactions > 5')
    }

    // If the item's cast has at least one reaction
    else if (item.cast.reactions.count > 0) {
      for (const like of data.result?.likes ?? []) {
        // If the user who reacted is not the owner
        if (like.reactor?.username != owner) {
          continue
        }

        await recastCast({
          auth: () => env.WARPCAST_ACCESS_TOKEN,
          body: {
            castHash: hash
          }
        })
        logger.debug({ hash }, 'Re-casted due to owner reaction')
        await likeCast({
          auth: () => env.WARPCAST_ACCESS_TOKEN,
          body: {
            castHash: hash
          }
        })
        logger.debug({ hash }, 'Liked cast due to owner reaction')
      }
    }
  }
}

/**
 * Handles the channel based on the given environment.
 * @param env - The environment object containing channel details.
 * @returns A Promise that resolves when the channel handler has completed execution.
 */
export async function channelHandler(env: Env) {
  await handleNounsChannel(env)
  await handleLilNounsChannel(env)
}
