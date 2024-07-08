import { gql, GraphQLClient } from 'graphql-request'

interface Delegate {
  id: string
}

interface Vote {
  voter: Delegate
}

interface Data {
  votes: Vote[]
}

interface Result {
  votes: Vote[]
}

/**
 * Retrieves the votes for a given proposal.
 * @param proposal - The proposal identifier.
 * @param skip - The number of votes to skip.
 * @param first - The maximum number of votes to retrieve.
 * @returns - The GraphQL query string to fetch the votes for the specified proposal.
 */
const getVotesByProposalQuery = (
  proposal: string,
  skip: number,
  first: number,
) => gql`
  {
    votes(
      skip: ${skip}
      first: ${first}
      orderBy: blockNumber
      orderDirection: asc
      where: { proposal: "${proposal}" }
      subgraphError: deny
    ) {
      voter {
        id
      }
    }
  }
`

/**
 * Retrieves all votes for a given proposal.
 * @param env - The environment variables.
 * @param proposal - The proposal ID.
 * @returns A promise that resolves to an object containing an array of votes.
 */
export async function getVotesByProposal(
  env: Env,
  proposal: number,
): Promise<Result> {
  const { LILNOUNS_SUBGRAPH_URL: subgraphUrl } = env

  const limit = 1000
  let offset = 0
  let allVotes: Vote[] = []
  let hasMoreVotes = false

  const client = new GraphQLClient(subgraphUrl, {
    errorPolicy: 'all',
    fetch,
  })

  do {
    const query = getVotesByProposalQuery(proposal.toString(), offset, limit)
    const { votes } = await client.request<Data>(query)

    allVotes = [...allVotes, ...votes]
    offset += limit
    hasMoreVotes = votes.length > 0
  } while (hasMoreVotes)

  return { votes: allVotes }
}
