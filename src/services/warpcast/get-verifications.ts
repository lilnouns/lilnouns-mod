import { fetchRequest, HttpRequestMethod } from '@/services/warpcast/index'
import { Verification } from '@/services/warpcast/types'
import { NonNegative } from 'type-fest'

interface Response {
  result: {
    verifications: Verification[]
  }
}

export const getVerifications = async (
  env: Env,
  fid: number,
  cursor?: string,
  limit: NonNegative<number> = 25,
): Promise<Response> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env

  return await fetchRequest<Response>(
    baseUrl,
    accessToken,
    HttpRequestMethod.GET,
    '/v2/verifications',
    {
      params: {
        fid: fid.toString(),
        cursor: cursor ?? '',
        limit: limit.toString(),
      },
    },
  )
}
