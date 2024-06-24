import { configs } from '@/configs'
import { fetchRequest, HttpRequestMethod } from '@/services/warpcast/index'
import { Like } from '@/services/warpcast/types'

interface Response {
  result: {
    like: Like
  }
}

export const likeCast = async (
  env: Env,
  castHash: string,
): Promise<Response> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { warpcastAccessToken, warpcastBaseUrl } = configs(env)
  const body = { castHash }
  return await fetchRequest<Response>(
    warpcastBaseUrl,
    warpcastAccessToken,
    HttpRequestMethod.PUT,
    '/cast-likes',
    { json: body },
  )
}
