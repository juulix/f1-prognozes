export interface Team {
  id: string;
  name: string;
  short: string;
  emoji: string;
  color: string;
  logoUrl: string;
}

const F1_CDN = "https://media.formula1.com/image/upload/f_png,w_128/q_auto/v1740000000/common/f1/2025";

export const TEAMS: Team[] = [
  { id: "redbull",      name: "Red Bull Racing",   short: "RBR", emoji: "🐂", color: "#3671C6", logoUrl: `${F1_CDN}/redbullracing/2025redbullracinglogo.png` },
  { id: "mclaren",      name: "McLaren",           short: "MCL", emoji: "🟠", color: "#FF8000", logoUrl: `${F1_CDN}/mclaren/2025mclarenlogo.png` },
  { id: "ferrari",      name: "Ferrari",           short: "FER", emoji: "🐎", color: "#E8002D", logoUrl: `${F1_CDN}/ferrari/2025ferrarilogo.png` },
  { id: "mercedes",     name: "Mercedes",          short: "MER", emoji: "⭐", color: "#27F4D2", logoUrl: `${F1_CDN}/mercedes/2025mercedeslogo.png` },
  { id: "astonmartin",  name: "Aston Martin",      short: "AMR", emoji: "🦚", color: "#229971", logoUrl: `${F1_CDN}/astonmartin/2025astonmartinlogo.png` },
  { id: "alpine",       name: "Alpine",            short: "ALP", emoji: "🏔️", color: "#0093CC", logoUrl: `${F1_CDN}/alpine/2025alpinelogo.png` },
  { id: "williams",     name: "Williams",          short: "WIL", emoji: "🔵", color: "#64C4FF", logoUrl: `${F1_CDN}/williams/2025williamslogo.png` },
  { id: "haas",         name: "Haas",              short: "HAA", emoji: "🇺🇸", color: "#B6BABD", logoUrl: `${F1_CDN}/haasf1team/2025haasf1teamlogo.png` },
  { id: "sauber",       name: "Kick Sauber",       short: "SAU", emoji: "🟢", color: "#52E252", logoUrl: `${F1_CDN}/kicksauber/2025kicksauberlogo.png` },
  { id: "rb",           name: "Racing Bulls",      short: "RB",  emoji: "🔷", color: "#6692FF", logoUrl: `${F1_CDN}/racingbulls/2025racingbullslogo.png` },
];

export function getTeamById(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}

export function getTeamByShort(short: string): Team | undefined {
  return TEAMS.find((t) => t.short === short);
}
