import { getDirectCastConversations } from '@/services/warpcast/get-direct-cast-conversations'
import { getMe } from '@/services/warpcast/get-me'
import { createHash } from 'node:crypto'
import { flat, pipe, sort, unique } from 'remeda'

interface DirectCastBody {
  type: 'direct-cast'
  data: {
    recipientFid: number
    message: string
    idempotencyKey: string
  }
}

/**
 * Handles the subscribers by retrieving conversations and participants,
 * filtering out duplicates, and storing the subscribers in KV.
 * @param env - The environment object containing required dependencies.
 * @returns - A Promise that resolves once the subscribers are handled.
 */
async function handleSubscribers(env: Env) {
  const { KV: kv } = env

  const categories = ['default', 'request']

  const subscribers: number[] =
    (await kv.get('lilnouns-farcaster-subscribers', { type: 'json' })) ?? []

  const newSubscribers = await Promise.all(
    categories.map(async (category) => {
      const { conversations } = await getDirectCastConversations(
        env,
        100,
        category as 'default' | 'request',
      )
      return conversations.flatMap(({ participants }) =>
        participants.map(({ fid }) => fid),
      )
    }),
  )

  const updatedSubscribers = pipe(
    [...subscribers, ...flat(newSubscribers)],
    unique(),
    sort((a, b) => a - b),
  )

  await kv.put(
    'lilnouns-farcaster-subscribers',
    JSON.stringify(updatedSubscribers),
  )
}

/**
 * Handles unread messages by sending an automated response to the participants
 * in the unread direct cast conversations.
 * @param env - The environment object containing configuration and services.
 * @returns A promise that resolves when the messages have been handled.
 */
async function handleMessages(env: Env) {
  const { QUEUE: queue } = env

  const { user } = await getMe(env)

  const { conversations } = await getDirectCastConversations(
    env,
    100,
    'default',
    'unread',
  )

  const participants = conversations.flatMap(({ participants }) =>
    participants.map(({ fid }) => fid),
  )

  const batch: MessageSendRequest<DirectCastBody>[] = []

  for (const recipientFid of participants) {
    if (recipientFid === user.fid) {
      continue
    }

    const message =
      `This account runs on autopilot, so please don’t send messages directly here. ` +
      `If you have any issues or questions, just reach out to @nekofar! 😊`
    const idempotencyKey = createHash('sha256').update(message).digest('hex')

    const task: MessageSendRequest<DirectCastBody> = {
      body: {
        type: 'direct-cast',
        data: {
          recipientFid,
          message,
          idempotencyKey,
        },
      },
    }

    batch.push(task)
  }

  if (batch.length > 0) {
    try {
      await queue.sendBatch(batch)
      console.log('Batch enqueued successfully:', batch)
    } catch (error) {
      console.error('Error enqueuing batch:', error)
    }
  }
}

/**
 * Updates the subscriber list by adding any new participants from direct cast conversations.
 * @param env - The environment object containing the KV store.
 * @returns - A promise that resolves after the update is completed.
 */
export async function directCastsHandler(env: Env) {
  await handleMessages(env)
  await handleSubscribers(env)
}
