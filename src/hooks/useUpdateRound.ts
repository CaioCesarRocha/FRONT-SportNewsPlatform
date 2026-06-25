import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { API_URL } from '../utils/consts'
import { GET_ROUNDS_KEY } from '../utils/keys'
import type { Round } from '../utils/types'

export type UpdateRoundPayload = {
  identifier: string
  homeTeamId: string
  visitTeamId: string
  homeGoals: number
  visitGoals: number
  date: string
  phase: string
}

async function updateRoundRequest({ id, ...payload }: { id: string } & UpdateRoundPayload) {
  const response = await fetch(`${API_URL}/rounds/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Failed to update round: ${response.status}`)
  }

  return (await response.json()) as Round
}

export default function useUpdateRound() {
  const queryClient = useQueryClient()

  const { error, isPending, mutateAsync } = useMutation({
    mutationFn: updateRoundRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [GET_ROUNDS_KEY] })
      toast.success('Round updated successfully.')
    },
  })

  return {
    error: error instanceof Error ? error.message : null,
    isLoading: isPending,
    updateRound: mutateAsync,
  }
}
