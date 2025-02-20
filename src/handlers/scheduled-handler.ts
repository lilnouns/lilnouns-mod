import { cacheHandler } from '@/handlers/cache-handler'
import { channelHandler } from '@/handlers/channel-handler'
import { directCastsHandler } from '@/handlers/direct-casts-handler'
import { eventsHandler } from '@/handlers/events-handler'
import { proposalHandler } from '@/handlers/proposal-handler'
import { reminderHandler } from '@/handlers/reminder-handler'
import { starterPackHandler } from '@/handlers/starter-pack-handler'
import { logger } from '@/utilities/logger'
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
      // await eventsHandler(env)
      await channelHandler(env)
      await reminderHandler(env)
      break
    case CronTime.every(12).hours():
      await starterPackHandler(env)
      await directCastsHandler(env)
      break
    case CronTime.everyDayAt(14, 0):
      await proposalHandler(env)
      break
    default:
      logger.info({ cron: controller.cron }, 'No handler for the cron schedule')
  }
}
