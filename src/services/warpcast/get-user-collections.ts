import { fetchRequest, HttpRequestMethod } from '@/services/warpcast/index'
import { Collection } from '@/services/warpcast/types'
import { IntRange } from 'type-fest'

interface Result {
  collections: Collection[]
  cursor?: string
}

interface Response {
  result: {
    collections: Collection[]
  }
  next?: {
    cursor: string
  }
}

/**
 * Retrieves the collections of a user by their Farcaster ID.
 *
 * NOTE: This endpoint is not currently exposed by @nekofar/warpcast SDK (v2.0.0-alpha.42),
 * so we use the legacy fetchRequest helper against Warpcast HTTP API.
 * @param env - The environment variables containing access token and base URL.
 * @param ownerFid - The Farcaster ID of the user.
 * @param [cursor] - The cursor to paginate through the collections.
 * @param [limit] - The maximum number of collections to retrieve (default: 25).
 * @returns - A promise that resolves to an object containing the retrieved collections and the current cursor.
 */
export const getUserCollections = async (
  env: Env,
  ownerFid: number,
  cursor?: string,
  limit: IntRange<1, 101> = 25,
): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env
  let newCursor = cursor ?? ''
  let collections: Collection[] = []
  let response: Response

  do {
    const params = {
      ownerFid: ownerFid.toString(),
      cursor: newCursor,
      limit: String(limit),
    }

    response = await fetchRequest<Response>(
      baseUrl,
      accessToken,
      HttpRequestMethod.GET,
      '/v2/user-collections',
      { params },
    )

    collections = [...collections, ...response.result.collections]
    newCursor = response.next ? response.next.cursor : ''
  } while (response.next && collections.length < limit)

  return { collections: collections.slice(0, limit), cursor: newCursor }
}
