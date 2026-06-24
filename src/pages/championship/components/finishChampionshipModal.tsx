import { useCallback, useEffect, useState } from 'react'
import { cn } from '../../../utils/cn'
import Button from '../../../components/button'
import useFinishChampionship from '../../../hooks/useFinishChampionship'
import type { Club } from '../../../utils/types'

type FinishChampionshipModalProps = {
  championshipId: number
  clubs: Club[]
  isOpen: boolean
  onClose: () => void
}

const inputClassName =
  'w-full rounded-2xl border border-green-200 bg-white px-4 py-3 text-green-950 outline-none transition-colors placeholder:text-green-700/60 focus:border-green-500'

export default function FinishChampionshipModal({
  championshipId,
  clubs,
  isOpen,
  onClose,
}: FinishChampionshipModalProps) {
  const { finishChampionship, error: mutateError, isLoading } = useFinishChampionship()
  const [selectedClubId, setSelectedClubId] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setSelectedClubId('')
  }, [isOpen])

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
    setSelectedClubId('')
    onClose()
  }, [isLoading, onClose])

  const handleConfirm = async () => {
    if (!selectedClubId) return

    try {
      await finishChampionship({ championshipId, clubId: selectedClubId })
      handleClose()
    } catch {
      // error handled by hook
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <Button
        aria-label="Close finish championship modal"
        onClick={isLoading ? undefined : handleClose}
        className="absolute inset-0 bg-green-950/55"
      />

      <div
        aria-modal="true"
        role="dialog"
        className="relative z-10 w-full max-w-md rounded-[28px] bg-[#f6f3e8] p-6 text-green-950 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-4">
            <p className="text-md font-bold uppercase tracking-[0.12em] text-green-800/70">
              Finish championship
            </p>
            <p className="text-sm text-green-900/70">
              Select the champion club to finish this championship.
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

        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-green-900">
              Champion club <span className="text-red-500">*</span>
            </span>
            <select
              className={inputClassName}
              value={selectedClubId}
              onChange={(e) => setSelectedClubId(e.target.value)}
            >
              <option value="">Select a club</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </label>

          {mutateError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {'Error to finish championship. Try again later'}
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
              onClick={handleConfirm}
              disabled={isLoading || !selectedClubId}
              className={cn(
                'rounded-full bg-green-700 px-5 py-3 text-sm font-semibold cursor-pointer',
                'text-white transition-colors hover:bg-green-800',
                'disabled:cursor-not-allowed disabled:opacity-60',
              )}
            >
              {isLoading ? 'Finishing...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
