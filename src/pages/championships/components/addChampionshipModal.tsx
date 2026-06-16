import { useEffect } from 'react'
import { cn } from '../../../utils/cn'
import Autocomplete from '../../../components/autocomplete'
import Button from '../../../components/button'
import Input from '../../../components/input'
import useChampionshipForm from '../../../hooks/useChampionshipForm'
import { ChampionshipType } from '../../../utils/types'
import type { Championship } from '../../../utils/types'

type AddChampionshipModalProps = {
  editingChamp?: Championship
  isOpen: boolean
  onClose: () => void
}

const inputClassName =
  'w-full rounded-2xl border border-green-200 bg-white px-4 py-3 text-green-950 outline-none transition-colors placeholder:text-green-700/60 focus:border-green-500'

const errorClassName = 'text-sm font-medium text-red-700'

const championshipTypeOptions = Object.values(ChampionshipType)
const weightOptions = [1, 2, 3, 4, 5, 6, 7]

function formatChampionshipTypeLabel(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export default function AddChampionshipModal({
  editingChamp,
  isOpen,
  onClose,
}: AddChampionshipModalProps) {
  const form = useChampionshipForm(editingChamp, isOpen, onClose)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !form.isLoading) {
        form.handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [form.handleClose, form.isLoading, isOpen])

  if (!isOpen) return null

  const {
    clubsCountValue,
    clubsError,
    clubsSearchTerm,
    clubsCountFieldValidation,
    emblemFieldValidation,
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
    relegationFieldValidation,
    qualifyOneFieldValidation,
    qualifyTwoFieldValidation,
  } = form

  return (
    <div className="fixed inset-0 z-[2] flex items-center justify-center p-4">
      <Button
        aria-label={
          isEditing
            ? 'Close edit championship modal'
            : 'Close add championship modal'
        }
        onClick={isLoading ? undefined : handleClose}
        className="absolute inset-0 bg-green-950/55"
      />

      <div
        aria-modal="true"
        role="dialog"
        className="relative z-10 w-full max-w-2xl max-h-170 overflow-y-auto rounded-[28px] bg-[#f6f3e8] p-6 text-green-950 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-4">
            <p className="text-md font-bold uppercase tracking-[0.12em] text-green-800/70">
              {isEditing ? 'Edit championship' : 'Add new championship'}
            </p>
            <p className="text-sm text-green-900/70">
              {isEditing
                ? 'Update the championship name and emblem if needed.'
                : 'Fill in the data below and choose the emblem image for upload.'}
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
                Championship name
              </span>
              <Input
                type="text"
                placeholder="Ex.: Campeonato Mineiro 2026"
                className={inputClassName}
                error={errors.name?.message}
                {...nameFieldValidation}
              />
              {errors.name ? (
                <span className={errorClassName}>{errors.name.message}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-green-900">Type</span>
              {isEditing ? (
                <select
                  className={inputClassName}
                  disabled
                  value={form.editingChamp!.type}
                >
                  {championshipTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {formatChampionshipTypeLabel(type)}
                    </option>
                  ))}
                </select>
              ) : (
                <select className={inputClassName} {...typeFieldValidation}>
                  {championshipTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {formatChampionshipTypeLabel(type)}
                    </option>
                  ))}
                </select>
              )}
              {!isEditing && errors.type ? (
                <span className={errorClassName}>{errors.type.message}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-green-900">
                Weight
              </span>
              <select className={inputClassName} {...weightFieldValidation}>
                {weightOptions.map((weight) => (
                  <option key={weight} value={weight}>
                    {weight}
                  </option>
                ))}
              </select>
              {errors.weight ? (
                <span className={errorClassName}>{errors.weight.message}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-green-900">
                Clubs count
              </span>
              {isEditing ? (
                <Input
                  type="number"
                  className={inputClassName}
                  value={form.editingChamp!.clubsCount}
                  disabled
                />
              ) : (
                <Input
                  type="number"
                  min="1"
                  placeholder="Ex.: 10"
                  className={inputClassName}
                  error={errors.clubsCount?.message}
                  {...clubsCountFieldValidation}
                />
              )}
              {!isEditing && errors.clubsCount ? (
                <span className={errorClassName}>
                  {errors.clubsCount.message}
                </span>
              ) : null}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-green-900">
                Qualify One
              </span>
              <Input
                type="number"
                min="0"
                max="10"
                placeholder="Ex.: 2"
                className={inputClassName}
                error={errors.qualifyOne?.message}
                {...qualifyOneFieldValidation}
              />
              {errors.qualifyOne ? (
                <span className={errorClassName}>{errors.qualifyOne.message}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-green-900">
                Qualify Two
              </span>
              <Input
                type="number"
                min="0"
                max="10"
                placeholder="Ex.: 2"
                className={inputClassName}
                error={errors.qualifyTwo?.message}
                {...qualifyTwoFieldValidation}
              />
              {errors.qualifyTwo ? (
                <span className={errorClassName}>{errors.qualifyTwo.message}</span>
              ) : null}
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-green-900">
              Relegation
            </span>
            <Input
              type="number"
              min="0"
              max="8"
              placeholder="Ex.: 4"
              className={inputClassName}
              error={errors.relegation?.message}
              {...relegationFieldValidation}
            />
            {errors.relegation ? (
              <span className={errorClassName}>{errors.relegation.message}</span>
            ) : null}
          </label>

          {!isEditing ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-green-900">
                Clubs
              </span>
              <div
                className={cn(
                  'rounded-2xl border bg-white p-3',
                  errors.clubs ? 'border-red-400' : 'border-green-200',
                )}
              >
                {selectedClubs.length === 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-green-700/60">
                      {isClubSelectionEnabled
                        ? 'Search clubs by name and select the teams for this championship.'
                        : 'Set clubs count first to enable club selection.'}
                    </span>
                  </div>
                ) : null}

                <div className="mt-3 flex flex-col gap-3">
                  <Autocomplete
                    value={clubsSearchTerm}
                    placeholder="Search clubs by name"
                    disabled={!isClubSelectionEnabled}
                    error={clubsError}
                    loading={isClubsLoading}
                    emptyMessage="No clubs found for this search."
                    loadingMessage="Loading clubs..."
                    selectedOptions={selectedClubs.map((club) => ({
                      label: club.name,
                      value: club.id,
                    }))}
                    onRemoveSelected={removeSelectedClub}
                    onValueChange={setClubsSearchTerm}
                    onSelect={toggleClubSelection}
                    options={filteredClubs.map((club) => {
                      const isSelected = selectedClubIds.includes(club.id)

                      return {
                        disabled:
                          !isClubSelectionEnabled ||
                          (!isSelected && hasReachedClubsLimit),
                        label: club.name,
                        value: club.id,
                      }
                    })}
                    inputClassName="py-2"
                  />
                </div>

                <p className="mt-2 text-xs text-green-900/60">
                  {selectedClubIds.length}/{clubsCountValue || 0} clubs selected
                </p>
              </div>
              {errors.clubs ? (
                <span className={errorClassName}>{errors.clubs.message}</span>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-green-900">
              Emblem
            </span>

            {isEditing && form.editingChamp!.emblem ? (
              <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-white px-4 py-3">
                <img
                  src={form.editingChamp!.emblem}
                  alt="Current emblem"
                  className="h-10 w-10 rounded-lg object-contain"
                />
                <span className="text-sm text-green-700">Current emblem</span>
              </div>
            ) : null}

            <details className="group relative">
              <summary
                className={cn(
                  'flex cursor-pointer list-none items-center justify-between rounded-2xl border bg-white px-4 py-3 transition-colors',
                  errors.emblem ? 'border-red-400' : 'border-green-200',
                )}
              >
                <span
                  className={cn(
                    'truncate',
                    selectedEmblem ? 'text-green-950' : 'text-green-700/60',
                  )}
                >
                  {selectedEmblem
                    ? selectedEmblem.name
                    : isEditing
                      ? 'Change emblem image (optional)'
                      : 'Select emblem image'}
                </span>

                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5 text-green-800 transition-transform group-open:rotate-180"
                >
                  <path
                    d="m6 9 6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </summary>

              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-10 rounded-2xl border border-green-200 bg-white p-3 shadow-xl">
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-green-300 px-4 py-4 transition-colors hover:border-green-500 hover:bg-green-50">
                  <span className="text-sm font-medium text-green-950">
                    Upload image from device
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">
                    Browse
                  </span>
                  <Input
                    {...emblemFieldValidation}
                    accept="image/*"
                    type="file"
                    className="sr-only"
                    error={errors.emblem?.message}
                    onChange={(event) => {
                      emblemFieldValidation.onChange(event)
                      event.currentTarget.closest('details')?.removeAttribute('open')
                    }}
                  />
                </label>
                <p className="mt-2 text-xs text-green-900/60">
                  Accepted formats: PNG, JPG, SVG, WEBP and other image files.
                </p>
              </div>
            </details>
            {errors.emblem ? (
              <span className={errorClassName}>{errors.emblem.message}</span>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
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
              disabled={
                isLoading ||
                (isEditing ? !isValid : !isValid || !hasMatchingClubsCount)
              }
              className={cn(
                'rounded-full bg-green-700 px-5 py-3 text-sm font-semibold cursor-pointer',
                'text-white transition-colors hover:bg-green-800',
                'disabled:cursor-not-allowed disabled:opacity-60',
              )}
            >
              {isLoading
                ? 'Saving...'
                : isEditing
                  ? 'Update championship'
                  : 'Create championship'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
