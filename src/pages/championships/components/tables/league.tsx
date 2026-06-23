import type { Club } from '../../../../utils/types'

export type GameResult = 'win' | 'draw' | 'loss'

export type LastGame = {
  result: GameResult
  homeSlug: string
  visitSlug: string
  homeGoals: number
  visitGoals: number
}

export type LeagueTableRow = {
  club: Club
  position: number
  points: number
  gamesPlayed: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  percentage: number
  lastGames: LastGame[]
}

const resultColors: Record<GameResult, string> = {
  win: 'bg-green-500',
  draw: 'bg-gray-400',
  loss: 'bg-red-500',
}

function truncateName(name: string, max = 25) {
  return name.length > max ? `${name.slice(0, max)}...` : name
}

type LeagueTableProps = {
  rows: LeagueTableRow[]
  qualifyCount?: number
  qualifyTwoCount?: number
  relegation?: number
}

export default function LeagueTable({ rows, qualifyCount = 0, qualifyTwoCount = 0, relegation = 0 }: LeagueTableProps) {

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse bg-gray-800 text-sm rounded-[6px]">
        <thead>
          <tr className="border-b border-gray-700 text-left text-xs font-semibold uppercase tracking-[0.1em] text-gray-300">
            <th className="px-3 py-3">Classificação</th>
            <th className="px-3 py-3 text-center [&:nth-child(even)]:bg-gray-900">P</th>
            <th className="px-3 py-3 text-center">J</th>
            <th className="px-3 py-3 text-center [&:nth-child(even)]:bg-gray-900">V</th>
            <th className="px-3 py-3 text-center">E</th>
            <th className="px-3 py-3 text-center [&:nth-child(even)]:bg-gray-900">D</th>
            <th className="px-3 py-3 text-center">GP</th>
            <th className="px-3 py-3 text-center [&:nth-child(even)]:bg-gray-900">GS</th>
            <th className="px-3 py-3 text-center">SG</th>
            <th className="px-3 py-3 text-center [&:nth-child(even)]:bg-gray-900">%</th>
            <th className="px-3 py-3 text-center">Last Games</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.club.id} className="border-b border-gray-700 transition-colors hover:bg-gray-700/50">
              <td className="flex items-center gap-3 px-3 py-3">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                  (() => {
                    if (qualifyCount > 0 && row.position <= qualifyCount) return 'bg-green-700'
                    if (qualifyCount > 0 && qualifyTwoCount > 0 && row.position <= qualifyCount + qualifyTwoCount) return 'bg-blue-700'
                    if (relegation > 0 && row.position > rows.length - relegation) return 'bg-red-700'
                    return 'bg-gray-600'
                  })()
                }`}>
                  {row.position}
                </span>
                <div className="flex items-center gap-2">
                  {row.club.shield ? (
                    <img src={row.club.shield} alt="" className="h-6 w-6 shrink-0 rounded-full object-contain" />
                  ) : null}
                  <span className="font-medium text-gray-100">{truncateName(row.club.name)}</span>
                </div>
              </td>
              <td className="px-3 py-3 text-center font-bold text-white [&:nth-child(even)]:bg-gray-900">{row.points}</td>
              <td className="px-3 py-3 text-center text-gray-300">{row.gamesPlayed}</td>
              <td className="px-3 py-3 text-center text-gray-100 [&:nth-child(even)]:bg-gray-900">{row.wins}</td>
              <td className="px-3 py-3 text-center text-gray-300">{row.draws}</td>
              <td className="px-3 py-3 text-center text-gray-100 [&:nth-child(even)]:bg-gray-900">{row.losses}</td>
              <td className="px-3 py-3 text-center text-gray-300">{row.goalsFor}</td>
              <td className="px-3 py-3 text-center text-gray-100 [&:nth-child(even)]:bg-gray-900">{row.goalsAgainst}</td>
              <td className="px-3 py-3 text-center text-gray-300">{row.goalDifference}</td>
              <td className="px-3 py-3 text-center text-gray-100 [&:nth-child(even)]:bg-gray-900">{row.percentage}%</td>
              <td className="px-3 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  {row.lastGames.length > 0 ? (
                    row.lastGames.map((game, i) => (
                      <span
                        key={i}
                        className="group relative inline-block"
                      >
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full ${resultColors[game.result]}`}
                        />
                        <span className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                          {game.homeSlug} {game.homeGoals} x {game.visitGoals} {game.visitSlug}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">—</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
