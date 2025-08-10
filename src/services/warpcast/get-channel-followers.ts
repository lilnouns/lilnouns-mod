import { getChannelFollowers as sdkGetChannelFollowers } from '@nekofar/warpcast'
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

  const { result, next } = (await sdkGetChannelFollowers({
    baseUrl,
    auth: accessToken,
    query: { channelId: channelKey, cursor, limit },
    responseStyle: 'data',
    throwOnError: true,
  })) as unknown as Response

  return { users: result.users, cursor: next?.cursor }
}
