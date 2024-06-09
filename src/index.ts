import { fetchAccounts } from './services/lilnouns/fetch-accounts'

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    const { KV } = env

    let accounts = await env.KV.get('lilnouns-accounts', { type: 'json' })
    if (accounts === null) {
      accounts = await fetchAccounts()

      await KV.put('lilnouns-accounts', JSON.stringify(accounts), {
        expirationTtl: 60 * 60 * 24,
      })
    }

    console.log(accounts)
  },
} satisfies ExportedHandler<Env>
