import {
  createExecutionContext,
  createScheduledController,
  env,
  waitOnExecutionContext,
} from 'cloudflare:test'
import { it } from 'vitest'
// Could import any other source file/function here
import worker from '../src'

// eslint-disable-next-line vitest/expect-expect
it('calls scheduled handler', async () => {
  const ctrl = createScheduledController({
    scheduledTime: new Date(1000),
    cron: '0 */12 * * *',
  })
  const ctx = createExecutionContext()
  await worker.scheduled(ctrl, env, ctx)
  await waitOnExecutionContext(ctx)
})
