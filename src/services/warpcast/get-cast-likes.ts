import { getCastLikes as sdkGetCastLikes } from '@nekofar/warpcast'
import { Like } from '@/services/warpcast/types'
import type { NonNegative } from 'type-fest'

interface Result {
  likes: Like[]
  cursor?: string
}

interface Response {
  result: Result
}

/**
 * Retrieves the likes for a given cast.
 * @async
 * @param env - The environment configuration object.
 * @param castHash - The hash of the cast.
 * @param [cursor] - The cursor for pagination (ignored; SDK returns first page only).
 * @param [limit] - The limit of results per page.
 * @returns - A promise that resolves to the response of the request.
 */
export const getCastLikes = async (
  env: Env,
  castHash: string,
  cursor?: string,
  limit: NonNegative<number> = 25,
): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env
  void cursor

  const { result } = (await sdkGetCastLikes({
    baseUrl,
    auth: accessToken,
    query: { castHash, limit },
    responseStyle: 'data',
    throwOnError: true,
  })) as unknown as Response

  return result
}
