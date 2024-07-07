import { likeCast } from '@/services/warpcast'
import { getCastLikes } from '@/services/warpcast/get-cast-likes'
import { getFeedItems } from '@/services/warpcast/get-feed-items'
import { recast } from '@/services/warpcast/recast'

/**
 * Handles the nouns channel in the given environment.
 * @param env - The environment object.
 * @returns - A promise that resolves with no value.
 */
export async function nounsChannelHandler(env: Env) {
  const users: { fid: number }[] | null = await env.KV.get(
    'lilnouns-farcaster-users',
    {
      type: 'json',
    },
  )

  if (users === null) {
    return
  }

  const lilnouners = users.map((user) => user.fid)
  const { items } = await getFeedItems(env, 'nouns', 'unfiltered')

  for (const item of items) {
    if (!lilnouners.includes(item.cast.author.fid)) {
      continue
    }

    await likeCast(env, item.cast.hash)
  }
}

/**
 * Handles the lilnouns channel by recasting and liking items based on certain conditions.
 * @param env - The environment object containing the necessary configurations.
 * @returns - A promise that resolves once all the items have been processed.
 */
async function lilnounsChannelHandler(env: Env) {
  const owner = 'nekofar.eth'
  const { items } = await getFeedItems(env, 'lilnouns', 'unfiltered')

  for (const item of items) {
    // If the item's cast author is the owner
    if (item.cast.author.username == owner) {
      await recast(env, item.cast.hash)
      await likeCast(env, item.cast.hash)
    }

    // If the number of reactions on the item's cast is greater than 5
    else if (item.cast.reactions.count > 5) {
      await recast(env, item.cast.hash)
      await likeCast(env, item.cast.hash)
    }

    // If the item's cast has at least one reaction
    else if (item.cast.reactions.count > 0) {
      const { likes } = await getCastLikes(env, item.cast.hash)

      for (const like of likes) {
        // If the user who reacted is not the owner
        if (like.reactor.username != owner) {
          continue
        }

        await recast(env, item.cast.hash)
        await likeCast(env, item.cast.hash)
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
  await nounsChannelHandler(env)
  await lilnounsChannelHandler(env)
}
