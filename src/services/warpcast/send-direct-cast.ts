import { sendDirectCast as sdkSendDirectCast } from '@nekofar/warpcast'

interface Result {
  success: boolean
}

interface Response {
  result: Result
}

/**
 * Sends a direct cast request to the warpcast server.
 * @param env - The environment configuration.
 * @param recipientFid - The FID of the recipient.
 * @param message - The message to be sent.
 * @param idempotencyKey - A unique key to ensure idempotency.
 * @returns - A promise that resolves to a DirectCastResult object from the server.
 */
export const sendDirectCast = async (
  env: Env,
  recipientFid: number,
  message: string,
  idempotencyKey: string,
): Promise<Result> => {
  const { WARPCAST_API_KEY: apiKey, WARPCAST_BASE_URL: baseUrl } = env

  const { result } = (await sdkSendDirectCast({
    baseUrl,
    auth: apiKey,
    body: { recipientFid, message, idempotencyKey },
    responseStyle: 'data',
    throwOnError: true,
  })) as unknown as Response

  return result
}
