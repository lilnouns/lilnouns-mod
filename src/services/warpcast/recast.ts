import { recastCast as sdkRecastCast } from '@nekofar/warpcast'

interface Result {
  recast: {
    castHash: string
  }
}
interface Response {
  result: Result
}

/**
 * Sends a recast request to the warpcast server.
 * @param env - The environment configuration.
 * @param castHash - The hash of the cast.
 * @returns - A promise that resolves to a Response object from the server.
 */
export const recast = async (env: Env, castHash: string): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env

  const { result } = (await sdkRecastCast({
    baseUrl,
    auth: accessToken,
    body: { castHash },
    responseStyle: 'data',
    throwOnError: true,
  })) as unknown as Response

  return result
}
