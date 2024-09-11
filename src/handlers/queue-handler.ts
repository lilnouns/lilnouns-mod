import { sendDirectCast } from '@/services/warpcast/send-direct-cast'

interface DirectCastBody {
  type: 'direct-cast'
  data: {
    recipientFid: number
    message: string
    idempotencyKey: string
  }
}

/**
 * A function to calculate the exponential backoff delay.
 * @param attempts - The number of attempts or retries that have been made.
 * @param baseDelaySeconds - The base delay in seconds for the initial attempt.
 * @returns The calculated delay in seconds based on the number of attempts.
 */
const calculateExponentialBackoff = (
  attempts: number,
  baseDelaySeconds: number,
) => {
  return baseDelaySeconds ** attempts
}

/**
 * Handles the task of sending a direct cast message.
 * @param env - The environment configuration object.
 * @param data - The data for the direct cast message, including recipient ID, message content, and idempotency key.
 * @returns A promise that resolves when the direct cast task is completed.
 */
async function handleDirectCastTask(env: Env, data: DirectCastBody['data']) {
  const { recipientFid, message: castMessage, idempotencyKey } = data
  try {
    const result = await sendDirectCast(
      env,
      recipientFid,
      castMessage,
      idempotencyKey,
    )
    console.log(
      `Direct cast sent successfully to recipientFid ${recipientFid.toString()}:`,
      result,
    )
  } catch (error) {
    console.error(
      `Failed to send direct cast to recipientFid ${recipientFid.toString()}:`,
      error,
    )
    throw error
  }
}

/**
 * Processes a message and handles tasks based on its type.
 * @param env - The environment configuration object used for task handling.
 * @param message - The message object containing the type and data to be processed.
 * @returns A promise that resolves when the message processing is complete.
 */
async function processMessage(env: Env, message: Message) {
  // @ts-expect-error: A message body type might not have a clear structure
  const { type, data } = message.body

  switch (type) {
    case 'direct-cast':
      await handleDirectCastTask(env, data as DirectCastBody['data'])
      break

    default:
      console.error('Unknown task type:', type)
  }
}

/**
 * Handles incoming messages in a queue and processes them based on their
 * message type, with acknowledgment and retry logic.
 * @param batch - The batch of messages to process.
 * @param env - The environment context for the handler.
 * @param _ctx - The execution context for managing async operations.
 * @returns A promise that resolves when all messages in the batch have been
 *   processed and acknowledged.
 */
export async function queueHandler(
  batch: MessageBatch,
  env: Env,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ctx: ExecutionContext,
) {
  for (const message of batch.messages) {
    try {
      await processMessage(env, message)

      // Acknowledge the message after successful processing
      message.ack()
    } catch (error) {
      console.error('Error processing message, will retry:', error)

      // Retry the message in case of failure
      message.retry({
        delaySeconds: calculateExponentialBackoff(message.attempts, 30),
      })
    }
  }
}
