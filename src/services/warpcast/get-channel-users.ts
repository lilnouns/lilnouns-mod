import { getChannelUsers as sdkGetChannelUsers } from '@nekofar/warpcast'
import { User } from '@/services/warpcast/types'
import { IntRange } from 'type-fest'

interface ChannelContext {
  role: 'owner' | 'moderator' | 'member'
  restricted: boolean
  banned: boolean
}

interface UserData {
  user: User
  channelContext: ChannelContext
  invitable: boolean
  relation: 'owner' | 'moderator' | 'member'
  previouslyRemoved: boolean
}

interface Result {
  users: UserData[]
  cursor?: string
}

interface Response {
  result: {
    users: UserData[]
  }
  next?: {
    cursor: string
  }
}

/**
 * Retrieves users of a channel.
 * @param env - The environment variables containing access token and base URL.
 * @param channelKey - The key of the channel for which to retrieve users.
 * @param [filterToMembers] - Whether to filter to only members of the channel.
 * @param [query] - An optional query to filter users.
 * @param [limit] - The maximum number of users to retrieve (default: 20).
 * @returns - A promise that resolves to an object containing the retrieved users and the current cursor.
 */
export const getChannelUsers = async (
  env: Env,
  channelKey: string,
  filterToMembers = true,
  query = '',
  limit: IntRange<1, 101> = 20,
): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env

  const { result, next } = (await sdkGetChannelUsers({
    baseUrl,
    auth: accessToken,
    query: { channelId: channelKey, filterToMembers, query, limit },
    responseStyle: 'data',
    throwOnError: true,
  })) as unknown as Response

  return { users: result.users, cursor: next?.cursor }
}
