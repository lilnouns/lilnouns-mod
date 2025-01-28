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
 * Retrieves followers of a channel.
 * @param env - The environment variables containing access token and base URL.
 * @param channelKey - The key of the channel for which to retrieve followers.
 * @param [cursor] - The cursor to paginate through the followers.
 * @param [limit] - The maximum number of followers to retrieve (default: 15).
 * @returns - A promise that resolves to an object containing the retrieved users and the current cursor.
 */
export const getChannelFollowers = async (
  env: Env,
  channelKey: string,
  cursor?: string,
  limit: IntRange<1, 101> = 15,
): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env
  let newCursor = cursor ?? ''
  let users: User[] = []
  let response: Response

  do {
    const params = {
      channelKey,
      cursor: newCursor,
      limit: String(limit),
    }

    response = await fetchRequest<Response>(
      baseUrl,
      accessToken,
      HttpRequestMethod.GET,
      '/v2/channel-followers',
      { params },
    )

    users = [...users, ...response.result.users]
    newCursor = response.next ? response.next.cursor : ''
  } while (response.next && users.length < limit)

  return { users: users.slice(0, limit), cursor: newCursor }
}
