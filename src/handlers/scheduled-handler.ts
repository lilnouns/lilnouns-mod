import { proposalHandler } from '@/handlers/proposal-handler'

export async function scheduledHandler(
  env: Env,
  controller: ScheduledController,
) {
  if (controller.cron === '0 * * * *') {
    await proposalHandler(env)
  }
}
