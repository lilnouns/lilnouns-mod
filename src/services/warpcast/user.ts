import { getUserByVerificationAddress as warpcastGetUserByVerificationAddress } from '@nekofar/warpcast'

const RATE_LIMIT_ERROR_PREFIX = 'Farcaster client rate limit exceeded'
const DEFAULT_MIN_REQUEST_INTERVAL_MS = 100
const DEFAULT_RATE_LIMIT_RETRY_DELAY_MS = 60_000
const DEFAULT_MAX_RATE_LIMIT_RETRIES = 3

type WarpcastResponse = Awaited<
  ReturnType<typeof warpcastGetUserByVerificationAddress>
>

interface WarpcastErrorPayload {
  errors?: ({ message?: string | null } | null)[]
}

interface WarpcastUserPayload {
  result?: {
    user?: {
      fid?: number
    }
  }
}

export interface WarpcastLookupResult {
  data?: WarpcastUserPayload
  error?: WarpcastErrorPayload
}

interface RateLimitErrorShape {
  error?: WarpcastErrorPayload
}

interface CreateWarpcastUserLookupOptions {
  auth: () => string
  minRequestIntervalMs?: number
  rateLimitRetryDelayMs?: number
  rateLimitMaxRetries?: number
}

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

const isRateLimitMessage = (message: unknown) =>
  typeof message === 'string' && message.startsWith(RATE_LIMIT_ERROR_PREFIX)

const hasRateLimitError = (result: WarpcastResponse) => {
  if ('error' in result && result.error) {
    const errors = (result as RateLimitErrorShape).error?.errors ?? []
    return errors.some((entry) => isRateLimitMessage(entry?.message))
  }
  return false
}

const isRateLimitError = (error: unknown) => {
  if (!error) return false
  if (error instanceof Error) {
    return isRateLimitMessage(error.message)
  }
  if (typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    return isRateLimitMessage(message)
  }
  return false
}

export const createWarpcastUserLookup = ({
  auth,
  minRequestIntervalMs = DEFAULT_MIN_REQUEST_INTERVAL_MS,
  rateLimitRetryDelayMs = DEFAULT_RATE_LIMIT_RETRY_DELAY_MS,
  rateLimitMaxRetries = DEFAULT_MAX_RATE_LIMIT_RETRIES,
}: CreateWarpcastUserLookupOptions) => {
  const memo = new Map<string, Promise<WarpcastLookupResult>>()
  let queue: Promise<void> = Promise.resolve()
  let lastInvocationAt = 0

  const enqueue = <T,>(task: () => Promise<T>) => {
    const scheduled = queue.then(async () => {
      const elapsed = Date.now() - lastInvocationAt
      const waitTime = Math.max(0, minRequestIntervalMs - elapsed)
      if (waitTime > 0) await delay(waitTime)
      try {
        return await task()
      } finally {
        lastInvocationAt = Date.now()
      }
    })

    queue = scheduled.then(
      () => undefined,
      () => undefined,
    )

    return scheduled
  }

  const runRequest = async (
    address: string,
    attempt = 1,
  ): Promise<WarpcastLookupResult> => {
    try {
      const result = await enqueue(() =>
        warpcastGetUserByVerificationAddress({
          auth,
          query: { address },
        }),
      )

      if (attempt < rateLimitMaxRetries && hasRateLimitError(result)) {
        await delay(rateLimitRetryDelayMs)
        return await runRequest(address, attempt + 1)
      }

      const data = 'data' in result
        ? (result.data as unknown as WarpcastUserPayload | undefined)
        : undefined
      const error = 'error' in result
        ? (result.error as unknown as WarpcastErrorPayload | undefined)
        : undefined

      return { data, error }
    } catch (error) {
      if (attempt < rateLimitMaxRetries && isRateLimitError(error)) {
        await delay(rateLimitRetryDelayMs)
        return runRequest(address, attempt + 1)
      }

      throw error
    }
  }

  const getUserByVerificationAddress = async (
    address: string,
  ): Promise<WarpcastLookupResult> => {
    const normalized = address.toLowerCase()
    let cached = memo.get(normalized)

    if (!cached) {
      cached = runRequest(normalized)
      memo.set(normalized, cached)
      cached.catch(() => {
        memo.delete(normalized)
      })
    }

    return cached
  }

  return { getUserByVerificationAddress }
}
