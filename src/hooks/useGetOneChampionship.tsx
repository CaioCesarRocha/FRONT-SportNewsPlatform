import { useQuery } from '@tanstack/react-query'
import { API_URL } from '../utils/consts'
import { GET_ONE_CHAMPIONSHIP_KEY } from '../utils/keys'
import type { ChampionshipWithClubs } from '../utils/types'

async function fetchChampionshipById(id: number) {
  const response = await fetch(`${API_URL}/championships/${id}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch championship: ${response.status}`)
  }

  return (await response.json()) as ChampionshipWithClubs
}

export default function useGetOneChampionship(id?: number) {
  const { data, error, isFetching } = useQuery({
    queryKey: [GET_ONE_CHAMPIONSHIP_KEY, id],
    queryFn: () => fetchChampionshipById(id!),
    enabled: Boolean(id),
  })

  return {
    championship: data ?? null,
    clubs: data?.clubs ?? [],
    error: error instanceof Error ? error.message : null,
    isLoading: isFetching,
  }
}
