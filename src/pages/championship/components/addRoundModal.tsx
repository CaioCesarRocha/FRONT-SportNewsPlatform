import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useController, useForm } from 'react-hook-form'
import { cn } from '../../../utils/cn'
import Button from '../../../components/button'
import Input from '../../../components/input'
import DatePicker from '../../../components/datePicker'
import useCreateRound from '../../../hooks/useCreateRound'
import useUpdateRound from '../../../hooks/useUpdateRound'
import type { Club, Round } from '../../../utils/types'
import type { CreateRoundPayload } from '../../../hooks/useCreateRound'

type AddRoundModalProps = {
  championshipId: number
  clubs: Club[]
  editingRound?: Round | null
  isOpen: boolean
  onClose: () => void
}

type RoundFormValues = {
  identifier: string
  phase: string
  homeTeamId: string
  visitTeamId: string
  homeGoals: number
  visitGoals: number
  date: string
}

const inputClassName =
  'w-full rounded-2xl border border-green-200 bg-white px-4 py-3 text-green-950 outline-none transition-colors placeholder:text-green-700/60 focus:border-green-500'

const errorClassName = 'text-xs font-medium text-red-700'

export default function AddRoundModal({
  championshipId,
  clubs,
  editingRound,
  isOpen,
  onClose,
}: AddRoundModalProps) {
  const isEditing = !!editingRound
  const { createRound, error: createError, isLoading: isCreateLoading } = useCreateRound()
  const { updateRound, error: updateError, isLoading: isUpdateLoading } = useUpdateRound()

  const mutateError = isEditing ? updateError : createError
  const isLoading = isEditing ? isUpdateLoading : isCreateLoading

  const lastCreatedValues = useRef<RoundFormValues | null>(null)

  const {
    control,
    formState: { errors, isValid },
    getValues,
    handleSubmit,
    register,
    reset,
    trigger,
    watch,
  } = useForm<RoundFormValues>({
    defaultValues: {
      date: '',
      homeGoals: 0,
      homeTeamId: '',
      identifier: '',
      phase: '',
      visitGoals: 0,
      visitTeamId: '',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (!isOpen) return

    if (editingRound) {
      reset({
        identifier: editingRound.identifier,
        phase: editingRound.phase,
        homeTeamId: editingRound.homeTeam.id,
        visitTeamId: editingRound.visitTeam.id,
        homeGoals: editingRound.homeGoals,
        visitGoals: editingRound.visitGoals,
        date: new Date(editingRound.date).toISOString().split('T')[0],
      })
    } else if (lastCreatedValues.current) {
      reset(lastCreatedValues.current)
    } else {
      reset()
    }
  }, [editingRound, isOpen, reset])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLoading, isOpen, onClose])

  const handleClose = useCallback(() => {
    if (isLoading) return
    lastCreatedValues.current = null
    reset()
    onClose()
  }, [isLoading, onClose, reset])

  const handleSwapTeams = () => {
    const home = getValues('homeTeamId')
    const visit = getValues('visitTeamId')
    reset({ ...getValues(), homeTeamId: visit, visitTeamId: home })
  }

  const homeTeamId = watch('homeTeamId')
  const visitTeamId = watch('visitTeamId')

  const sortedClubs = useMemo(
    () => [...clubs].sort((a, b) => a.name.localeCompare(b.name)),
    [clubs],
  )

  const {
    field: dateField,
    fieldState: { error: dateError },
  } = useController({
    control,
    name: 'date',
    rules: {
      required: 'Date is required.',
      validate: {
        notInPast: (value: string) => {
          if (isEditing) return true
          if (!value) return true
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const selected = new Date(value + 'T00:00:00')
          return selected >= today || 'Date cannot be in the past.'
        },
      },
    },
  })

  useEffect(() => {
    trigger('visitTeamId')
  }, [homeTeamId, trigger])

  useEffect(() => {
    trigger('homeTeamId')
  }, [visitTeamId, trigger])

  const onSubmit = handleSubmit(async (values) => {
    const date = new Date(values.date).toISOString()

    try {
      if (isEditing) {
        await updateRound({
          id: editingRound!.id,
          identifier: values.identifier,
          phase: values.phase,
          homeTeamId: values.homeTeamId,
          visitTeamId: values.visitTeamId,
          homeGoals: Number(values.homeGoals),
          visitGoals: Number(values.visitGoals),
          date,
        })

        handleClose()
      } else {
        const payload: CreateRoundPayload = {
          championshipId,
          identifier: values.identifier,
          phase: values.phase,
          homeTeamId: values.homeTeamId,
          visitTeamId: values.visitTeamId,
          homeGoals: Number(values.homeGoals),
          visitGoals: Number(values.visitGoals),
          date,
        }

        await createRound(payload)

        lastCreatedValues.current = {
          identifier: values.identifier,
          phase: values.phase,
          homeTeamId: values.homeTeamId,
          visitTeamId: values.visitTeamId,
          homeGoals: Number(values.homeGoals),
          visitGoals: Number(values.visitGoals),
          date: values.date,
        }

        onClose()
      }
    } catch {
      // error handled by hook
    }
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <Button
        aria-label="Close add round modal"
        onClick={isLoading ? undefined : handleClose}
        className="absolute inset-0 bg-green-950/55"
      />

      <div
        aria-modal="true"
        role="dialog"
        className="relative z-10 w-full max-w-2xl rounded-[28px] bg-[#f6f3e8] p-6 text-green-950 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-4">
            <p className="text-md font-bold uppercase tracking-[0.12em] text-green-800/70">
              {isEditing ? 'Edit round' : 'Add new round'}
            </p>
            <p className="text-sm text-green-900/70">
              {isEditing ? 'Update the round data below.' : 'Fill in the data below to create a new round.'}
            </p>
          </div>

          <Button
            onClick={isLoading ? undefined : handleClose}
            className="rounded-full p-2 text-green-900 transition-colors hover:bg-green-100"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
              <path
                d="m6 6 12 12M18 6 6 18"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </Button>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-green-900">
                Identifier <span className="text-red-500">*</span>
              </span>
              <Input
                type="text"
                placeholder="Ex.: 1ª rodada"
                className={inputClassName}
                error={errors.identifier?.message}
                {...register('identifier', {
                  required: 'Identifier is required.',
                })}
              />
              {errors.identifier ? (
                <span className={errorClassName}>{errors.identifier.message}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-green-900">
                Phase <span className="text-red-500">*</span>
              </span>
              <Input
                type="text"
                placeholder="Ex.: Fase de Grupos"
                className={inputClassName}
                error={errors.phase?.message}
                {...register('phase', {
                  required: 'Phase is required.',
                })}
              />
              {errors.phase ? (
                <span className={errorClassName}>{errors.phase.message}</span>
              ) : null}
            </label>

            <div className="col-span-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-green-900">
                  Home team <span className="text-red-500">*</span>
                </span>
                <select
                  className={inputClassName}
                  {...register('homeTeamId', {
                    required: 'Home team is required.',
                    validate: {
                      differentFromVisit: () => {
                        const home = getValues('homeTeamId')
                        const visit = getValues('visitTeamId')
                        if (!home || !visit) return true
                        return (
                          home !== visit ||
                          'Home and visitor teams must be different.'
                        )
                      },
                    },
                  })}
                >
                  <option value="">Select a team</option>
                  {sortedClubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
                <div className="min-h-[1.25rem]">
                  {errors.homeTeamId ? (
                    <span className={errorClassName}>{errors.homeTeamId.message}</span>
                  ) : null}
                </div>
              </label>

              <button
                type="button"
                disabled={!homeTeamId || !visitTeamId}
                onClick={() => handleSwapTeams()}
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
                  homeTeamId && visitTeamId
                    ? 'cursor-pointer text-green-700 hover:bg-green-100'
                    : 'cursor-not-allowed text-green-700/30',
                )}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 rotate-90">
                  <path
                    d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-green-900">
                  Visitor team <span className="text-red-500">*</span>
                </span>
                <select
                  className={inputClassName}
                  {...register('visitTeamId', {
                    required: 'Visitor team is required.',
                    validate: {
                      differentFromHome: () => {
                        const home = getValues('homeTeamId')
                        const visit = getValues('visitTeamId')
                        if (!home || !visit) return true
                        return (
                          home !== visit ||
                          'Home and visitor teams must be different.'
                        )
                      },
                    },
                  })}
                >
                  <option value="">Select a team</option>
                  {sortedClubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
                <div className="min-h-[1.25rem]">
                  {errors.visitTeamId ? (
                    <span className={errorClassName}>{errors.visitTeamId.message}</span>
                  ) : null}
                </div>
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-green-900">
                Home goals <span className="text-red-500">*</span>
              </span>
              <Input
                type="number"
                min="0"
                placeholder="0"
                className={inputClassName}
                error={errors.homeGoals?.message}
                {...register('homeGoals', {
                  required: 'Home goals is required.',
                  min: { value: 0, message: 'Goals must be 0 or greater.' },
                  valueAsNumber: true,
                })}
              />
              {errors.homeGoals ? (
                <span className={errorClassName}>{errors.homeGoals.message}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-green-900">
                Visitor goals <span className="text-red-500">*</span>
              </span>
              <Input
                type="number"
                min="0"
                placeholder="0"
                className={inputClassName}
                error={errors.visitGoals?.message}
                {...register('visitGoals', {
                  required: 'Visitor goals is required.',
                  min: { value: 0, message: 'Goals must be 0 or greater.' },
                  valueAsNumber: true,
                })}
              />
              {errors.visitGoals ? (
                <span className={errorClassName}>{errors.visitGoals.message}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-green-900">
                Date <span className="text-red-500">*</span>
              </span>
              <DatePicker
                value={dateField.value}
                onChange={dateField.onChange}
                min={new Date().toISOString().split('T')[0]}
                className={cn(dateError && 'border-red-400')}
                placeholder="Select a date"
              />
              {dateError ? (
                <span className={errorClassName}>{dateError.message}</span>
              ) : null}
            </label>
          </div>

          {mutateError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {mutateError}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              onClick={handleClose}
              disabled={isLoading}
              className={cn(
                'rounded-full border border-green-200 px-5 py-3 text-sm font-semibold text-green-900',
                'transition-colors hover:bg-green-100 cursor-pointer',
                'disabled:cursor-not-allowed disabled:opacity-60',
              )}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isValid}
              className={cn(
                'rounded-full bg-green-700 px-5 py-3 text-sm font-semibold cursor-pointer',
                'text-white transition-colors hover:bg-green-800',
                'disabled:cursor-not-allowed disabled:opacity-60',
              )}
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update round' : 'Create round'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
