export const ChampionshipType = {
  Mixed: 'mixed',
  League: 'league',
  Groups: 'groups',
  EliminationRounds: 'elimination rounds',
} as const

export type ChampionshipType = (typeof ChampionshipType)[keyof typeof ChampionshipType]

export type Championship = {
  id: number;
  name: string;
  emblem: string;
  type: ChampionshipType;
  weight: number;
  clubsCount: number;
  relegation: number;
  qualifyOne: number;
  qualifyTwo: number;
}

export type ClubTitle = {
  championship: Championship;
}

export type Club = {
  id: string;
  name: string;
  country: string;
  state: string;
  shield: string;
  stadium: string;
  slug: string;
  titles: ClubTitle[];
}

export type Round = {
  id: string;
  championshipId: number;
  identifier: string;
  phase: string;
  homeTeam: Club;
  visitTeam: Club;
  homeGoals: number;
  visitGoals: number;
  date: Date;
}

export type CreateClubInput = Omit<Club, 'id' | 'titles' | 'shield'> & {
  shield: File;
}

export type UpdateClubInput = { id: string } & Omit<CreateClubInput, 'shield'> & {
  shield?: File;
}

export type ChampionshipWithClubs = Championship & {
  clubs: Club[]
}

export type CreateChampionshipInput = {
  clubs: string[];
  clubsCount: number;
  emblem: File;
  name: string;
  type: ChampionshipType;
  weight: number;
  relegation: number;
  qualifyOne: number;
  qualifyTwo: number;
}

export type UpdateChampionshipInput = {
  id: number;
  name: string;
  weight: number;
  emblem?: File;
  relegation: number;
  qualifyOne: number;
  qualifyTwo: number;
}
