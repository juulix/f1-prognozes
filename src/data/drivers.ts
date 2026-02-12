export interface Driver {
  id: string;
  name: string;
  short: string;
  number: number;
  teamId: string;
  emoji: string;
}

export const DRIVERS: Driver[] = [
  // Red Bull Racing
  { id: "verstappen", name: "Max Verstappen",      short: "VER", number: 1,  teamId: "redbull",     emoji: "🦁" },
  { id: "lawson",     name: "Liam Lawson",          short: "LAW", number: 30, teamId: "redbull",     emoji: "🥝" },

  // McLaren
  { id: "norris",     name: "Lando Norris",         short: "NOR", number: 4,  teamId: "mclaren",     emoji: "🧡" },
  { id: "piastri",    name: "Oscar Piastri",        short: "PIA", number: 81, teamId: "mclaren",     emoji: "🦘" },

  // Ferrari
  { id: "leclerc",    name: "Charles Leclerc",      short: "LEC", number: 16, teamId: "ferrari",     emoji: "🎰" },
  { id: "hamilton",   name: "Lewis Hamilton",        short: "HAM", number: 44, teamId: "ferrari",     emoji: "👑" },

  // Mercedes
  { id: "russell",    name: "George Russell",        short: "RUS", number: 63, teamId: "mercedes",    emoji: "🎩" },
  { id: "antonelli",  name: "Andrea Kimi Antonelli", short: "ANT", number: 12, teamId: "mercedes",    emoji: "🇮🇹" },

  // Aston Martin
  { id: "alonso",     name: "Fernando Alonso",       short: "ALO", number: 14, teamId: "astonmartin", emoji: "🐐" },
  { id: "stroll",     name: "Lance Stroll",          short: "STR", number: 18, teamId: "astonmartin", emoji: "💰" },

  // Alpine
  { id: "gasly",      name: "Pierre Gasly",          short: "GAS", number: 10, teamId: "alpine",      emoji: "🇫🇷" },
  { id: "doohan",     name: "Jack Doohan",           short: "DOO", number: 7,  teamId: "alpine",      emoji: "🏍️" },

  // Williams
  { id: "sainz",      name: "Carlos Sainz",          short: "SAI", number: 55, teamId: "williams",    emoji: "🌶️" },
  { id: "albon",      name: "Alexander Albon",       short: "ALB", number: 23, teamId: "williams",    emoji: "🐘" },

  // Haas
  { id: "bearman",    name: "Oliver Bearman",        short: "BEA", number: 87, teamId: "haas",        emoji: "🐻" },
  { id: "ocon",       name: "Esteban Ocon",          short: "OCO", number: 31, teamId: "haas",        emoji: "🇫🇷" },

  // Kick Sauber
  { id: "hulkenberg", name: "Nico Hülkenberg",       short: "HUL", number: 27, teamId: "sauber",      emoji: "💪" },
  { id: "bortoleto",  name: "Gabriel Bortoleto",     short: "BOR", number: 5,  teamId: "sauber",      emoji: "🇧🇷" },

  // Racing Bulls
  { id: "tsunoda",    name: "Yuki Tsunoda",          short: "TSU", number: 22, teamId: "rb",          emoji: "🇯🇵" },
  { id: "hadjar",     name: "Isack Hadjar",          short: "HAD", number: 6,  teamId: "rb",          emoji: "⚡" },
];

export function getDriverById(id: string): Driver | undefined {
  return DRIVERS.find((d) => d.id === id);
}

export function getDriversByTeam(teamId: string): Driver[] {
  return DRIVERS.filter((d) => d.teamId === teamId);
}

export function searchDrivers(query: string): Driver[] {
  const q = query.toLowerCase();
  return DRIVERS.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.short.toLowerCase().includes(q) ||
      d.number.toString().includes(q) ||
      d.teamId.toLowerCase().includes(q)
  );
}
