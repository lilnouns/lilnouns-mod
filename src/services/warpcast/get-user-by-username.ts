import { fetchRequest, HttpRequestMethod } from '@/services/warpcast/index';
import { User } from '@/services/warpcast/types';

interface Result {
  user: User;
}

interface Response {
  result: Result;
}

export const getUserByUsername = async (env: Env, username: string): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env;

  const { result } = await fetchRequest<Response>(
    baseUrl,
    accessToken,
    HttpRequestMethod.GET,
    '/v2/user-by-username',
    {
      params: { username }
    }
  );

  return result;
};
