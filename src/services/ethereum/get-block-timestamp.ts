import { createClient } from '@/services/ethereum/index'

/**
 * Retrieves the timestamp of a specific block.
 * @param env
 * @param blockNumber - The number of the block to retrieve the timestamp for.
 * @returns - The timestamp of the block in number format.
 */
export async function getBlockTimestamp(env: Env, blockNumber: number) {
  const publicClient = createClient(env)

  const block = await publicClient.getBlock({
    blockNumber: BigInt(blockNumber),
  })

  return Number(block.timestamp)
}
