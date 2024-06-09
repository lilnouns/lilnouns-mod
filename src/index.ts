import { fetchAccounts } from './services/lilnouns/fetch-accounts'

export default {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async scheduled(controller, env, _ctx): Promise<void> {
    const { KV } = env

    if (controller.cron === '30 * * * *') {
      let accounts = await env.KV.get('lilnouns-accounts', { type: 'json' })
      if (accounts === null) {
        accounts = await fetchAccounts()

        await KV.put('lilnouns-accounts', JSON.stringify(accounts), {
          expirationTtl: 60 * 60 * 24,
        })
      }

      console.log(accounts)
    }
  },
} satisfies ExportedHandler<Env>
