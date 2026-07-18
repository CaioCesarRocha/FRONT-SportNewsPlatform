import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { API_URL } from '../utils/consts'
import { GET_CHAMPIONSHIP_KEY, GET_ONE_CHAMPIONSHIP_KEY } from '../utils/keys'

export type RelegateClubPayload = {
  championshipId: number
  clubId: string
}

async function relegateClubRequest(payload: RelegateClubPayload) {
  const response = await fetch(`${API_URL}/championships/relegate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Failed to relegate club: ${response.status}`)
  }

  return response.json()
}

export default function useRelegateClub() {
  const queryClient = useQueryClient()

  const { error, isPending, mutateAsync } = useMutation({
    mutationFn: relegateClubRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [GET_CHAMPIONSHIP_KEY] })
      await queryClient.invalidateQueries({ queryKey: [GET_ONE_CHAMPIONSHIP_KEY] })
      toast.success('Club relegated successfully.')
    },
  })

  return {
    error: error instanceof Error ? error.message : null,
    isLoading: isPending,
    relegateClub: mutateAsync,
  }
}
