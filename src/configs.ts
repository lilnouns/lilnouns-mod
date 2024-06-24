const configs = (env: Env) => {
  return {
    warpcastBaseUrl: env.WARPCAST_BASE_URL,
    warpcastAccessToken: env.WARPCAST_ACCESS_TOKEN,
  }
}

export { configs }
