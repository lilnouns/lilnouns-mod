import { likeCast } from '@/services/warpcast'
import { getCastLikes } from '@/services/warpcast/get-cast-likes'
import { getFeedItems } from '@/services/warpcast/get-feed-items'
import { recast } from '@/services/warpcast/recast'

/**
 * Handles the channel based on the given environment.
 * @param env - The environment object containing channel details.
 * @returns - A Promise that resolves when the channel handler has completed execution.
 */
export async function channelHandler(env: Env) {
  const owner = 'nekofar.eth'
  const { items } = await getFeedItems(env, 'lilnouns', 'unfiltered')

  for (const item of items) {
    if (item.cast.author.username == owner) {
      await recast(env, item.cast.hash)
      await likeCast(env, item.cast.hash)
    } else if (item.cast.reactions.count > 5) {
      await recast(env, item.cast.hash)
      await likeCast(env, item.cast.hash)
    } else if (item.cast.reactions.count > 0) {
      const { likes } = await getCastLikes(env, item.cast.hash)

      for (const like of likes) {
        if (like.reactor.username != owner) {
          continue
        }
        await recast(env, item.cast.hash)
        await likeCast(env, item.cast.hash)
      }
    }
  }
}
