import { getFollowers as sdkGetFollowers } from '@nekofar/warpcast'
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
}

/**
 * Retrieves followers of a user.
 * @param env - The environment variables containing access token and base URL.
 * @param fid - The ID of the user for whom to retrieve followers.
 * @param [cursor] - The cursor to paginate through the followers (ignored; SDK returns first page only).
 * @param [limit] - The maximum number of followers to retrieve (default: 25).
 * @returns - A promise that resolves to an object containing the retrieved users and the current cursor.
 */
export const getFollowers = async (
  env: Env,
  fid: number,
  cursor?: string,
  limit: IntRange<1, 101> = 25,
): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env
  void cursor

  const { result } = (await sdkGetFollowers({
    baseUrl,
    auth: accessToken,
    query: { fid, limit },
    responseStyle: 'data',
    throwOnError: true,
  })) as unknown as Response

  return { users: result.users, cursor: undefined }
}
