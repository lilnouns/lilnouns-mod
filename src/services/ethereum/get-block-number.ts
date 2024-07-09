import { publicClient } from '@/services/ethereum/index'

/**
 * Retrieves the current block number from the public client.
 * @returns A promise that resolves to the current block number.
 */
export async function getBlockNumber() {
  return  await publicClient.getBlockNumber()
}
