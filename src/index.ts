import { fetchDelegates } from './services/lilnouns/fetch-delegates'

export default {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async scheduled(controller, env, _ctx): Promise<void> {
    const { KV } = env

    if (controller.cron === '30 * * * *') {
      let delegates = await env.KV.get('lilnouns-delegates', { type: 'json' })
      if (delegates === null) {
        delegates = await fetchDelegates()

        await KV.put('lilnouns-delegates', JSON.stringify(delegates), {
          expirationTtl: 60 * 60 * 24,
        })
      }

      console.log(JSON.stringify(delegates, undefined, 2))
    }
  },
} satisfies ExportedHandler<Env>
