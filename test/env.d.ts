declare module 'cloudflare:test' {
  // Controls the type of `import("cloudflare:test").env`
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ProvidedEnv extends Env {}
}
