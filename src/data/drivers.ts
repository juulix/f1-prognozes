export interface Driver {
  id: string;
  name: string;
  short: string;
  number: number;
  teamId: string;
  emoji: string;
  imageUrl: string;
}

function driverImg(team: string, driverId: string): string {
  return `https://media.formula1.com/image/upload/f_png,w_200,h_200,c_lfill,g_face/q_auto/v1740000000/common/f1/2025/${team}/${driverId}/2025${team}${driverId}right.png`;
}

export const DRIVERS: Driver[] = [
  // Red Bull Racing
  { id: "verstappen", name: "Max Verstappen",      short: "VER", number: 1,  teamId: "redbull",     emoji: "🦁", imageUrl: driverImg("redbullracing", "maxver01") },
  { id: "lawson",     name: "Liam Lawson",          short: "LAW", number: 30, teamId: "redbull",     emoji: "🥝", imageUrl: driverImg("racingbulls", "lialaw01") },

  // McLaren
  { id: "norris",     name: "Lando Norris",         short: "NOR", number: 4,  teamId: "mclaren",     emoji: "🧡", imageUrl: driverImg("mclaren", "lannor01") },
  { id: "piastri",    name: "Oscar Piastri",        short: "PIA", number: 81, teamId: "mclaren",     emoji: "🦘", imageUrl: driverImg("mclaren", "oscpia01") },

  // Ferrari
  { id: "leclerc",    name: "Charles Leclerc",      short: "LEC", number: 16, teamId: "ferrari",     emoji: "🎰", imageUrl: driverImg("ferrari", "chalec01") },
  { id: "hamilton",   name: "Lewis Hamilton",        short: "HAM", number: 44, teamId: "ferrari",     emoji: "👑", imageUrl: driverImg("ferrari", "lewham01") },

  // Mercedes
  { id: "russell",    name: "George Russell",        short: "RUS", number: 63, teamId: "mercedes",    emoji: "🎩", imageUrl: driverImg("mercedes", "georus01") },
  { id: "antonelli",  name: "Andrea Kimi Antonelli", short: "ANT", number: 12, teamId: "mercedes",    emoji: "🇮🇹", imageUrl: driverImg("mercedes", "andant01") },

  // Aston Martin
  { id: "alonso",     name: "Fernando Alonso",       short: "ALO", number: 14, teamId: "astonmartin", emoji: "🐐", imageUrl: driverImg("astonmartin", "feralo01") },
  { id: "stroll",     name: "Lance Stroll",          short: "STR", number: 18, teamId: "astonmartin", emoji: "💰", imageUrl: driverImg("astonmartin", "lanstr01") },

  // Alpine
  { id: "gasly",      name: "Pierre Gasly",          short: "GAS", number: 10, teamId: "alpine",      emoji: "🇫🇷", imageUrl: driverImg("alpine", "piegas01") },
  { id: "doohan",     name: "Jack Doohan",           short: "DOO", number: 7,  teamId: "alpine",      emoji: "🏍️", imageUrl: driverImg("alpine", "jacdoo01") },

  // Williams
  { id: "sainz",      name: "Carlos Sainz",          short: "SAI", number: 55, teamId: "williams",    emoji: "🌶️", imageUrl: driverImg("williams", "carsai01") },
  { id: "albon",      name: "Alexander Albon",       short: "ALB", number: 23, teamId: "williams",    emoji: "🐘", imageUrl: driverImg("williams", "alealb01") },

  // Haas
  { id: "bearman",    name: "Oliver Bearman",        short: "BEA", number: 87, teamId: "haas",        emoji: "🐻", imageUrl: driverImg("haasf1team", "olibea01") },
  { id: "ocon",       name: "Esteban Ocon",          short: "OCO", number: 31, teamId: "haas",        emoji: "🇫🇷", imageUrl: driverImg("haasf1team", "estoco01") },

  // Kick Sauber
  { id: "hulkenberg", name: "Nico Hülkenberg",       short: "HUL", number: 27, teamId: "sauber",      emoji: "💪", imageUrl: driverImg("kicksauber", "nichul01") },
  { id: "bortoleto",  name: "Gabriel Bortoleto",     short: "BOR", number: 5,  teamId: "sauber",      emoji: "🇧🇷", imageUrl: driverImg("kicksauber", "gabbor01") },

  // Racing Bulls
  { id: "tsunoda",    name: "Yuki Tsunoda",          short: "TSU", number: 22, teamId: "rb",          emoji: "🇯🇵", imageUrl: driverImg("redbullracing", "yuktsu01") },
  { id: "hadjar",     name: "Isack Hadjar",          short: "HAD", number: 6,  teamId: "rb",          emoji: "⚡", imageUrl: driverImg("racingbulls", "isahad01") },
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
