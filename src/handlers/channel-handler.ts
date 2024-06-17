import { fetchFeedItems } from '@/services/warpcast/fetch-feed-items'

/**
 * Handles the channel based on the given environment.
 * @param env - The environment object containing channel details.
 * @returns - A Promise that resolves when the channel handler has completed execution.
 */
export async function channelHandler(env: Env) {
  // eslint-disable-next-line no-empty-pattern
  const {} = env

  const items = await fetchFeedItems({
    feedKey: 'lilnouns',
    feedType: 'unfiltered',
    viewedCastHashes: '',
    updateState: true,
  })

  for (const item of items) {
    if (item.cast.author.username == 'lilnouns') {
      console.log(item)
    }

    if (item.cast.author.username == 'nekofar.eth') {
      console.log(item)
    }

    if (item.cast.reactions.count > 5) {
      console.log(item)
    }
  }

  console.log(items)
}
