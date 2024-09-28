import { likeCast } from '@/services/warpcast'
import { getCastLikes } from '@/services/warpcast/get-cast-likes'
import { getFeedItems } from '@/services/warpcast/get-feed-items'
import { recast } from '@/services/warpcast/recast'
import { map, pipe } from 'remeda'

// eslint-disable-next-line jsdoc/require-returns-check
/**
 * Logs a debug message to the console with optional additional arguments.
 * @param message - The debug message to log.
 * @param args - Additional arguments to include in the log.
 * @returns This function does not return a value.
 */
function logDebug(message: string, ...args: unknown[]): void {
  console.log(`[DEBUG] ${message}`, ...args)
}

/**
 * Fetches recent feed items for a given feed key and type.
 * @param env - The environment configuration object.
 * @param feedKey - The key identifying the feed.
 * @param feedType - The type of feed to fetch items from.
 * @returns An object containing an array of the fetched feed items.
 */
async function getRecentFeedItems(env: Env, feedKey: string, feedType: string) {
  logDebug(`Fetching ${feedKey} feed items`)
  const allItems: Awaited<ReturnType<typeof getFeedItems>>['items'] = []
  let fetchedItemsCount = 0
  const maxItems = 300

  let excludeItemIdPrefixes: string[] = []

  while (fetchedItemsCount < maxItems) {
    logDebug(
      'Fetching feed items with excludeItemIdPrefixes:',
      excludeItemIdPrefixes,
    )
    const { items } = await getFeedItems(
      env,
      feedKey,
      feedType,
      excludeItemIdPrefixes,
    )

    // Add the new items to the total collection.
    allItems.push(...items)
    fetchedItemsCount += items.length

    if (items.length === 0) {
      // No more items to fetch, exit the loop.
      logDebug('No more items to fetch')
      break
    }

    // Add new prefixes to `excludeItemIdPrefixes` without resetting it.
    const newPrefixes = pipe(
      items,
      map((item) => item.cast.hash.replace(/^0x/, '').slice(0, 8)),
    )
    excludeItemIdPrefixes = excludeItemIdPrefixes.concat(newPrefixes)
  }

  logDebug('Fetched total items:', fetchedItemsCount)
  return { items: allItems }
}

/**
 * Handles the nouns channel in the given environment.
 * @param env - The environment object.
 * @returns - A promise that resolves with no value.
 */
export async function handleNounsChannel(env: Env) {
  logDebug('Handling nouns channel')
  const { KV: kv } = env

  const farcasterUsers: number[] =
    (await kv.get('lilnouns-farcaster-users', { type: 'json' })) ?? []

  logDebug('Farcaster users:', farcasterUsers)

  if (farcasterUsers.length === 0) {
    logDebug('No farcaster users found')
    return
  }

  const { items } = await getRecentFeedItems(env, 'nouns', 'default')

  for (const item of items) {
    logDebug('Processing item:', item)
    if (!farcasterUsers.includes(item.cast.author.fid)) {
      logDebug('Item author not in farcaster users:', item.cast.author.fid)
      continue
    }

    await likeCast(env, item.cast.hash)
    logDebug('Liked cast:', item.cast.hash)
  }
}

/**
 * Handles the lilnouns channel by recasting and liking items based on certain conditions.
 * @param env - The environment object containing the necessary configurations.
 * @returns - A promise that resolves once all the items have been processed.
 */
async function handleLilNounsChannel(env: Env) {
  logDebug('Handling lilnouns channel')
  const owner = 'nekofar.eth'
  const { items } = await getRecentFeedItems(env, 'lilnouns', 'default')

  for (const item of items) {
    logDebug('Processing item:', item)

    // If the item's cast author is the owner
    if (item.cast.author.username == owner) {
      await recast(env, item.cast.hash)
      logDebug('Recasted by owner:', item.cast.hash)
      await likeCast(env, item.cast.hash)
      logDebug('Liked cast by owner:', item.cast.hash)
    }

    // If the number of reactions on the item's cast is greater than 5
    else if (item.cast.reactions.count > 5) {
      await recast(env, item.cast.hash)
      logDebug('Recast due to reactions > 5:', item.cast.hash)
      await likeCast(env, item.cast.hash)
      logDebug('Liked cast due to reactions > 5:', item.cast.hash)
    }

    // If the item's cast has at least one reaction
    else if (item.cast.reactions.count > 0) {
      const { likes } = await getCastLikes(env, item.cast.hash)
      logDebug('Fetched likes for cast:', item.cast.hash, likes)

      for (const like of likes) {
        // If the user who reacted is not the owner
        if (like.reactor.username != owner) {
          continue
        }

        await recast(env, item.cast.hash)
        logDebug('Recasted due to owner reaction:', item.cast.hash)
        await likeCast(env, item.cast.hash)
        logDebug('Liked cast due to owner reaction:', item.cast.hash)
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
