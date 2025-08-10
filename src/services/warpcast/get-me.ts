import { getCurrentUser } from '@nekofar/warpcast'
import { User } from '@/services/warpcast/types'

interface Result {
  user: User
}

interface Response {
  result: Result
}

export const getMe = async (env: Env): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env

  const { result } = (await getCurrentUser({
    baseUrl,
    auth: accessToken,
    responseStyle: 'data',
    throwOnError: true,
  })) as unknown as Response

  return result
}
