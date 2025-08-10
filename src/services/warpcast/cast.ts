import { createCast as sdkCreateCast } from '@nekofar/warpcast'
import { Cast } from '@/services/warpcast/types'

interface Result {
  cast: Cast
}

interface Response {
  result: Result
}

/**
 * Function to create a new cast within the specified environment.
 * @param env - The environment configuration object, containing access tokens and base URLs.
 * @param text - The main content of the cast.
 * @param embeds - An array of embed objects to be included in the cast (SDK accepts mixed embed types).
 * @param channelKey - The key for the channel where the cast will be posted.
 * @param _castDistribution - Unused with SDK; kept for backward-compatibility of signature.
 * @returns - A promise that resolves to the created cast object.
 */
export const cast = async (
  env: Env,
  text: string,
  embeds: unknown[],
  channelKey: string,
  _castDistribution = 'channel-only',
): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env
  void _castDistribution

  const { result } = (await sdkCreateCast({
    baseUrl,
    auth: accessToken,
    body: { text, embeds, channelKey },
    responseStyle: 'data',
    throwOnError: true,
  })) as unknown as Response

  return result
}
