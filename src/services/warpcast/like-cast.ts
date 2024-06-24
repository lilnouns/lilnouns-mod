import { configs } from '@/configs'
import { fetchRequest, HttpRequestMethod } from '@/services/warpcast/index'
import { Like } from '@/services/warpcast/types'

interface Response {
  result: {
    like: Like
  }
}

/**
 * Sends a like cast request to the warpcast server.
 * @param env - The environment configuration.
 * @param castHash - The hash of the cast.
 * @returns - A promise that resolves to a Response object from the server.
 */
export const likeCast = async (
  env: Env,
  castHash: string,
): Promise<Response> => {
  const { warpcastAccessToken, warpcastBaseUrl } = configs(env)
  const body = { castHash }
  return await fetchRequest<Response>(
    warpcastBaseUrl,
    warpcastAccessToken,
    HttpRequestMethod.PUT,
    '/v2/cast-likes',
    { json: body },
  )
}
