import type { Round } from '../../../utils/types'

type RoundMatchesProps = {
  matches: Round[]
  roundIdentifier: string
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
  onEditMatch?: (match: Round) => void
}

function formatDate(date: Date | string) {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function RoundMatches({
  matches,
  roundIdentifier,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  onEditMatch,
}: RoundMatchesProps) {
  return (
    <div className="w-full min-w-[320px] rounded-[6px] bg-gray-800 p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex h-7 w-7 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-gray-300">
          {roundIdentifier}
        </h3>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className="flex h-7 w-7 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-30 translate-x-[0px] -translate-y-[4px]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {matches.map((match) => (
          <div
            key={match.id}
            className="relative rounded-[4px] bg-gray-700/50 p-3"
          >
            {onEditMatch ? (
              <button
                type="button"
                onClick={() => onEditMatch(match)}
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
              <span className="truncate">{match.homeTeam?.slug ?? ''}</span>
              {match.homeTeam?.shield ? (
                <img src={match.homeTeam.shield} alt="" className="h-5 w-5 shrink-0 rounded-full object-contain" />
              ) : null}
              <span className="shrink-0 font-bold text-white">
                {match.homeGoals} x {match.visitGoals}
              </span>
              {match.visitTeam?.shield ? (
                <img src={match.visitTeam.shield} alt="" className="h-5 w-5 shrink-0 rounded-full object-contain" />
              ) : null}
              <span className="truncate">{match.visitTeam?.slug ?? ''}</span>
            </div>
          </div>
        ))}
        {matches.length === 0 && (
          <p className="text-center text-sm text-gray-500">No matches</p>
        )}
      </div>
    </div>
  )
}
