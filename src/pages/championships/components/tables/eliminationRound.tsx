import { useState, useMemo } from 'react'
import useGetRounds from '../../../../hooks/useGetRounds'
import type { Club, Round } from '../../../../utils/types'

export const PHASE_ORDER = ['fase 128', 'fase 64', 'fase 32', 'octfinal', 'quarterfinal', 'semifinal', 'final']

export const phasesChamp24teams = ['octfinal a', 'octfinal b', 'quarterfinal', 'semifinal', 'final']

export function getAvailablePhases(clubsCount: number): string[] {
  if (clubsCount >= 128) return PHASE_ORDER
  if (clubsCount >= 64) return PHASE_ORDER.slice(1)
  if (clubsCount >= 32) return PHASE_ORDER.slice(2)
  if (clubsCount === 24) return phasesChamp24teams
  if (clubsCount >= 16) return PHASE_ORDER.slice(3)
  if (clubsCount >= 8) return PHASE_ORDER.slice(4)
  if (clubsCount >= 4) return PHASE_ORDER.slice(5)
  return PHASE_ORDER.slice(6)
}

export function formatDate(date: Date | string) {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function MatchCard({ match, onEdit }: { match: Round; onEdit?: (match: Round) => void }) {
  return (
    <div className="relative min-w-[420px] flex-1 rounded-[4px] bg-gray-700/50 p-3">
      {onEdit ? (
        <button
          type="button"
          onClick={() => onEdit(match)}
          className="absolute cursor-pointer right-0 top-0 flex h-6 w-6 items-center justify-center rounded-tr-[4px] rounded-bl-full bg-gray-700 text-gray-400 transition-colors hover:bg-gray-600 hover:text-gray-100"
          aria-label="Edit match"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 translate-x-[3px] -translate-y-[4px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>
      ) : null}
      <div className="mb-1 text-center text-xs text-gray-400">
        {match.homeTeam?.stadium ?? ''} - {formatDate(match.date)}
      </div>
      <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-100">
        <span className="truncate">{match.homeTeam?.name ?? ''}</span>
        {match.homeTeam?.shield ? (
          <img src={match.homeTeam.shield} alt="" className="h-5 w-5 shrink-0 rounded-full object-contain" />
        ) : null}
        <span className="shrink-0 font-bold text-white">
          {match.homeGoals} x {match.visitGoals}
        </span>
        {match.visitTeam?.shield ? (
          <img src={match.visitTeam.shield} alt="" className="h-5 w-5 shrink-0 rounded-full object-contain" />
        ) : null}
        <span className="truncate">{match.visitTeam?.name ?? ''}</span>
      </div>
    </div>
  )
}

type EliminationRoundTableProps = {
  championshipId: number
  clubs: Club[]
  clubsCount: number
  onEditMatch?: (match: Round) => void
}

export default function EliminationRoundTable({
  championshipId,
  clubs: _clubs,
  clubsCount,
  onEditMatch,
}: EliminationRoundTableProps) {
  const availablePhases = useMemo(() => getAvailablePhases(clubsCount), [clubsCount])

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)

  const currentPhase = availablePhases[currentPhaseIndex] ?? ''

  const { rounds, isLoading } = useGetRounds(championshipId, currentPhase)

  const groupedByIdentifier = useMemo(() => {
    const map = new Map<string, Round[]>()
    rounds.forEach((r) => {
      const list = map.get(r.identifier) ?? []
      list.push(r)
      map.set(r.identifier, list)
    })
    return Array.from(map.entries()).sort(([a], [b]) => {
      const numA = parseInt(a.match(/\d+/)?.[0] ?? '0', 10)
      const numB = parseInt(b.match(/\d+/)?.[0] ?? '0', 10)
      return numA - numB
    })
  }, [rounds])

  const hasPrev = currentPhaseIndex > 0
  const hasNext = currentPhaseIndex < availablePhases.length - 1

  if (isLoading) {
    return <p className="text-green-700">Loading...</p>
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1200px] flex items-center flex-col rounded-[6px] bg-gray-800 p-4">
        <div className="mb-4 w-full flex items-center justify-between">
          <button
            onClick={() => setCurrentPhaseIndex((i) => i - 1)}
            disabled={!hasPrev}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-gray-300">
            {currentPhase || '—'}
          </h3>

          <button
            onClick={() => setCurrentPhaseIndex((i) => i + 1)}
            disabled={!hasNext}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {groupedByIdentifier.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No game registered</p>
        ) : (
          <div className="space-y-6">
            {groupedByIdentifier.map(([identifier, matches]) => {
              const [game1, game2] = matches

              return (
                <div key={identifier}>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      {game1 ? (
                        <MatchCard match={game1} onEdit={onEditMatch} />
                      ) : (
                        <div className="flex h-full min-h-[72px] min-w-[420px] items-center justify-center rounded-[4px] bg-gray-700/30 text-xs text-gray-500">
                          Empty
                        </div>
                      )}
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600 text-xs font-bold text-gray-200">
                      {identifier}
                    </div>

                    <div className="flex-1">
                      {game2 ? (
                        <MatchCard match={game2} onEdit={onEditMatch} />
                      ) : (
                        <div className="flex h-full min-h-[72px] min-w-[420px] items-center justify-center rounded-[4px] bg-gray-700/30 text-xs text-gray-500">
                          Empty
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
