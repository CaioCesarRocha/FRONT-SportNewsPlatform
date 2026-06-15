import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API_URL } from '../utils/consts'
import { GET_CHAMPIONSHIP_KEY } from '../utils/keys'
import type { Championship, UpdateChampionshipInput } from '../utils/types'

async function updateChampionshipRequest(payload: UpdateChampionshipInput) {
  const formData = new FormData()

  formData.append('name', payload.name)
  formData.append('weight', String(payload.weight))
  formData.append('relegation', String(payload.relegation))
  formData.append('qualifyOne', String(payload.qualifyOne))
  formData.append('qualifyTwo', String(payload.qualifyTwo))

  if (payload.emblem) {
    formData.append('emblem', payload.emblem)
  }

  const response = await fetch(`${API_URL}/championships/${payload.id}`, {
    body: formData,
    method: 'PUT',
  })

  if (!response.ok) {
    throw new Error(`Failed to update championship: ${response.status}`)
  }

  return (await response.json()) as Championship
}

export default function useUpdateChampionship() {
  const queryClient = useQueryClient()

  const { error, isPending, mutateAsync, reset } = useMutation({
    mutationFn: updateChampionshipRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [GET_CHAMPIONSHIP_KEY],
      })
    },
  })

  return {
    updateChampionship: mutateAsync,
    error: error instanceof Error ? error.message : null,
    isLoading: isPending,
    resetUpdateChampionship: reset,
  }
}
