import { getFeedItems as sdkGetFeedItems } from '@nekofar/warpcast'
import { Item } from './types'

interface Result {
  items: Item[]
  latestMainCastTimestamp: number
  feedTopSeenAtTimestamp: number
  replaceFeed: boolean
}

interface Response {
  result: Result
}

/**
 * Fetches feed items based on the given parameters.
 * @param env - The environment variables containing access token and base URL.
 * @param feedKey - The key identifying the feed to retrieve items from.
 * @param feedType - The type of the feed.
 * @param [excludeItemIdPrefixes] - Optional prefixes to exclude specific item IDs.
 * @returns - A promise that resolves to the result of the request.
 */
export const getFeedItems = async (
  env: Env,
  feedKey: string,
  feedType: string,
  excludeItemIdPrefixes?: string[],
): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env

  const { result } = (await sdkGetFeedItems({
    baseUrl,
    auth: accessToken,
    body: { feedKey, feedType, excludeItemIdPrefixes },
    responseStyle: 'data',
    throwOnError: true,
  })) as unknown as Response

  return result
}
