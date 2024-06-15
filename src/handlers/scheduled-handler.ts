import { proposalHandler } from '@/handlers/proposal-handler'
import { channelHandler } from '@/handlers/channel-handler'

export async function scheduledHandler(
  env: Env,
  controller: ScheduledController,
) {
  if (controller.cron === '0 * * * *') {
    await proposalHandler(env)
  }
  if (controller.cron === '30 * * * *') {
    await channelHandler(env)
  }
}
