import { channelHandler } from '@/handlers/channel-handler'
import { proposalHandler } from '@/handlers/proposal-handler'

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
  switch (controller.cron) {
    case '0 * * * *':
      await proposalHandler(env)
      break
    case '30 * * * *':
      await channelHandler(env)
      break
    default:
      console.log(`No handler for the cron schedule: ${controller.cron}`)
  }
}
