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
 * Retrieves following of a user.
 * @param env - The environment variables containing access token and base URL.
 * @param fid - The ID of the user for whom to retrieve following.
 * @param [cursor] - The cursor to paginate through the following.
 * @param [limit] - The maximum number of following to retrieve (default: 25).
 * @returns - A promise that resolves to an object containing the retrieved users and the current cursor.
 */
export const getFollowing = async (
  env: Env,
  fid: number,
  cursor?: string,
  limit: IntRange<1, 101> = 25,
): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env
  let newCursor = cursor ?? ''
  let users: User[] = []
  let response: Response

  do {
    const params = {
      fid: fid.toString(),
      cursor: newCursor,
      limit: String(limit),
    }

    response = await fetchRequest<Response>(
      baseUrl,
      accessToken,
      HttpRequestMethod.GET,
      '/v2/following',
      { params },
    )

    users = [...users, ...response.result.users]
    newCursor = response.next ? response.next.cursor : ''
  } while (response.next && users.length < limit)

  return { users: users.slice(0, limit), cursor: newCursor }
}
