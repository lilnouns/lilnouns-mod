import { getUserByVerificationAddress as sdkGetUserByVerificationAddress } from '@nekofar/warpcast'
import { User } from '@/services/warpcast/types'

interface Result {
  user: User
}

interface Response {
  result: Result
}

export const getUserByVerification = async (
  env: Env,
  address: string,
): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env

  const { result } = (await sdkGetUserByVerificationAddress({
    baseUrl,
    auth: accessToken,
    query: { address },
    responseStyle: 'data',
    throwOnError: true,
  })) as unknown as Response

  return result
}
