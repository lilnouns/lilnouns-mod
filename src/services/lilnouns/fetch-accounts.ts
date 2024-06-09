import request, { gql } from 'graphql-request'

type Noun = {
  id: string
}

type Account = {
  id: string
  nouns: Noun[]
}

type Data = {
  accounts: Account[]
}

const nounSubgraphUrl =
  'https://api.goldsky.com/api/public' +
  '/project_cldjvjgtylso13swq3dre13sf/subgraphs/lil-nouns-subgraph/1.0.4/gn'

const getAccountsQuery = (skip: number, first: number) => gql`
  query{
    accounts(
      skip: ${skip}
      first: ${first}
      orderBy: tokenBalance
      orderDirection: desc
      where: {
        tokenBalance_gt: 0
        id_not_in: [
          "0x0bc3807ec262cb779b38d65b38158acc3bfede10",
          "0x0000000000000000000000000000000000000000",
          "0x18222a762bf67024193de25e1cdc7aa6e614c695",
        ]
      }
    ) {
      id
      nouns {
        id
      }
    }
  }
`

export async function fetchAccounts(): Promise<Account[]> {
  const first = 1000
  let skip = 0
  let allAccounts: Account[] = []
  let shouldContinueFetching = true

  while (shouldContinueFetching) {
    try {
      const query = getAccountsQuery(skip, first)
      const { accounts } = await request<Data>(nounSubgraphUrl, query)
      shouldContinueFetching = accounts.length > 0

      if (shouldContinueFetching) {
        allAccounts = [...allAccounts, ...accounts]
        skip += first
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
      shouldContinueFetching = false
    }
  }

  return allAccounts
}
