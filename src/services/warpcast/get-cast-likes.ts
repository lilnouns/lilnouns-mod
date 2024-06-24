import { fetchRequest, HttpRequestMethod } from '@/services/warpcast/index'
import { Like } from '@/services/warpcast/types'
import type { NonNegative } from 'type-fest'

interface Response {
  result: {
    likes: Like[]
    cursor?: string
  }
}

export const getCastLikes = async (
  env: Env,
  castHash: string,
  cursor?: string,
  limit: NonNegative<number> = 25,
): Promise<Response> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env

  return await fetchRequest<Response>(
    baseUrl,
    accessToken,
    HttpRequestMethod.GET,
    '/v2/cast-likes',
    {
      params: { castHash, cursor: cursor ?? '', limit: limit.toString() },
    },
  )
}
