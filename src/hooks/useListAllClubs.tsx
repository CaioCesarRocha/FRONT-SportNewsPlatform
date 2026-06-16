import { useQuery } from '@tanstack/react-query'
import { API_URL } from '../utils/consts'
import { LIST_ALL_CLUBS_KEY, LIST_CLUBS_BY_LOCATION_KEY } from '../utils/keys'
import type { Club } from '../utils/types'

type ListAllClubsResponse = Club[]

export default function useListAllClubs(country?: string, state?: string) {
  const hasFilter = !!country && !!state

  const { data, error, isFetching } = useQuery({
    queryKey: hasFilter ? [LIST_CLUBS_BY_LOCATION_KEY, country, state] : [LIST_ALL_CLUBS_KEY],
    queryFn: async () => {
      const url = hasFilter
        ? new URL(`${API_URL}/clubs/location/${encodeURIComponent(country)}/${encodeURIComponent(state)}`)
        : new URL(`${API_URL}/clubs`)

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error(`Failed to fetch clubs: ${response.status}`)
      }

      return (await response.json()) as ListAllClubsResponse
    },
  })

  return {
    clubs: data ?? [],
    error: error instanceof Error ? error.message : null,
    isLoading: isFetching,
  }
}
