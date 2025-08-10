import { getUserStarterPacks as sdkGetUserStarterPacks } from '@nekofar/warpcast'
import { StarterPack } from '@/services/warpcast/types'
import type { IntRange } from 'type-fest'

interface Result {
  starterPacks: StarterPack[]
  cursor?: string
}

interface Response {
  result: { starterPacks: StarterPack[] }
  next?: { cursor: string }
}

/**
 * Fetches starter packs data for a given FID (farcaster ID) using the Warpcast SDK.
 * @param env - The environment configuration containing necessary API credentials.
 * @param fid - The Farcaster ID for which the starter packs are to be retrieved.
 * @param [limit] - The maximum number of starter packs to retrieve, defaulted to 15.
 * @returns - A promise that resolves to the result containing the starter packs data.
 */
export const getStarterPacks = async (
  env: Env,
  fid: number,
  limit: IntRange<0, 101> = 15,
): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env

  const { result, next } = (await sdkGetUserStarterPacks({
    baseUrl,
    auth: accessToken,
    query: { fid, limit },
    responseStyle: 'data',
    throwOnError: true,
  })) as unknown as Response

  return { starterPacks: result.starterPacks, cursor: next?.cursor }
}
