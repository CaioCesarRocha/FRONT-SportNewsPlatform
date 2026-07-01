import { useQuery } from '@tanstack/react-query'
import { API_URL } from '../utils/consts'
import { GET_CLUBS_PERFORMANCE_KEY } from '../utils/keys'
import type { ClubPerformance } from '../utils/types'

type SortBy = 'victory' | 'pontuation' | 'performance'

export default function useGetClubsPerformance(sortBy: SortBy = 'pontuation') {
  const { data, error, isFetching } = useQuery({
    queryKey: [GET_CLUBS_PERFORMANCE_KEY, sortBy],
    queryFn: async () => {
      const url = new URL(`${API_URL}/clubs/performance`)
      url.searchParams.set('sortBy', sortBy)

      const response = await fetch(url.toString(), {
        headers: {
          accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch clubs performance: ${response.status}`)
      }

      return (await response.json()) as ClubPerformance[]
    },
  })

  return {
    clubsPerformance: data ?? [],
    error: error instanceof Error ? error.message : null,
    isLoading: isFetching,
  }
}
