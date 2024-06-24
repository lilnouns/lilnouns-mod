import { fetchRequest, HttpRequestMethod } from '@/services/warpcast/index'
import { Item } from './types'

interface Response {
  result: {
    items: Item[]
    latestMainCastTimestamp: number
    feedTopSeenAtTimestamp: number
    replaceFeed: boolean
  }
}

/**
 * Fetches feed items from a specified URL using the provided arguments.
 * @async
 * @param env - The environment settings.
 * @param feedKey - The key of the feed.
 * @param feedType - The type of the feed.
 * @returns - A promise that resolves to an array of feed items if the request is successful, otherwise an empty array.
 * @throws {Error} If an HTTP error occurs during the request.
 */
export const getFeedItems = async (
  env: Env,
  feedKey: string,
  feedType: string,
): Promise<Response> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env

  return await fetchRequest<Response>(
    baseUrl,
    accessToken,
    HttpRequestMethod.POST,
    '/v2/feed-items',
    {
      json: { feedKey, feedType },
    },
  )
}
