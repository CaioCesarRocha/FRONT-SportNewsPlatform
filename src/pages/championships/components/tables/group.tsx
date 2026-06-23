import { useMemo } from 'react'
import LeagueTable from './league'
import type { Club, Round } from '../../../../utils/types'
import type { LeagueTableRow } from './league'

function getRoundNumber(identifier: string) {
  return parseInt(identifier.match(/\d+/)?.[0] ?? '0', 10)
}

function computeRows(rounds: Round[], maxIdentifier: string): LeagueTableRow[] {
  const maxNum = getRoundNumber(maxIdentifier)

  const included = rounds.filter((r) => r && getRoundNumber(r.identifier) <= maxNum)

  const map = new Map<string, LeagueTableRow>()

  function initClub(club: Club) {
    if (!club || map.has(club.id)) return
    map.set(club.id, {
      club,
      position: 0,
      points: 0,
      gamesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      percentage: 0,
      lastGames: [],
    })
  }

  included.forEach((match) => {
    if (!match) return
    if (match.homeTeam) initClub(match.homeTeam)
    if (match.visitTeam) initClub(match.visitTeam)
  })

  included.forEach((match) => {
    if (!match) return
    const home = map.get(match.homeTeam?.id)
    const visit = map.get(match.visitTeam?.id)
    if (!home || !visit) return

    home.gamesPlayed++
    visit.gamesPlayed++
    home.goalsFor += match.homeGoals
    home.goalsAgainst += match.visitGoals
    visit.goalsFor += match.visitGoals
    visit.goalsAgainst += match.homeGoals

    if (match.homeGoals > match.visitGoals) {
      home.wins++
      home.points += 3
      visit.losses++
      home.lastGames.push({ result: 'win', homeSlug: match.homeTeam?.slug ?? '', visitSlug: match.visitTeam?.slug ?? '', homeGoals: match.homeGoals, visitGoals: match.visitGoals })
      visit.lastGames.push({ result: 'loss', homeSlug: match.homeTeam?.slug ?? '', visitSlug: match.visitTeam?.slug ?? '', homeGoals: match.homeGoals, visitGoals: match.visitGoals })
    } else if (match.homeGoals < match.visitGoals) {
      visit.wins++
      visit.points += 3
      home.losses++
      home.lastGames.push({ result: 'loss', homeSlug: match.homeTeam?.slug ?? '', visitSlug: match.visitTeam?.slug ?? '', homeGoals: match.homeGoals, visitGoals: match.visitGoals })
      visit.lastGames.push({ result: 'win', homeSlug: match.homeTeam?.slug ?? '', visitSlug: match.visitTeam?.slug ?? '', homeGoals: match.homeGoals, visitGoals: match.visitGoals })
    } else {
      home.draws++
      visit.draws++
      home.points += 1
      visit.points += 1
      home.lastGames.push({ result: 'draw', homeSlug: match.homeTeam?.slug ?? '', visitSlug: match.visitTeam?.slug ?? '', homeGoals: match.homeGoals, visitGoals: match.visitGoals })
      visit.lastGames.push({ result: 'draw', homeSlug: match.homeTeam?.slug ?? '', visitSlug: match.visitTeam?.slug ?? '', homeGoals: match.homeGoals, visitGoals: match.visitGoals })
    }
  })

  const rows = Array.from(map.values())
  rows.forEach((row) => {
    row.goalDifference = row.goalsFor - row.goalsAgainst
    row.percentage = row.gamesPlayed > 0 ? Math.round((row.points / (row.gamesPlayed * 3)) * 100) : 0
    if (row.lastGames.length > 5) {
      row.lastGames = row.lastGames.slice(-5)
    }
  })

  rows.sort((a, b) => b.points - a.points || b.wins - a.wins || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor)
  rows.forEach((row, i) => { row.position = i + 1 })

  return rows
}

type GroupTableProps = {
  rounds: Round[]
  relegation?: number
  qualifyOne?: number
  qualifyTwo?: number
}

export default function GroupTable({ rounds, relegation = 0, qualifyOne = 0, qualifyTwo = 0 }: GroupTableProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, Round[]>()

    rounds.forEach((r) => {
      if (!r) return
      const key = (r.phase || r.identifier).toLowerCase()
      if (!key.includes('group')) return
      const list = map.get(key) ?? []
      list.push(r)
      map.set(key, list)
    })

    return Array.from(map.entries()).sort(([a], [b]) => {
      const numA = parseInt(a.match(/\d+/)?.[0] ?? '0', 10)
      const numB = parseInt(b.match(/\d+/)?.[0] ?? '0', 10)
      return numA - numB
    })
  }, [rounds])

  const groupRows = useMemo(() => {
    return grouped.map(([phase, groupRounds]) => {
      const maxIdentifier = groupRounds.reduce((max, r) => {
        const num = getRoundNumber(r.identifier)
        const maxNum = getRoundNumber(max)
        return num > maxNum ? r.identifier : max
      }, groupRounds[0]?.identifier ?? '')

      const rows = computeRows(groupRounds, maxIdentifier)
      return { identifier: phase, rows }
    })
  }, [grouped])

  if (groupRows.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">No groups registered</p>
  }

  return (
    <div className="space-y-8">
      {groupRows.map(({ identifier, rows }) => (
        <div key={identifier}>
          <h3 className="mb-3 text-lg font-bold uppercase tracking-[0.1em] text-gray-300">
            {identifier}
          </h3>
          <LeagueTable rows={rows} qualifyCount={qualifyOne > 0 ? Math.floor(qualifyOne / groupRows.length) : 0} qualifyTwoCount={qualifyTwo > 0 ? Math.floor(qualifyTwo / groupRows.length) : 0} relegation={relegation > 0 ? Math.floor(relegation / groupRows.length) : 0} />
        </div>
      ))}
    </div>
  )
}
