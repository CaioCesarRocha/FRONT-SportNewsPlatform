import { useState } from 'react'
import { Link } from 'react-router-dom'
import useListAllClubs from '../../hooks/useListAllClubs'
import useGetClubsPerformance from '../../hooks/useGetClubsPerformance'
import type { Club, ClubPerformance } from '../../utils/types'

type ClubRanking = {
  club: Club
  totalScore: number
  maxWeight: number
}

type CountryRanking = {
  country: string
  totalScore: number
  maxWeight: number
}

function calcClubScore(club: Club) {
  let totalScore = 0
  let maxWeight = 0

  for (const t of club.titles) {
    totalScore += t.championship.weight
    if (t.championship.weight > maxWeight) {
      maxWeight = t.championship.weight
    }
  }

  return { totalScore, maxWeight }
}

function buildClubRanking(clubs: Club[]): ClubRanking[] {
  return clubs
    .map((club) => ({ club, ...calcClubScore(club) }))
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore
      return b.maxWeight - a.maxWeight
    })
}

function buildCountryRanking(clubs: Club[]): CountryRanking[] {
  const map = new Map<string, { totalScore: number; maxWeight: number }>()

  for (const club of clubs) {
    const { totalScore, maxWeight } = calcClubScore(club)
    const prev = map.get(club.country)
    if (prev) {
      prev.totalScore += totalScore
      if (maxWeight > prev.maxWeight) prev.maxWeight = maxWeight
    } else {
      map.set(club.country, { totalScore, maxWeight })
    }
  }

  return Array.from(map.entries())
    .map(([country, score]) => ({ country, ...score }))
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore
      return b.maxWeight - a.maxWeight
    })
}

function getDisplayPositions<T extends { totalScore: number; maxWeight: number }>(ranking: T[]): number[] {
  const positions: number[] = []
  let pos = 1

  for (let i = 0; i < ranking.length; i++) {
    if (i > 0 && (ranking[i].totalScore !== ranking[i - 1].totalScore || ranking[i].maxWeight !== ranking[i - 1].maxWeight)) {
      pos = i + 1
    }
    positions.push(pos)
  }

  return positions
}

function PositionBadge({ position }: { position: number }) {
  const colors =
    position === 1
      ? 'bg-yellow-400 text-yellow-900'
      : position === 2
        ? 'bg-gray-300 text-gray-700'
        : position === 3
          ? 'bg-amber-600 text-amber-100'
          : 'bg-[var(--code-bg)] text-[var(--text)]'

  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${colors}`}>
      {position}
    </span>
  )
}

function PerformanceTable({ ranking, sortBy, onSortChange }: {
  ranking: ClubPerformance[]
  sortBy: string
  onSortChange: (value: 'victory' | 'pontuation' | 'performance') => void
}) {
  const options: { value: 'victory' | 'pontuation' | 'performance'; label: string }[] = [
    { value: 'victory', label: 'Victory' },
    { value: 'pontuation', label: 'Pontuation' },
    { value: 'performance', label: 'Performance' },
  ]

  return (
    <div className="flex-[2] max-h-[80vh] overflow-auto rounded-lg border border-[var(--border)]">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-[var(--bg)] px-4 py-2 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-h)]">Performance</h3>
        <div className="flex gap-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                sortBy === opt.value
                  ? 'bg-[var(--text-h)] text-[var(--bg)]'
                  : 'bg-[var(--code-bg)] text-[var(--text)] hover:bg-[var(--border)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-[var(--bg)]">
          <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
            <th className="px-4 py-3 w-64">Classification</th>
            <th className="px-4 py-3 w-20 text-right">Pts</th>
            <th className="px-4 py-3 w-20 text-right">J</th>
            <th className="px-4 py-3 w-20 text-right">W</th>
            <th className="px-4 py-3 w-20 text-right">D</th>
            <th className="px-4 py-3 w-20 text-right">L</th>
            <th className="px-4 py-3 w-24 text-right">%</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((item, index) => (
            <tr
              key={item.id}
              className="border-b border-[var(--border)] transition-colors hover:bg-[var(--accent-bg)]"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <PositionBadge position={index + 1} />
                  <div className="flex items-center gap-2">
                    {item.club.shield ? (
                      <img src={item.club.shield} alt={item.club.name} className="h-6 w-6" />
                    ) : null}
                    <span className="font-medium text-[var(--text-h)]">{item.club.name}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-[var(--text-h)]">{item.pontuation}</td>
              <td className="px-4 py-3 text-right text-[var(--text)]">{item.games}</td>
              <td className="px-4 py-3 text-right text-[var(--text)]">{item.victories}</td>
              <td className="px-4 py-3 text-right text-[var(--text)]">{item.draws}</td>
              <td className="px-4 py-3 text-right text-[var(--text)]">{item.defeats}</td>
              <td className="px-4 py-3 text-right font-semibold text-[var(--text-h)]">{(item.performance * 100).toFixed(2).replace('.', ',')}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ClubTable({ ranking }: { ranking: ClubRanking[] }) {
  const positions = getDisplayPositions(ranking)

  return (
    <div className="flex-[2] max-h-[80vh] overflow-auto rounded-lg border border-[var(--border)]">
      <h3 className="sticky top-0 z-10 bg-[var(--bg)] px-4 py-2 text-sm font-semibold text-[var(--text-h)] border-b border-[var(--border)]">
        Club Ranking
      </h3>
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-[var(--bg)]">
          <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
            <th className="px-4 py-3 w-64">Classification</th>
            <th className="px-4 py-3 w-auto">Titles</th>
            <th className="px-4 py-3 w-24 text-right">Pontuation</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((item, index) => (
            <tr
              key={item.club.id}
              className="border-b border-[var(--border)] transition-colors hover:bg-[var(--accent-bg)]"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <PositionBadge position={positions[index]} />
                  <div className="flex items-center gap-2">
                    {item.club.shield ? (
                      <img src={item.club.shield} alt={item.club.name} className="h-6 w-6" />
                    ) : null}
                    <span className="font-medium text-[var(--text-h)]">{item.club.name}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {item.club.titles.length > 0 ? (
                    item.club.titles.map((t, i) => (
                      <Link
                        key={i}
                        to={`/championship/${t.championship.id}`}
                        className="inline-block rounded-full bg-[var(--code-bg)] px-2.5 py-0.5 text-xs text-[var(--text-h)] transition-colors hover:bg-[var(--border)]"
                      >
                        {t.championship.name}
                      </Link>
                    ))
                  ) : (
                    <span className="text-[var(--text)] italic">No titles</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-[var(--text-h)]">
                {item.totalScore}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CountryTable({ ranking }: { ranking: CountryRanking[] }) {
  return (
    <div className="flex-1 max-h-[80vh] overflow-auto rounded-lg border border-[var(--border)]">
      <h3 className="sticky top-0 z-10 bg-[var(--bg)] px-4 py-2 text-sm font-semibold text-[var(--text-h)] border-b border-[var(--border)]">
        Country Ranking
      </h3>
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-[var(--bg)]">
          <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
            <th className="px-4 py-3 w-64">Classification</th>
            <th className="px-4 py-3 w-24 text-right">Pontuation</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((item, index) => (
            <tr
              key={item.country}
              className="border-b border-[var(--border)] transition-colors hover:bg-[var(--accent-bg)]"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <PositionBadge position={index + 1} />
                  <span className="font-medium text-[var(--text-h)]">{item.country}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-[var(--text-h)]">
                {item.totalScore}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Ranking() {
  const [sortBy, setSortBy] = useState<'victory' | 'pontuation' | 'performance'>('pontuation')
  const { clubs, error, isLoading } = useListAllClubs()
  const { clubsPerformance, error: perfError, isLoading: perfLoading } = useGetClubsPerformance(sortBy)
  const clubRanking = buildClubRanking(clubs)
  const countryRanking = buildCountryRanking(clubs)

  return (
    <div className="flex w-full flex-col p-2 overflow-y-auto">
      <h2 className="mb-4 text-2xl font-semibold text-[var(--text-h)]">World Ranking</h2>

      {isLoading || perfLoading ? <div className="w-full p-4 text-green-900">Loading ranking...</div> : null}
      {error || perfError ? <div className="w-full p-4 text-red-700">{error || perfError}</div> : null}

      {!isLoading && !error && clubs.length === 0 ? (
        <div className="w-full p-4 text-[var(--text)]">No clubs registered yet.</div>
      ) : null}

      {!isLoading && !error && clubs.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-4">
            <ClubTable ranking={clubRanking} />
            <CountryTable ranking={countryRanking} />
          </div>
          <PerformanceTable
            ranking={clubsPerformance}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>
      ) : null}
    </div>
  )
}
