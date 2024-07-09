import { publicClient } from '@/services/ethereum/index'

/**
 * Retrieves the timestamp of a specific block.
 * @param blockNumber - The number of the block to retrieve the timestamp for.
 * @returns - The timestamp of the block in number format.
 */
export async function getBlockTimestamp(blockNumber: bigint) {
  const block = await publicClient.getBlock({
    blockNumber,
  })

  return Number(block.timestamp)
}
