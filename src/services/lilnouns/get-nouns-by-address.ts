import { gql, GraphQLClient } from 'graphql-request'

interface Noun {
  id: string
}

interface Account {
  id: string
  tokenBalanceRaw: string
  tokenBalance: string
  totalTokensHeldRaw: string
  totalTokensHeld: string
  nouns: Noun[]
}

interface Data {
  account: Account
}

interface Result {
  nouns: Noun[]
}

/**
 * Retrieves the Nouns for a given address.
 * @param address - The Ethereum address.
 * @param skip - The number of Nouns to skip.
 * @param first - The maximum number of Nouns to retrieve.
 * @returns - The GraphQL query string to fetch the Nouns for the specified address.
 */
const getNounsByAddressQuery = (
  address: string,
  skip: number,
  first: number,
) => gql`
  {
    account(id: "${address.toLowerCase()}") {
      id
      tokenBalanceRaw
      tokenBalance
      totalTokensHeldRaw
      totalTokensHeld
      nouns(skip: ${skip}, first: ${first}, orderBy: id, orderDirection: asc) {
        id
      }
    }
  }
`

/**
 * Retrieves all Nouns for a given address.
 * @param env - The environment variables.
 * @param address - The Ethereum address.
 * @returns A promise that resolves to an object containing an array of Nouns.
 */
export async function getNounsForAddress(
  env: Env,
  address: string,
): Promise<Result> {
  const { LILNOUNS_SUBGRAPH_URL: subgraphUrl } = env

  const limit = 1000
  let offset = 0
  let allNouns: Noun[] = []
  let hasMoreNouns = false

  const client = new GraphQLClient(subgraphUrl, {
    errorPolicy: 'all',
    fetch,
  })

  do {
    const query = getNounsByAddressQuery(address, offset, limit)
    const { account } = await client.request<Data>(query)

    if (account && account.nouns.length > 0) {
      allNouns = [...allNouns, ...account.nouns]
      offset += limit
      hasMoreNouns = account.nouns.length > 0
    } else {
      hasMoreNouns = false
    }
  } while (hasMoreNouns)

  return { nouns: allNouns }
}
