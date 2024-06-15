import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

/** @type {import('vite').UserConfig} */
export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' },
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
