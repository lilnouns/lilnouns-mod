import { likeCast } from '@/services/warpcast'
import { fetchFeedItems } from '@/services/warpcast/fetch-feed-items'
import { getCastLikes } from '@/services/warpcast/get-cast-likes'

/**
 * Handles the channel based on the given environment.
 * @param env - The environment object containing channel details.
 * @returns - A Promise that resolves when the channel handler has completed execution.
 */
export async function channelHandler(env: Env) {
  const owner = 'nekofar.eth'
  const items = await fetchFeedItems({
    feedKey: 'lilnouns',
    feedType: 'unfiltered',
    viewedCastHashes: '',
    updateState: true,
  })

  for (const item of items) {
    if (item.cast.author.username == owner) {
      await likeCast(env, item.cast.hash)
    } else if (item.cast.reactions.count > 5) {
      await likeCast(env, item.cast.hash)
    } else if (item.cast.reactions.count > 0) {
      const {
        result: { likes },
      } = await getCastLikes(env, item.cast.hash)

      for (const like of likes) {
        if (like.reactor.username != owner) {
          continue
        }
        await likeCast(env, item.cast.hash)
      }
    }
  }
}
