import { useQuery, useQueryClient } from '@tanstack/react-query'
import { API_URL } from '../utils/consts'
import { GET_CHAMPIONSHIP_KEY } from '../utils/keys'
import type { Championship } from '../utils/types'

type ChampionshipsResponse = Championship[]

async function fetchChampionshipsByName(name: string) {
  const url = new URL(`${API_URL}/championships`)

  url.searchParams.set('name', name)

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`Failed to fetch championships: ${response.status}`)
  }

  return (await response.json()) as ChampionshipsResponse
}

export default function useGetChampionships(name?: string | null) {
  const queryClient = useQueryClient()

  const { data, error, isFetching } = useQuery({
    queryKey: [GET_CHAMPIONSHIP_KEY, name],
    queryFn: ({ queryKey }) => fetchChampionshipsByName(queryKey[1] as string),
    enabled: Boolean(name),
  })

  const getChampionshipsByName = async (championshipName: string) => {
    return queryClient.fetchQuery({
      queryKey: [GET_CHAMPIONSHIP_KEY, championshipName],
      queryFn: () => fetchChampionshipsByName(championshipName),
    })
  }

  const resetChampionships = () => {
    queryClient.removeQueries({
      queryKey: [GET_CHAMPIONSHIP_KEY],
    })
  }

  return {
    championships: data ?? [],
    error: error instanceof Error ? error.message : null,
    getChampionshipsByName,
    isLoading: isFetching,
    resetChampionships,
  }
}
