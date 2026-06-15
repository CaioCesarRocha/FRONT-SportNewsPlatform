import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API_URL } from '../utils/consts'
import { LIST_ALL_CLUBS_KEY, LIST_CLUBS_BY_LOCATION_KEY } from '../utils/keys'
import type { Club, UpdateClubInput } from '../utils/types'

async function updateClubRequest(payload: UpdateClubInput) {
  const formData = new FormData()

  formData.append('name', payload.name)
  formData.append('country', payload.country)
  formData.append('state', payload.state)
  formData.append('slug', payload.slug)
  formData.append('stadium', payload.stadium)

  if (payload.shield) {
    formData.append('shield', payload.shield)
  }

  const response = await fetch(`${API_URL}/clubs/${payload.id}`, {
    body: formData,
    method: 'PUT',
  })

  if (!response.ok) {
    throw new Error(`Failed to update club: ${response.status}`)
  }

  return (await response.json()) as Club
}

export default function useUpdateClub() {
  const queryClient = useQueryClient()

  const { error, isPending, mutateAsync, reset } = useMutation({
    mutationFn: updateClubRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [LIST_ALL_CLUBS_KEY],
      })
      await queryClient.invalidateQueries({
        queryKey: [LIST_CLUBS_BY_LOCATION_KEY],
      })
    },
  })

  return {
    updateClub: mutateAsync,
    error: error instanceof Error ? error.message : null,
    isLoading: isPending,
    resetUpdateClub: reset,
  }
}
