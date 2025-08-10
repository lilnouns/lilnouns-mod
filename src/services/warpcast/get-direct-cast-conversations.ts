import { getDirectCastInbox as sdkGetDirectCastInbox } from '@nekofar/warpcast'
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
 * Retrieves direct cast conversations using Warpcast SDK.
 * @async
 * @param env - The environment variables.
 * @param [limit] - The maximum number of conversations to retrieve.
 * @param [category] - The category of conversations to retrieve.
 * @param [filter] - The filter to apply to conversations.
 * @param [cursor] - The cursor for pagination.
 * @returns - A promise that resolves to the retrieved conversations and cursor.
 */
export const getDirectCastConversations = async (
  env: Env,
  limit: IntRange<1, 101> = 15,
  category: 'default' | 'request' = 'default',
  filter?: 'unread' | 'group' | '1-1',
  cursor?: string,
): Promise<Result> => {
  const { WARPCAST_ACCESS_TOKEN: accessToken, WARPCAST_BASE_URL: baseUrl } = env
  let newCursor = cursor ?? ''
  let conversations: Conversation[] = []
  let resultPage: Response

  // Map legacy "request" to SDK's "requests"; keep signature backward compatible
  const mappedCategory = (category === 'request' ? 'requests' : category) as
    | 'default'
    | 'requests'
    | 'spam'

  do {
    const { result, next } = (await sdkGetDirectCastInbox({
      baseUrl,
      auth: accessToken,
      query: {
        ...(newCursor && { cursor: newCursor }),
        limit,
        category: mappedCategory,
        ...(filter && { filter }),
      },
      responseStyle: 'data',
      throwOnError: true,
    })) as unknown as Response

    resultPage = { result, next }

    conversations = [...conversations, ...result.conversations]
    newCursor = next ? next.cursor : ''
  } while (resultPage.next && conversations.length < limit)

  return { conversations: conversations.slice(0, limit), cursor: newCursor }
}
