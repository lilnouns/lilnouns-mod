import { getVerifications as sdkGetVerifications } from '@nekofar/warpcast'
import { Verification } from '@/services/warpcast/types'
import { NonNegative } from 'type-fest'

interface Result {
  verifications: Verification[]
}

interface Response {
  result: Result
}

export const getVerifications = async (
  env: Env,
  fid: number,
  cursor?: string,
  limit: NonNegative<number> = 25,
): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env
  void cursor

  const { result } = (await sdkGetVerifications({
    baseUrl,
    auth: accessToken,
    query: { fid, limit },
    responseStyle: 'data',
    throwOnError: true,
  })) as unknown as Response

  return result
}
