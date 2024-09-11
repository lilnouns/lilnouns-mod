import { queueHandler } from '@/handlers/queue-handler'
import { scheduledHandler } from '@/handlers/scheduled-handler'

export default {
  queue: async (batch, env, ctx) => {
    await queueHandler(batch, env, ctx)
  },
  scheduled: async (controller, env) => {
    await scheduledHandler(env, controller)
  },
} satisfies ExportedHandler<Env>
