import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LeagueTable from '../championships/components/tables/league'
import EliminationRoundTable from '../championships/components/tables/eliminationRound'
import { getAvailablePhases, MatchCard } from '../championships/components/tables/eliminationRound'
import GroupTable from '../championships/components/tables/group'
import RoundMatches from './components/roundMatches'
import AddRoundModal from './components/addRoundModal'
import FinishChampionshipModal from './components/finishChampionshipModal'
import Button from '../../components/button'
import useGetOneChampionship from '../../hooks/useGetOneChampionship'
import useGetRounds from '../../hooks/useGetRounds'
import { ChampionshipType } from '../../utils/types'
import type { Round, Club } from '../../utils/types'
import type { LeagueTableRow } from '../championships/components/tables/league'

function getRoundNumber(identifier: string) {
  return parseInt(identifier.match(/\d+/)?.[0] ?? '0', 10)
}

function computeRows(clubs: Club[], rounds: Round[], maxIdentifier: string): LeagueTableRow[] {
  const maxNum = getRoundNumber(maxIdentifier)

  const included = rounds.filter((r) => r && getRoundNumber(r.identifier) <= maxNum)

  const map = new Map<string, LeagueTableRow>()

  clubs.forEach((club) => {
    if (!club) return
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
      home.lastGames.push({
        result: 'win',
        homeSlug: match.homeTeam?.slug ?? '',
        visitSlug: match.visitTeam?.slug ?? '',
        homeGoals: match.homeGoals,
        visitGoals: match.visitGoals,
      })
      visit.lastGames.push({
        result: 'loss',
        homeSlug: match.homeTeam?.slug ?? '',
        visitSlug: match.visitTeam?.slug ?? '',
        homeGoals: match.homeGoals,
        visitGoals: match.visitGoals,
      })
    } else if (match.homeGoals < match.visitGoals) {
      visit.wins++
      visit.points += 3
      home.losses++
      home.lastGames.push({
        result: 'loss',
        homeSlug: match.homeTeam?.slug ?? '',
        visitSlug: match.visitTeam?.slug ?? '',
        homeGoals: match.homeGoals,
        visitGoals: match.visitGoals,
      })
      visit.lastGames.push({
        result: 'win',
        homeSlug: match.homeTeam?.slug ?? '',
        visitSlug: match.visitTeam?.slug ?? '',
        homeGoals: match.homeGoals,
        visitGoals: match.visitGoals,
      })
    } else {
      home.draws++
      visit.draws++
      home.points += 1
      visit.points += 1
      home.lastGames.push({
        result: 'draw',
        homeSlug: match.homeTeam?.slug ?? '',
        visitSlug: match.visitTeam?.slug ?? '',
        homeGoals: match.homeGoals,
        visitGoals: match.visitGoals,
      })
      visit.lastGames.push({
        result: 'draw',
        homeSlug: match.homeTeam?.slug ?? '',
        visitSlug: match.visitTeam?.slug ?? '',
        homeGoals: match.homeGoals,
        visitGoals: match.visitGoals,
      })
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

function EliminationPhaseView({
  championshipId,
  phase,
  onEditMatch,
}: {
  championshipId: number
  phase: string
  onEditMatch?: (match: Round) => void
}) {
  const { rounds, isLoading } = useGetRounds(championshipId, phase)

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

  if (isLoading) {
    return <p className="text-green-700">Loading...</p>
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] rounded-[6px] bg-gray-800 p-4">
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
  )
}

export default function ChampionshipDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const championshipId = id ? Number(id) : undefined

  const { championship, clubs, isLoading: loadingChamp } = useGetOneChampionship(championshipId)
  const { rounds, roundIdentifiers, isLoading: loadingRounds } = useGetRounds(championshipId)

  const [roundIndex, setRoundIndex] = useState(-1)
  const [isAddRoundOpen, setIsAddRoundOpen] = useState(false)
  const [isFinishOpen, setIsFinishOpen] = useState(false)
  const [editingMatch, setEditingMatch] = useState<Round | null>(null)
  const [groupPhaseIndex, setGroupPhaseIndex] = useState(0)
  const prevRoundsLength = useRef(0)

  useEffect(() => {
    if (roundIdentifiers.length > prevRoundsLength.current) {
      setRoundIndex(roundIdentifiers.length - 1)
    }
    prevRoundsLength.current = roundIdentifiers.length
  }, [roundIdentifiers])

  const currentIdentifier = roundIndex >= 0 ? roundIdentifiers[roundIndex] : undefined
  const matches = useMemo(
    () => rounds.filter((r) => r?.identifier === currentIdentifier),
    [rounds, currentIdentifier],
  )

  const leagueRows = useMemo(
    () => (currentIdentifier ? computeRows(clubs, rounds, currentIdentifier) : []),
    [clubs, rounds, currentIdentifier],
  )

  const qualifyCount = championship?.qualifyOne ?? 0

  const eliminationPhases = useMemo(
    () => getAvailablePhases(qualifyCount),
    [qualifyCount],
  )

  const totalPhases = 1 + eliminationPhases.length
  const currentEliminationPhase = groupPhaseIndex > 0 ? eliminationPhases[groupPhaseIndex - 1] : ''

  const isLoading = loadingChamp || loadingRounds

  const isElimination = championship?.type === ChampionshipType.EliminationRounds

  const showContentLoading = isElimination ? loadingChamp : isLoading

  const qualifyTwoCount = championship?.qualifyTwo ?? 0

  return (
    <div className="w-full p-2">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-800/70">Championship</p>
          <h2 className="mt-2 text-3xl font-semibold text-green-950">{championship?.name ?? ''}</h2>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsFinishOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-green-700 px-5 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
          >
            Finish
          </Button>
         
          <Button
            onClick={() => setIsAddRoundOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-green-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800"
          >
            Add Round
          </Button>
          <Button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-green-700 px-5 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
          >
            Back
          </Button>
        </div>
      </div>

      {showContentLoading ? (
        <p className="text-green-700">Loading...</p>
      ) : isElimination ? (
        <EliminationRoundTable
          championshipId={championshipId!}
          clubs={clubs}
          clubsCount={championship?.clubsCount ?? 0}
          onEditMatch={setEditingMatch}
        />
      ) : championship?.type === ChampionshipType.Groups ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setGroupPhaseIndex((i) => i - 1)}
              disabled={groupPhaseIndex === 0}
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-gray-300">
              {groupPhaseIndex === 0 ? 'Fase de Grupos' : currentEliminationPhase}
            </h3>

            <button
              onClick={() => setGroupPhaseIndex((i) => i + 1)}
              disabled={groupPhaseIndex >= totalPhases - 1}
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {groupPhaseIndex === 0 ? (
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="min-w-0 flex-1">
                <GroupTable rounds={rounds} relegation={championship?.relegation} qualifyOne={qualifyCount} qualifyTwo={qualifyTwoCount} />
              </div>
              <div className="w-full shrink-0 lg:w-[340px]">
                <RoundMatches
                  matches={matches}
                  roundIdentifier={currentIdentifier ?? ''}
                  onPrev={() => setRoundIndex((i) => i - 1)}
                  onNext={() => setRoundIndex((i) => i + 1)}
                  hasPrev={roundIndex > 0}
                  hasNext={roundIndex < roundIdentifiers.length - 1}
                  onEditMatch={setEditingMatch}
                />
              </div>
            </div>
          ) : (
            <EliminationPhaseView
              championshipId={championshipId!}
              phase={currentEliminationPhase}
              onEditMatch={setEditingMatch}
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="min-w-0 flex-1">
            <LeagueTable rows={leagueRows} qualifyCount={qualifyCount} qualifyTwoCount={qualifyTwoCount} relegation={championship?.relegation} />
          </div>
          <div className="w-full shrink-0 lg:w-[340px]">
            <RoundMatches
              matches={matches}
              roundIdentifier={currentIdentifier ?? ''}
              onPrev={() => setRoundIndex((i) => i - 1)}
              onNext={() => setRoundIndex((i) => i + 1)}
              hasPrev={roundIndex > 0}
              hasNext={roundIndex < roundIdentifiers.length - 1}
              onEditMatch={setEditingMatch}
            />
          </div>
        </div>
      )}
      <FinishChampionshipModal
        championshipId={championshipId!}
        clubs={clubs}
        isOpen={isFinishOpen}
        onClose={() => setIsFinishOpen(false)}
      />
      <AddRoundModal
        championshipId={championshipId!}
        clubs={clubs}
        editingRound={editingMatch}
        isOpen={isAddRoundOpen || !!editingMatch}
        onClose={() => {
          setIsAddRoundOpen(false)
          setEditingMatch(null)
        }}
      />
    </div>
  )
}
