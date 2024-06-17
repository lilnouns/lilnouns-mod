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

export async function fetchFeedItems(args: FetchFeedItemsArgs): Promise<Item[]> {
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
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const data = await response.json<Response>()

    return data.result.items as Item[]
  } catch (error) {
    console.error('Error fetching feed items:', error)
    return []
  }
}
