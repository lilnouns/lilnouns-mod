import {
  createExecutionContext,
  createScheduledController,
  env,
  waitOnExecutionContext,
} from 'cloudflare:test'
import { it } from 'vitest'
// Could import any other source file/function here
import worker from '../src'

it('calls scheduled handler', async () => {
  const ctrl = createScheduledController({
    scheduledTime: new Date(1000),
    cron: '30 * * * *',
  })
  const ctx = createExecutionContext()
  await worker.scheduled(ctrl, env, ctx)
  await waitOnExecutionContext(ctx)
})