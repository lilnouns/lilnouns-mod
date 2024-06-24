import { Like } from '@/services/warpcast/types'

interface Response {
  result: {
    like: Like
  }
}
/**
 * Sends a request to like a cast using the provided castHash and token.
 * @param castHash - The hash of the cast to be liked.
 * @returns - A promise that resolves with the response from the server.
 * @throws {Error} - If the request fails, an error is thrown.
 */
export async function likeCast(castHash: string): Promise<Response> {
  const url = 'https://client.warpcast.com/v2/cast-likes'
  const body = JSON.stringify({ castHash })
  const headers = {
    Authorization: `Bearer `,
    'Content-Type': 'application/json; charset=utf-8',
  }

  const options: RequestInit = {
    method: 'PUT',
    headers,
    body,
  }

  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(
      `Failed to like cast with hash ${castHash}: ${response.statusText}`,
    )
  }

  return await response.json()
}
