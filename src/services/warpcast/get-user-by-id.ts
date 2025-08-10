import { getUserByFid as sdkGetUserByFid } from '@nekofar/warpcast'
import { User } from '@/services/warpcast/types'

interface Result {
  user: User
  extras: {
    fid: number
    custodyAddress: string
    ethWallets: string[]
    solanaWallets: string[]
  }
  collectionsOwned: string[]
}

interface Response {
  result: Result
}

/**
 * Fetches a user by their FID (Farcaster ID) using the Warpcast SDK.
 * @async
 * @param env - The environment object containing API configuration, including `WARPCAST_ACCESS_TOKEN` and `WARPCAST_BASE_URL`.
 * @param fid - The Farcaster ID of the user to retrieve.
 * @returns A promise resolving to the result containing the user data.
 * @throws Will throw an error if the SDK call fails.
 */
export const getUserByFid = async (env: Env, fid: number): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env

  const { result } = (await sdkGetUserByFid({
    baseUrl,
    auth: accessToken,
    query: { fid },
    responseStyle: 'data',
    throwOnError: true,
  })) as unknown as Response

  return result
}
