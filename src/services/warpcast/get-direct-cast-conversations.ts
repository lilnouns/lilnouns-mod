import { fetchRequest, HttpRequestMethod } from '@/services/warpcast/index'
import { Conversation } from '@/services/warpcast/types'
import { IntRange } from 'type-fest'

interface Result {
  conversations: Conversation[]
  cursor?: string
}

interface Response {
  result: {
    conversations: Conversation[]
  }
  next?: {
    cursor: string
  }
}

/**
 * Retrieves the list of direct cast conversations.
 * @param env - The environment variables containing access token and base URL.
 * @param [cursor] - The cursor to paginate through the conversations.
 * @param [limit] - The maximum number of conversations to retrieve (default: 15).
 * @param [category] - The category of conversations to filter (default: 'default').
 * @param [filter] - The filter to apply to the conversations (default: 'group').
 * @returns - A promise that resolves to an object containing the retrieved conversations and the current cursor.
 */
export const getDirectCastConversations = async (
  env: Env,
  cursor?: string,
  limit: IntRange<1, 101> = 15,
  category = 'default',
  filter = 'unread',
): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env
  let newCursor = cursor ?? ''
  let conversations: Conversation[] = []
  let response: Response

  do {
    const params = {
      cursor: newCursor,
      limit: String(limit),
      category,
      filter,
    }
    response = await fetchRequest<Response>(
      baseUrl,
      accessToken,
      HttpRequestMethod.GET,
      '/v2/direct-cast-conversation-list',
      {
        params,
      },
    )
    conversations = [...conversations, ...response.result.conversations]
    newCursor = response.next ? response.next.cursor : ''
  } while (response.next && conversations.length < limit)

  return { conversations: conversations.slice(0, limit), cursor: newCursor }
}
