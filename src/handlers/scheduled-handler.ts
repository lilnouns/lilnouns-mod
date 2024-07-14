import { cacheHandler } from '@/handlers/cacheHandler'
import { channelHandler } from '@/handlers/channel-handler'
import { directCastsHandler } from '@/handlers/direct-casts-handler'
import { proposalHandler } from '@/handlers/proposal-handler'
import { CronTime } from 'cron-time-generator'

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
    case CronTime.everyHour():
      await cacheHandler(env)
      await proposalHandler(env)
      break
    case CronTime.every(10).minutes():
      await channelHandler(env)
      break
    case CronTime.every(30).minutes():
      await channelHandler(env)
      break
    case CronTime.every(12).hours():
      await directCastsHandler(env)
      break
    default:
      console.log(`No handler for the cron schedule: ${controller.cron}`)
  }
}
