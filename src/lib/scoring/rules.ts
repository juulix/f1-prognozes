export const SESSION_TYPES = {
  QUALIFYING: "QUALIFYING",
  SPRINT: "SPRINT",
  RACE: "RACE",
} as const;

export type SessionType = (typeof SESSION_TYPES)[keyof typeof SESSION_TYPES];

export const SCORING = {
  qualifying: {
    exactPole: 5,
  },
  sprint: {
    exactPosition: 10,
    inTopThree: 3,
  },
  race: {
    exactPosition: 10,
    inTopThree: 3,
  },
  bonus: {
    allThreeExact: 5,
  },
  season: {
    championDriver: 50,
    championTeam: 30,
  },
} as const;
