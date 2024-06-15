import { fetchFeedItems } from '@/services/warpcast/fetch-feed-items'

export async function channelHandler(env: Env) {
  const {} = env

  const items = await fetchFeedItems({
    feedKey: 'lilnouns',
    feedType: 'unfiltered',
    viewedCastHashes: '',
    updateState: true,
  })

  console.log(items)
}
