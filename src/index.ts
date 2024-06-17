import { scheduledHandler } from './handlers/scheduled-handler'

export default {
  scheduled: async (controller, env) => {
    await scheduledHandler(env, controller)
  },
} satisfies ExportedHandler<Env>
