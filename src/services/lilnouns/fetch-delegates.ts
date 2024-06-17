import { gql, GraphQLClient } from 'graphql-request'

interface Noun {
  id: string
}

interface Delegate {
  id: string
  nounsRepresented: Noun[]
}

interface Data {
  delegates: Delegate[]
}

const nounSubgraphUrl =
  'https://api.goldsky.com/api/public' +
  '/project_cldjvjgtylso13swq3dre13sf/subgraphs/lil-nouns-subgraph/1.0.4/gn'

const getDelegatesQuery = (skip: number, first: number) => gql`
  query{
    delegates(
      skip: ${skip}
      first: ${first}
      orderBy: delegatedVotes
      orderDirection: desc
      where: { and: [{ delegatedVotes_gt: 0 }] }
      subgraphError: deny
    ) {
      id
      delegatedVotes
      nounsRepresented(
        skip: 0
        first: 1000
        orderBy: id
        orderDirection: asc
        where: {}
      ) {
        id
      }
    }
  }
`

export async function fetchDelegates(): Promise<Delegate[]> {
  const first = 1000
  let skip = 0
  let allDelegates: Delegate[] = []
  let shouldContinueFetching = true

  const client = new GraphQLClient(nounSubgraphUrl, {
    errorPolicy: 'all',
    fetch,
  })

  while (shouldContinueFetching) {
    try {
      const query = getDelegatesQuery(skip, first)
      const { delegates } = await client.request<Data>(query)
      shouldContinueFetching = delegates.length > 0

      if (shouldContinueFetching) {
        allDelegates = [...allDelegates, ...delegates]
        skip += first
      }
    } catch (error) {
      console.error('Error fetching delegates:', error)
      shouldContinueFetching = false
    }
  }

  return allDelegates
}
