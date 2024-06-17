import { Item } from './index'

interface Response {
  result: {
    items: Item[]
    latestMainCastTimestamp: number
    feedTopSeenAtTimestamp: number
    replaceFeed: boolean
  }
}

interface FetchFeedItemsArgs {
  feedKey: string
  feedType: string
  olderThan?: number
  latestMainCastTimestamp?: number
  excludeItemIdPrefixes?: string[]
  viewedCastHashes: string
  updateState: boolean
}

/**
 * Fetches feed items from a specified URL using the provided arguments.
 * @async
 * @param args - The arguments to be sent in the request body.
 * @returns A promise that resolves to an array of feed items if the request is successful, otherwise an empty array.
 * @throws {Error} If an HTTP error occurs during the request.
 */
export async function fetchFeedItems(
  args: FetchFeedItemsArgs,
): Promise<Item[]> {
  const url = 'https://client.warpcast.com/v2/feed-items'
  const headers = {
    Authorization: 'Bearer MK-',
    'Content-Type': 'application/json; charset=utf-8',
  }
  const body = JSON.stringify(args)

  const options: RequestInit = {
    method: 'POST',
    headers,
    body,
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status.toString()}`)
    }
    const data = await response.json<Response>()

    return data.result.items
  } catch (error) {
    console.error('Error fetching feed items:', error)
    return []
  }
}
