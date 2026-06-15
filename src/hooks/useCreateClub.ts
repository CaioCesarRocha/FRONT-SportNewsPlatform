import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API_URL } from '../utils/consts'
import { LIST_ALL_CLUBS_KEY, LIST_CLUBS_BY_LOCATION_KEY } from '../utils/keys'
import type { Club, CreateClubInput } from '../utils/types'

async function createClubRequest(payload: CreateClubInput) {
  const formData = new FormData()

  formData.append('name', payload.name)
  formData.append('country', payload.country)
  formData.append('state', payload.state)
  formData.append('slug', payload.slug)
  formData.append('stadium', payload.stadium)
  formData.append('shield', payload.shield)

  const response = await fetch(`${API_URL}/clubs`, {
    body: formData,
    method: 'POST',
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || `Failed to create club: ${response.status}`)
  }

  return (await response.json()) as Club
}

export default function useCreateClub() {
  const queryClient = useQueryClient()

  const { error, isPending, mutateAsync, reset } = useMutation({
    mutationFn: createClubRequest,
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
    createClub: mutateAsync,
    error: error instanceof Error ? error.message : null,
    isLoading: isPending,
    resetCreateClub: reset,
  }
}
