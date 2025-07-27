import { createPublicClient, http, fallback } from 'viem'
import { mainnet } from 'viem/chains'

/**
 * Create a client for interacting with the Ethereum mainnet.
 * @param env - The environment object containing configuration parameters.
 * @returns - The created client.
 */
export function createClient(env: Env) {
  const { ALCHEMY_API_KEY: alchemyApiKey, ANKR_API_KEY: ankrApiKey } = env

  return createPublicClient({
    chain: mainnet,
    transport: fallback([
      http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
      http(`https://rpc.ankr.com/eth/${ankrApiKey}`),
    ]),
  })
}
