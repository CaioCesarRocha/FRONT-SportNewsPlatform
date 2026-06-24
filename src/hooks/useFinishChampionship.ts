import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { API_URL } from '../utils/consts'
import { GET_CHAMPIONSHIP_KEY, GET_ONE_CHAMPIONSHIP_KEY } from '../utils/keys'

export type FinishChampionshipPayload = {
  championshipId: number
  clubId: string
}

async function finishChampionshipRequest(payload: FinishChampionshipPayload) {
  const response = await fetch(`${API_URL}/championships/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Failed to finish championship: ${response.status}`)
  }

  return response.json()
}

export default function useFinishChampionship() {
  const queryClient = useQueryClient()

  const { error, isPending, mutateAsync } = useMutation({
    mutationFn: finishChampionshipRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [GET_CHAMPIONSHIP_KEY] })
      await queryClient.invalidateQueries({ queryKey: [GET_ONE_CHAMPIONSHIP_KEY] })
      toast.success('Championship finished successfully.')
    },
  })

  return {
    error: error instanceof Error ? error.message : null,
    isLoading: isPending,
    finishChampionship: mutateAsync,
  }
}
