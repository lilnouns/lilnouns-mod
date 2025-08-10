import { fetchRequest, HttpRequestMethod } from '@/services/warpcast/index'
import { User } from '@/services/warpcast/types'
import { IntRange } from 'type-fest'

interface Result {
  users: User[]
  cursor?: string
}

interface Response {
  result: {
    users: User[]
  }
  next?: {
    cursor: string
  }
}

/**
 * Retrieves the owners of a collection.
 *
 * NOTE: This endpoint is not currently exposed by @nekofar/warpcast SDK (v2.0.0-alpha.42),
 * so we use the legacy fetchRequest helper against Warpcast HTTP API.
 * @param env - The environment variables containing access token and base URL.
 * @param collectionId - The ID of the collection.
 * @param [cursor] - The cursor to paginate through the owners.
 * @param [limit] - The maximum number of owners to retrieve (default: 25).
 * @returns - A promise that resolves to an object containing the retrieved users and the current cursor.
 */
export const getCollectionOwners = async (
  env: Env,
  collectionId: string,
  cursor?: string,
  limit: IntRange<1, 101> = 25,
): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env
  let newCursor = cursor ?? ''
  let users: User[] = []
  let response: Response

  do {
    const params = {
      collectionId,
      cursor: newCursor,
      limit: String(limit),
    }

    response = await fetchRequest<Response>(
      baseUrl,
      accessToken,
      HttpRequestMethod.GET,
      '/v2/collection-owners',
      { params },
    )

    users = [...users, ...response.result.users]
    newCursor = response.next ? response.next.cursor : ''
  } while (response.next && users.length < limit)

  return { users: users.slice(0, limit), cursor: newCursor }
}
