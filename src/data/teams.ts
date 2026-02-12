export interface Team {
  id: string;
  name: string;
  short: string;
  emoji: string;
  color: string;
}

export const TEAMS: Team[] = [
  { id: "redbull",      name: "Red Bull Racing",   short: "RBR", emoji: "🐂", color: "#3671C6" },
  { id: "mclaren",      name: "McLaren",           short: "MCL", emoji: "🟠", color: "#FF8000" },
  { id: "ferrari",      name: "Ferrari",           short: "FER", emoji: "🐎", color: "#E8002D" },
  { id: "mercedes",     name: "Mercedes",          short: "MER", emoji: "⭐", color: "#27F4D2" },
  { id: "astonmartin",  name: "Aston Martin",      short: "AMR", emoji: "🦚", color: "#229971" },
  { id: "alpine",       name: "Alpine",            short: "ALP", emoji: "🏔️", color: "#0093CC" },
  { id: "williams",     name: "Williams",          short: "WIL", emoji: "🔵", color: "#64C4FF" },
  { id: "haas",         name: "Haas",              short: "HAA", emoji: "🇺🇸", color: "#B6BABD" },
  { id: "sauber",       name: "Kick Sauber",       short: "SAU", emoji: "🟢", color: "#52E252" },
  { id: "rb",           name: "Racing Bulls",      short: "RB",  emoji: "🔷", color: "#6692FF" },
];

export function getTeamById(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}

export function getTeamByShort(short: string): Team | undefined {
  return TEAMS.find((t) => t.short === short);
}
