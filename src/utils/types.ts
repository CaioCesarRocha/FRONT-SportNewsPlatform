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
}

export type ClubTitle = {
  titlesCount: number;
  championship: Championship;
}

export type Club = {
  id: string;
  name: string;
  country: string;
  state: string;
  shield: string;
  stadium: string;
  titles: ClubTitle[];
}

export type CreateClubInput = Omit<Club, 'id' | 'titles' | 'shield'> & {
  shield: File;
}

export type CreateChampionshipInput = {
  clubs: string[];
  clubsCount: number;
  emblem: File;
  name: string;
  type: ChampionshipType;
  weight: number;
}
