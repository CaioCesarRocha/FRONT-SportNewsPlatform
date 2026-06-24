import { useCallback, useEffect, useState } from 'react'
import { useController, useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import useCheckFields from './useCheckFields'
import useListAllClubs from './useListAllClubs'
import useUpdateChampionship from './useUpdateChampionship'
import { ChampionshipType } from '../utils/types'
import { API_URL } from '../utils/consts'
import { GET_CHAMPIONSHIP_KEY } from '../utils/keys'
import type { Championship, Club, CreateChampionshipInput } from '../utils/types'

type ChampionshipFormValues = Omit<CreateChampionshipInput, 'emblem'> & {
  emblem: FileList
}

async function createChampionshipRequest(payload: CreateChampionshipInput) {
  const formData = new FormData()

  formData.append('name', payload.name)
  formData.append('type', payload.type)
  formData.append('weight', String(payload.weight))
  formData.append('clubsCount', String(payload.clubsCount))
  formData.append('clubs', JSON.stringify(payload.clubs))
  formData.append('relegation', String(payload.relegation))
  formData.append('qualifyOne', String(payload.qualifyOne))
  formData.append('qualifyTwo', String(payload.qualifyTwo))
  formData.append('emblem', payload.emblem)

  const response = await fetch(`${API_URL}/championships`, {
    body: formData,
    method: 'POST',
  })

  if (!response.ok) {
    toast.error('Failed to create championship')
    throw new Error(`Failed to create championship: ${response.status}`)
  }

  return (await response.json()) as Championship
}

export default function useChampionshipForm(
  editingChamp: Championship | undefined,
  isOpen: boolean,
  onClose: () => void,
) {
  const isEditing = !!editingChamp
  const queryClient = useQueryClient()
  const [clubsSearchTerm, setClubsSearchTerm] = useState('')
  const { clubs, error: clubsError, isLoading: isClubsLoading } = useListAllClubs()
  const {
    updateChampionship,
    error: updateError,
    isLoading: isUpdateLoading,
    resetUpdateChampionship,
  } = useUpdateChampionship()

  const {
    clearErrors,
    control,
    formState: { errors, isValid },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    trigger,
    watch,
  } = useForm<ChampionshipFormValues>({
    defaultValues: {
      clubs: [],
      clubsCount: 0,
      name: '',
      type: ChampionshipType.Mixed,
      weight: 1,
      relegation: 0,
      qualifyOne: 0,
      qualifyTwo: 0,
    },
    mode: 'onChange',
  })

  const {
    error: createError,
    isPending: isCreateLoading,
    mutateAsync: createChampionshipMutation,
    reset: resetCreateMutation,
  } = useMutation({
    mutationFn: createChampionshipRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [GET_CHAMPIONSHIP_KEY],
      })
    },
  })

  const error = isEditing
    ? updateError
    : createError instanceof Error
      ? createError.message
      : null

  const isLoading = isEditing ? isUpdateLoading : isCreateLoading
  const clubsCountValue = watch('clubsCount')
  const selectedEmblem = watch('emblem')?.[0]
  const watchedName = watch('name')

  const { nameTaken, checkingName } = useCheckFields(watchedName, '', {
    path: '/championships/check-uniqueness',
    nameDebounce: 1200,
  })

  useEffect(() => {
    if (nameTaken) {
      setError('name', { message: 'Name already used' })
    } else if (!checkingName) {
      clearErrors('name')
    }
  }, [nameTaken, checkingName, setError, clearErrors])

  const {
    field: { onBlur: onClubsBlur, value: selectedClubIds = [] },
  } = useController({
    control,
    name: 'clubs',
    rules: isEditing
      ? {}
      : {
          validate: {
            required: (clubIds) =>
              clubIds.length > 0 || 'Select at least one club.',
            matchesClubsCount: (clubIds) => {
              const clubsLimit = Number(clubsCountValue ?? 0)

              if (clubsLimit < 1) {
                return (
                  clubIds.length === 0 ||
                  'Set clubs count before selecting clubs.'
                )
              }

              return (
                clubIds.length === clubsLimit ||
                `Select exactly ${clubsLimit} club${clubsLimit === 1 ? '' : 's'}.`
              )
            },
          },
        },
  })

  useEffect(() => {
    if (!isOpen) return

    if (isEditing) {
      reset({
        name: editingChamp.name,
        type: editingChamp.type,
        weight: editingChamp.weight,
        clubsCount: editingChamp.clubsCount,
        relegation: editingChamp.relegation,
        qualifyOne: editingChamp.qualifyOne,
        qualifyTwo: editingChamp.qualifyTwo,
        clubs: [],
      })
    } else {
      reset()
      setClubsSearchTerm('')
      resetCreateMutation()
    }
  }, [editingChamp, isOpen, isEditing, reset, resetCreateMutation])

  useEffect(() => {
    if (!isOpen) return

    if (selectedClubIds.length > 0) {
      void trigger('clubs')
    }
  }, [clubsCountValue, selectedClubIds.length, trigger, isOpen])

  const clubsLimit = Number(clubsCountValue ?? 0)
  const isClubSelectionEnabled = isEditing ? false : clubsLimit > 0
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
      updateSelectedClubs(
        selectedClubIds.filter((selectedClubId) => selectedClubId !== clubId),
      )
      return
    }

    if (!isClubSelectionEnabled || hasReachedClubsLimit) {
      return
    }

    updateSelectedClubs([...selectedClubIds, clubId])
  }

  const removeSelectedClub = (clubId: string) => {
    updateSelectedClubs(
      selectedClubIds.filter((selectedClubId) => selectedClubId !== clubId),
    )
  }

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

  const relegationFieldValidation = register('relegation', {
    valueAsNumber: true,
    min: {
      value: 0,
      message: 'Relegation must be between 0 and 8.',
    },
    max: {
      value: 8,
      message: 'Relegation must be between 0 and 8.',
    },
  })

  const qualifyOneFieldValidation = register('qualifyOne', {
    valueAsNumber: true,
    min: {
      value: 0,
      message: 'Qualify One must be between 0 and 10.',
    },
    max: {
      value: 10,
      message: 'Qualify One must be between 0 and 10.',
    },
  })

  const qualifyTwoFieldValidation = register('qualifyTwo', {
    valueAsNumber: true,
    min: {
      value: 0,
      message: 'Qualify Two must be between 0 and 10.',
    },
    max: {
      value: 10,
      message: 'Qualify Two must be between 0 and 10.',
    },
  })

  const emblemFieldValidation = register('emblem', {
    validate: {
      fileRequired: (files) => {
        if (isEditing) return true
        return files?.length > 0 || 'Emblem is required.'
      },
      imageOnly: (files) => {
        const file = files?.[0]

        if (!file) return true

        return file.type.startsWith('image/') || 'Emblem must be an image file.'
      },
    },
  })

  const handleClose = useCallback(() => {
    if (!isEditing) {
      resetCreateMutation()
    }
    resetUpdateChampionship()
    reset()
    setClubsSearchTerm('')
    onClose()
  }, [isEditing, resetCreateMutation, resetUpdateChampionship, reset, onClose])

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateChampionship({
          id: editingChamp.id,
          name: values.name,
          weight: values.weight,
          relegation: values.relegation,
          qualifyOne: values.qualifyOne,
          qualifyTwo: values.qualifyTwo,
          emblem: values.emblem?.[0],
        })

        toast.success('Championship updated successfully.')
      } else {
        await createChampionshipMutation({
          clubs: values.clubs,
          clubsCount: values.clubsCount,
          emblem: values.emblem[0],
          name: values.name,
          type: values.type,
          weight: values.weight,
          relegation: values.relegation,
          qualifyOne: values.qualifyOne,
          qualifyTwo: values.qualifyTwo,
        })

        toast.success('Championship created successfully.')
      }

      handleClose()
    } catch {
      // error handled by hooks
    }
  })

  return {
    clubsCountValue,
    clubsError,
    clubsSearchTerm,
    clubsCountFieldValidation,
    editingChamp,
    emblemFieldValidation,
    relegationFieldValidation,
    qualifyOneFieldValidation,
    qualifyTwoFieldValidation,
    error,
    errors,
    filteredClubs,
    handleClose,
    hasMatchingClubsCount,
    hasReachedClubsLimit,
    isClubSelectionEnabled,
    isClubsLoading,
    isEditing,
    isLoading,
    isValid,
    nameFieldValidation,
    onSubmit,
    removeSelectedClub,
    selectedClubs,
    selectedClubIds,
    selectedEmblem,
    setClubsSearchTerm,
    toggleClubSelection,
    typeFieldValidation,
    weightFieldValidation,
  }
}
