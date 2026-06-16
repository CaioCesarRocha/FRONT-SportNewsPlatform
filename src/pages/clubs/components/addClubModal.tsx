import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Button from '../../../components/button'
import useCheckFields from '../../../hooks/useCheckFields'
import useCreateClub from '../../../hooks/useCreateClub'
import useUpdateClub from '../../../hooks/useUpdateClub'
import Input from '../../../components/input'
import type { Club, CreateClubInput } from '../../../utils/types'

type AddClubModalProps = {
  editingClub?: Club
  isOpen: boolean
  onClose: () => void
}

type AddClubFormValues = Omit<CreateClubInput, 'shield'> & {
  shield: FileList
}

const inputClassName =
  'w-full rounded-2xl border border-green-200 bg-white px-4 py-3 text-green-950 outline-none transition-colors placeholder:text-green-700/60 focus:border-green-500'

const errorClassName = 'text-sm font-medium text-red-700'

export default function AddClubModal({ editingClub, isOpen, onClose }: AddClubModalProps) {
  const isEditing = !!editingClub
  const { createClub, error: createError, isLoading: isCreating, resetCreateClub } = useCreateClub()
  const { updateClub, error: updateError, isLoading: isUpdating, resetUpdateClub } = useUpdateClub()

  const error = isEditing ? updateError : createError
  const isLoading = isEditing ? isUpdating : isCreating

  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
    watch,
  } = useForm<AddClubFormValues>({
    defaultValues: {
      country: '',
      name: '',
      slug: '',
      stadium: '',
      state: '',
    },
  })

  useEffect(() => {
    if (!isOpen) return

    reset({
      country: editingClub?.country ?? '',
      name: editingClub?.name ?? '',
      slug: editingClub?.slug ?? '',
      stadium: editingClub?.stadium ?? '',
      state: editingClub?.state ?? '',
    })
  }, [editingClub, isOpen, reset])

  const shieldField = register('shield', {
    validate: {
      fileRequired: (files) => {
        if (isEditing) return true
        return files?.length > 0 || 'Shield is required.'
      },
      imageOnly: (files) => {
        const file = files?.[0]

        if (!file) {
          return true
        }

        return file.type.startsWith('image/') || 'Shield must be an image file.'
      },
    },
  })

  const selectedShield = watch('shield')?.[0]

  const watchedName = watch('name')
  const watchedSlug = watch('slug')
  const { nameTaken, slugTaken, checkingName, checkingSlug } = useCheckFields(watchedName, watchedSlug)

  useEffect(() => {
    if (nameTaken) {
      setError('name', { message: 'Name already used' })
    } else if (!checkingName) {
      clearErrors('name')
    }
  }, [nameTaken, checkingName, setError, clearErrors])

  useEffect(() => {
    if (slugTaken) {
      setError('slug', { message: 'Slug already used' })
    } else if (!checkingSlug) {
      clearErrors('slug')
    }
  }, [slugTaken, checkingSlug, setError, clearErrors])

  const handleClose = useCallback(() => {
    reset()
    resetCreateClub()
    resetUpdateClub()
    onClose()
  }, [onClose, reset, resetCreateClub, resetUpdateClub])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClose, isLoading, isOpen])

  const onSubmit = handleSubmit(async (values) => {
    if (isEditing) {
      await updateClub({
        id: editingClub.id,
        country: values.country,
        name: values.name,
        shield: values.shield[0],
        slug: values.slug,
        stadium: values.stadium,
        state: values.state,
      })

      toast.success('Club updated successfully.')
    } else {
      await createClub({
        country: values.country,
        name: values.name,
        shield: values.shield[0],
        slug: values.slug,
        stadium: values.stadium,
        state: values.state,
      })

      toast.success('Club created successfully.')
    }

    handleClose()
  })

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <Button
        aria-label={isEditing ? 'Close edit club modal' : 'Close add club modal'}
        onClick={isLoading ? undefined : handleClose}
        className="absolute inset-0 bg-green-950/55"
      />

      <div
        aria-modal="true"
        role="dialog"
        className="relative z-10 w-full max-w-2xl rounded-[28px] bg-[#f6f3e8] p-6 text-green-950 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-800/70">
              {isEditing ? 'Update Club' : 'Create Club'}
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-green-950">
              {isEditing ? 'Edit club' : 'Add a new club'}
            </h2>
            <p className="text-sm text-green-900/70">
              {isEditing
                ? 'Update the club information and shield if needed.'
                : 'Fill in the basic information and choose the shield image for upload.'}
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
              <span className="text-sm font-semibold text-green-900">Club name</span>
              <Input
                type="text"
                placeholder="Ex.: U.R.T"
                className={inputClassName}
                error={errors.name?.message}
                {...register('name', {
                  required: 'Club name is required.',
                  minLength: {
                    value: 2,
                    message: 'Club name must have at least 2 characters.',
                  },
                })}
              />
              {errors.name ? <span className={errorClassName}>{errors.name.message}</span> : null}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-green-900">Stadium</span>
              <Input
                type="text"
                placeholder="Ex.: Zama Maciel"
                className={inputClassName}
                error={errors.stadium?.message}
                {...register('stadium', {
                  required: 'Stadium is required.',
                  minLength: {
                    value: 2,
                    message: 'Stadium must have at least 2 characters.',
                  },
                })}
              />
              {errors.stadium ? <span className={errorClassName}>{errors.stadium.message}</span> : null}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-green-900">Country</span>
              <Input
                type="text"
                placeholder="Ex.: Brazil"
                className={inputClassName}
                error={errors.country?.message}
                {...register('country', {
                  required: 'Country is required.',
                })}
              />
              {errors.country ? <span className={errorClassName}>{errors.country.message}</span> : null}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-green-900">State</span>
              <Input
                type="text"
                placeholder="Ex.: Minas Gerais"
                className={inputClassName}
                error={errors.state?.message}
                {...register('state', {
                  required: 'State is required.',
                })}
              />
              {errors.state ? <span className={errorClassName}>{errors.state.message}</span> : null}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-green-900">Slug</span>
              <Input
                type="text"
                placeholder="Ex.: URT"
                className={inputClassName}
                error={errors.slug?.message}
                maxLength={3}
                onInput={(e) => {
                  const target = e.currentTarget
                  target.value = target.value.toUpperCase()
                }}
                {...register('slug', {
                  required: 'Slug is required.',
                  maxLength: {
                    value: 3,
                    message: 'Slug must have at most 3 characters.',
                  },
                  setValueAs: (v: string) => v.toUpperCase(),
                })}
              />
              {errors.slug ? <span className={errorClassName}>{errors.slug.message}</span> : null}
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-green-900">Shield</span>
            {isEditing && editingClub.shield ? (
              <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-white px-4 py-3">
                <img
                  src={editingClub.shield}
                  alt="Current shield"
                  className="h-10 w-10 rounded-lg object-contain"
                />
                <span className="text-sm text-green-700">Current shield</span>
              </div>
            ) : null}
            <details className="group relative">
              <summary
                className={`flex cursor-pointer list-none items-center justify-between rounded-2xl border bg-white px-4 py-3 transition-colors ${
                  errors.shield ? 'border-red-400' : 'border-green-200'
                }`}
              >
                <span className={`truncate ${selectedShield ? 'text-green-950' : 'text-green-700/60'}`}>
                  {selectedShield ? selectedShield.name : isEditing ? 'Change shield image (optional)' : 'Select shield image'}
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
                  <span className="text-sm font-medium text-green-950">Upload image from device</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">
                    Browse
                  </span>
                  <Input
                    {...shieldField}
                    accept="image/*"
                    type="file"
                    className="sr-only"
                    error={errors.shield?.message}
                    onChange={(event) => {
                      shieldField.onChange(event)
                      event.currentTarget.closest('details')?.removeAttribute('open')
                    }}
                  />
                </label>
                <p className="mt-2 text-xs text-green-900/60">
                  Accepted formats: PNG, JPG, SVG, WEBP and other image files.
                </p>
              </div>
            </details>
            {errors.shield ? <span className={errorClassName}>{errors.shield.message}</span> : null}
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
              className="rounded-full border border-green-200 px-5 py-3 text-sm font-semibold text-green-900 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-green-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update club' : 'Create club'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
