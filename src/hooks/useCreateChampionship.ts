import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type BaseSyntheticEvent } from 'react'
import { useController, useForm } from 'react-hook-form'
import useListAllClubs from './useListAllClubs'
import { ChampionshipType } from '../utils/types'
import { API_URL } from '../utils/consts'
import { GET_CHAMPIONSHIP_KEY } from '../utils/keys'
import type { Championship, Club, CreateChampionshipInput } from '../utils/types'
import { toast } from 'react-toastify'

type AddChampionshipFormValues = Omit<CreateChampionshipInput, 'emblem'> & {
  emblem: FileList
}

async function createChampionshipRequest(payload: CreateChampionshipInput) {
  const formData = new FormData()

  formData.append('name', payload.name)
  formData.append('type', payload.type)
  formData.append('weight', String(payload.weight))
  formData.append('clubsCount', String(payload.clubsCount))
  formData.append('clubs', JSON.stringify(payload.clubs))
  formData.append('emblem', payload.emblem)

  const response = await fetch(`${API_URL}/championships`, {
    body: formData,
    method: 'POST',
  })

  if (!response.ok) {
    toast.error(`Failed to create championship`)
    throw new Error(`Failed to create championship: ${response.status}`)
  }

  return (await response.json()) as Championship
}

export default function useCreateChampionship() {
  const queryClient = useQueryClient()
  const [clubsSearchTerm, setClubsSearchTerm] = useState('')
  const { clubs, error: clubsError, isLoading: isClubsLoading } = useListAllClubs()
  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
    register,
    reset,
    setValue,
    trigger,
    watch,
  } = useForm<AddChampionshipFormValues>({
    defaultValues: {
      clubs: [],
      clubsCount: 0,
      name: '',
      type: ChampionshipType.Mixed,
      weight: 1,
    },
    mode: 'onChange',
  })

  const { error, isPending, mutateAsync, reset: resetMutation } = useMutation({
    mutationFn: createChampionshipRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [GET_CHAMPIONSHIP_KEY],
      })
    },
  })

  const clubsCountValue = watch('clubsCount')
  const selectedEmblem = watch('emblem')?.[0]

  const {
    field: { onBlur: onClubsBlur, value: selectedClubIds = [] },
  } = useController({
    control,
    name: 'clubs',
    rules: {
      validate: {
        required: (clubIds) => clubIds.length > 0 || 'Select at least one club.',
        matchesClubsCount: (clubIds) => {
          const clubsLimit = Number(clubsCountValue ?? 0)

          if (clubsLimit < 1) {
            return clubIds.length === 0 || 'Set clubs count before selecting clubs.'
          }

          return (
            clubIds.length === clubsLimit ||
            `Select exactly ${clubsLimit} club${clubsLimit === 1 ? '' : 's'}.`
          )
        },
      },
    },
  })

  const emblemFieldValidation = register('emblem', {
    validate: {
      fileRequired: (files) => files?.length > 0 || 'Emblem is required.',
      imageOnly: (files) => {
        const file = files?.[0]

        if (!file) {
          return true
        }

        return file.type.startsWith('image/') || 'Emblem must be an image file.'
      },
    },
  })
  const nameFieldValidation = register('name', {
    required: 'Championship name is required.',
    minLength: {
      value: 5,
      message: 'Championship name must have at least 5 characters.',
    },
  })
  const typeFieldValidation = register('type', {
    required: 'Championship type is required.',
  })
  const weightFieldValidation = register('weight', {
    required: 'Weight is required.',
    valueAsNumber: true,
  })
  const clubsCountFieldValidation = register('clubsCount', {
    required: 'Clubs count is required.',
    min: {
      value: 1,
      message: 'Clubs count must be greater than 0.',
    },
    valueAsNumber: true,
  })

  useEffect(() => {
    if (selectedClubIds.length > 0) {
      void trigger('clubs')
    }
  }, [clubsCountValue, selectedClubIds.length, trigger])

  const clubsLimit = Number(clubsCountValue ?? 0)
  const isClubSelectionEnabled = clubsLimit > 0
  const hasReachedClubsLimit =
    isClubSelectionEnabled && selectedClubIds.length >= clubsLimit
  const hasMatchingClubsCount =
    isClubSelectionEnabled && selectedClubIds.length === clubsLimit

  const selectedClubs = selectedClubIds
    .map((clubId) => clubs.find((club) => club.id === clubId))
    .filter((club): club is Club => Boolean(club))

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(clubsSearchTerm.trim().toLowerCase()),
  )

  const updateSelectedClubs = (clubIds: string[]) => {
    setValue('clubs', clubIds, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
    onClubsBlur()
  }

  const toggleClubSelection = (clubId: string) => {
    if (selectedClubIds.includes(clubId)) {
      updateSelectedClubs(selectedClubIds.filter((selectedClubId) => selectedClubId !== clubId))
      return
    }

    if (!isClubSelectionEnabled || hasReachedClubsLimit) {
      return
    }

    updateSelectedClubs([...selectedClubIds, clubId])
  }

  const removeSelectedClub = (clubId: string) => {
    updateSelectedClubs(selectedClubIds.filter((selectedClubId) => selectedClubId !== clubId))
  }

  const submitCreateChampionship = async (event?: BaseSyntheticEvent) => {
    let hasSubmitted = false

    await handleSubmit(async (values) => {
      hasSubmitted = true

      await mutateAsync({
        clubs: values.clubs,
        clubsCount: values.clubsCount,
        emblem: values.emblem[0],
        name: values.name,
        type: values.type,
        weight: values.weight,
      })
    })(event)

    return hasSubmitted
  }

  const resetCreateChampionshipForm = () => {
    reset()
    setClubsSearchTerm('')
    resetMutation()
  }

  return {
    clubsCountValue,
    clubsCountFieldValidation,
    clubsError,
    clubsSearchTerm,
    emblemFieldValidation,
    error: error instanceof Error ? error.message : null,
    errors,
    filteredClubs,
    hasMatchingClubsCount,
    hasReachedClubsLimit,
    isClubSelectionEnabled,
    isClubsLoading,
    isFormValid: isValid,
    isLoading: isPending,
    nameFieldValidation,
    resetCreateChampionshipForm,
    removeSelectedClub,
    selectedEmblem,
    selectedClubIds,
    selectedClubs,
    setClubsSearchTerm,
    submitCreateChampionship,
    toggleClubSelection,
    typeFieldValidation,
    weightFieldValidation,
  }
}
