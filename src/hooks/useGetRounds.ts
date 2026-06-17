import { useQuery } from '@tanstack/react-query'
import { API_URL } from '../utils/consts'
import { GET_ROUNDS_KEY } from '../utils/keys'
import type { Round } from '../utils/types'

async function fetchRoundsByChampionshipId(id: number, phase?: string) {
  const params = phase ? `?phase=${encodeURIComponent(phase)}` : ''
  const response = await fetch(`${API_URL}/rounds/${id}/${params}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch rounds: ${response.status}`)
  }

  return (await response.json()) as Round[]
}

export default function useGetRounds(championshipId?: number, phase?: string) {
  const { data, error, isFetching } = useQuery({
    queryKey: [GET_ROUNDS_KEY, championshipId, phase],
    queryFn: () => fetchRoundsByChampionshipId(championshipId!, phase),
    enabled: Boolean(championshipId),
  })

  const rounds = data ?? []

  const roundIdentifiers = [...new Set(rounds.map((r) => r.identifier))].sort(
    (a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] ?? '0', 10)
      const numB = parseInt(b.match(/\d+/)?.[0] ?? '0', 10)
      return numA - numB
    },
  )

  return {
    rounds,
    roundIdentifiers,
    error: error instanceof Error ? error.message : null,
    isLoading: isFetching,
  }
}
