import { fetchRequest, HttpRequestMethod } from '@/services/warpcast/index'
import { User } from '@/services/warpcast/types'

interface Result {
  users: User[]
}

interface Response {
  result: Result
  next?: {
    cursor: string
  }
}

export const getFollowers = async (env: Env, fid: number): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env

  const users: User[] = []
  let cursor: string | undefined = undefined
  const limit = 100

  while (true) {
    const response = await fetchRequest<Response>(
      baseUrl,
      accessToken,
      HttpRequestMethod.GET,
      '/v2/followers',
      {
        params: {
          fid: fid.toString(),
          cursor: cursor ?? '',
          limit: limit.toString(),
        },
      },
    )

    if (response.result.users) {
      users.push(...response.result.users)
    }

    if (!response.next) {
      break
    }

    cursor = response.next.cursor
  }

  return { users }
}
