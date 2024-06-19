import { proposalHandler } from '@/handlers/proposal-handler'
import { channelHandler } from '@/handlers/channel-handler'

/**
 * Executes scheduled tasks based on the provided cron schedule.
 * @param env - The environment object containing necessary configuration.
 * @param controller - The scheduled controller object containing the cron schedule.
 * @returns - A promise that resolves when the scheduled tasks are executed successfully.
 */
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
