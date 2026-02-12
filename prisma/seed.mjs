import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, "dev.db");

const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS Season (id INTEGER PRIMARY KEY AUTOINCREMENT, year INTEGER UNIQUE NOT NULL, isActive BOOLEAN NOT NULL DEFAULT 0);
  CREATE TABLE IF NOT EXISTS Race (id INTEGER PRIMARY KEY AUTOINCREMENT, seasonId INTEGER NOT NULL, name TEXT NOT NULL, country TEXT NOT NULL, countryEmoji TEXT NOT NULL, circuit TEXT NOT NULL, round INTEGER NOT NULL, hasSprint BOOLEAN NOT NULL DEFAULT 0, qualiStart DATETIME NOT NULL, sprintStart DATETIME, raceStart DATETIME NOT NULL, isCompleted BOOLEAN NOT NULL DEFAULT 0, UNIQUE(seasonId, round), FOREIGN KEY (seasonId) REFERENCES Season(id));
  CREATE TABLE IF NOT EXISTS User (id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, pin TEXT NOT NULL, avatarUrl TEXT, favoriteTeamId TEXT, isAdmin BOOLEAN NOT NULL DEFAULT 0, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS Prediction (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT NOT NULL, raceId INTEGER NOT NULL, sessionType TEXT NOT NULL, p1DriverId TEXT NOT NULL, p2DriverId TEXT, p3DriverId TEXT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, isLocked BOOLEAN NOT NULL DEFAULT 0, UNIQUE(userId, raceId, sessionType), FOREIGN KEY (userId) REFERENCES User(id), FOREIGN KEY (raceId) REFERENCES Race(id));
  CREATE TABLE IF NOT EXISTS RaceResult (id INTEGER PRIMARY KEY AUTOINCREMENT, raceId INTEGER NOT NULL, sessionType TEXT NOT NULL, p1DriverId TEXT NOT NULL, p2DriverId TEXT, p3DriverId TEXT, UNIQUE(raceId, sessionType), FOREIGN KEY (raceId) REFERENCES Race(id));
  CREATE TABLE IF NOT EXISTS Score (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT NOT NULL, raceId INTEGER NOT NULL, sessionType TEXT NOT NULL, basePoints INTEGER NOT NULL, bonusPoints INTEGER NOT NULL DEFAULT 0, totalPoints INTEGER NOT NULL, breakdown TEXT NOT NULL, UNIQUE(userId, raceId, sessionType), FOREIGN KEY (userId) REFERENCES User(id), FOREIGN KEY (raceId) REFERENCES Race(id));
  CREATE TABLE IF NOT EXISTS SeasonPrediction (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT NOT NULL, seasonId INTEGER NOT NULL, championDriverId TEXT NOT NULL, championTeamId TEXT NOT NULL, isLocked BOOLEAN NOT NULL DEFAULT 0, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(userId, seasonId), FOREIGN KEY (userId) REFERENCES User(id), FOREIGN KEY (seasonId) REFERENCES Season(id));
`);

const CALENDAR = [
  { round: 1, name: "Bahrain Grand Prix", country: "Bahreina", countryEmoji: "🇧🇭", circuit: "Bahrain International Circuit", hasSprint: 0, qualiStart: "2026-03-07 16:00:00", raceStart: "2026-03-08 16:00:00" },
  { round: 2, name: "Saudi Arabian Grand Prix", country: "Saūda Arābija", countryEmoji: "🇸🇦", circuit: "Jeddah Corniche Circuit", hasSprint: 0, qualiStart: "2026-03-14 18:00:00", raceStart: "2026-03-15 18:00:00" },
  { round: 3, name: "Australian Grand Prix", country: "Austrālija", countryEmoji: "🇦🇺", circuit: "Albert Park Circuit", hasSprint: 0, qualiStart: "2026-03-28 06:00:00", raceStart: "2026-03-29 06:00:00" },
  { round: 4, name: "Japanese Grand Prix", country: "Japāna", countryEmoji: "🇯🇵", circuit: "Suzuka International Racing Course", hasSprint: 0, qualiStart: "2026-04-04 07:00:00", raceStart: "2026-04-05 07:00:00" },
  { round: 5, name: "Chinese Grand Prix", country: "Ķīna", countryEmoji: "🇨🇳", circuit: "Shanghai International Circuit", hasSprint: 1, qualiStart: "2026-04-18 08:00:00", sprintStart: "2026-04-19 04:00:00", raceStart: "2026-04-19 08:00:00" },
  { round: 6, name: "Miami Grand Prix", country: "ASV (Maiami)", countryEmoji: "🇺🇸", circuit: "Miami International Autodrome", hasSprint: 1, qualiStart: "2026-05-02 21:00:00", sprintStart: "2026-05-03 17:00:00", raceStart: "2026-05-03 21:00:00" },
  { round: 7, name: "Emilia Romagna Grand Prix", country: "Itālija (Imola)", countryEmoji: "🇮🇹", circuit: "Autodromo Enzo e Dino Ferrari", hasSprint: 0, qualiStart: "2026-05-16 14:00:00", raceStart: "2026-05-17 14:00:00" },
  { round: 8, name: "Monaco Grand Prix", country: "Monako", countryEmoji: "🇲🇨", circuit: "Circuit de Monaco", hasSprint: 0, qualiStart: "2026-05-23 14:00:00", raceStart: "2026-05-24 14:00:00" },
  { round: 9, name: "Spanish Grand Prix", country: "Spānija", countryEmoji: "🇪🇸", circuit: "Circuit de Barcelona-Catalunya", hasSprint: 0, qualiStart: "2026-06-06 14:00:00", raceStart: "2026-06-07 14:00:00" },
  { round: 10, name: "Canadian Grand Prix", country: "Kanāda", countryEmoji: "🇨🇦", circuit: "Circuit Gilles Villeneuve", hasSprint: 0, qualiStart: "2026-06-13 20:00:00", raceStart: "2026-06-14 19:00:00" },
  { round: 11, name: "Austrian Grand Prix", country: "Austrija", countryEmoji: "🇦🇹", circuit: "Red Bull Ring", hasSprint: 1, qualiStart: "2026-06-27 14:00:00", sprintStart: "2026-06-28 10:00:00", raceStart: "2026-06-28 14:00:00" },
  { round: 12, name: "British Grand Prix", country: "Lielbritānija", countryEmoji: "🇬🇧", circuit: "Silverstone Circuit", hasSprint: 0, qualiStart: "2026-07-04 14:00:00", raceStart: "2026-07-05 14:00:00" },
  { round: 13, name: "Belgian Grand Prix", country: "Beļģija", countryEmoji: "🇧🇪", circuit: "Circuit de Spa-Francorchamps", hasSprint: 1, qualiStart: "2026-07-25 14:00:00", sprintStart: "2026-07-26 10:30:00", raceStart: "2026-07-26 14:00:00" },
  { round: 14, name: "Hungarian Grand Prix", country: "Ungārija", countryEmoji: "🇭🇺", circuit: "Hungaroring", hasSprint: 0, qualiStart: "2026-08-01 14:00:00", raceStart: "2026-08-02 14:00:00" },
  { round: 15, name: "Dutch Grand Prix", country: "Nīderlande", countryEmoji: "🇳🇱", circuit: "Circuit Zandvoort", hasSprint: 0, qualiStart: "2026-08-29 13:00:00", raceStart: "2026-08-30 14:00:00" },
  { round: 16, name: "Italian Grand Prix", country: "Itālija (Monca)", countryEmoji: "🇮🇹", circuit: "Autodromo Nazionale Monza", hasSprint: 0, qualiStart: "2026-09-05 14:00:00", raceStart: "2026-09-06 14:00:00" },
  { round: 17, name: "Azerbaijan Grand Prix", country: "Azerbaidžāna", countryEmoji: "🇦🇿", circuit: "Baku City Circuit", hasSprint: 0, qualiStart: "2026-09-19 13:00:00", raceStart: "2026-09-20 12:00:00" },
  { round: 18, name: "Singapore Grand Prix", country: "Singapūra", countryEmoji: "🇸🇬", circuit: "Marina Bay Street Circuit", hasSprint: 0, qualiStart: "2026-10-03 13:00:00", raceStart: "2026-10-04 13:00:00" },
  { round: 19, name: "United States Grand Prix", country: "ASV (Ostina)", countryEmoji: "🇺🇸", circuit: "Circuit of the Americas", hasSprint: 1, qualiStart: "2026-10-17 21:00:00", sprintStart: "2026-10-18 17:00:00", raceStart: "2026-10-18 20:00:00" },
  { round: 20, name: "Mexico City Grand Prix", country: "Meksika", countryEmoji: "🇲🇽", circuit: "Autódromo Hermanos Rodríguez", hasSprint: 0, qualiStart: "2026-10-24 21:00:00", raceStart: "2026-10-25 20:00:00" },
  { round: 21, name: "São Paulo Grand Prix", country: "Brazīlija", countryEmoji: "🇧🇷", circuit: "Autódromo José Carlos Pace", hasSprint: 1, qualiStart: "2026-11-07 17:00:00", sprintStart: "2026-11-08 14:00:00", raceStart: "2026-11-08 18:00:00" },
  { round: 22, name: "Las Vegas Grand Prix", country: "ASV (Vegasa)", countryEmoji: "🇺🇸", circuit: "Las Vegas Strip Circuit", hasSprint: 0, qualiStart: "2026-11-21 06:00:00", raceStart: "2026-11-22 06:00:00" },
  { round: 23, name: "Qatar Grand Prix", country: "Katara", countryEmoji: "🇶🇦", circuit: "Lusail International Circuit", hasSprint: 1, qualiStart: "2026-11-28 16:00:00", sprintStart: "2026-11-29 13:00:00", raceStart: "2026-11-29 17:00:00" },
  { round: 24, name: "Abu Dhabi Grand Prix", country: "Abu Dabi", countryEmoji: "🇦🇪", circuit: "Yas Marina Circuit", hasSprint: 0, qualiStart: "2026-12-05 14:00:00", raceStart: "2026-12-06 14:00:00" },
];

console.log("🌱 Sēju datubāzi...");

// Season
db.prepare("INSERT OR IGNORE INTO Season (year, isActive) VALUES (2026, 1)").run();
const season = db.prepare("SELECT id FROM Season WHERE year = 2026").get();
console.log(`✅ Sezona: 2026 (id: ${season.id})`);

// Races
const insertRace = db.prepare(`
  INSERT OR IGNORE INTO Race (seasonId, name, country, countryEmoji, circuit, round, hasSprint, qualiStart, sprintStart, raceStart, isCompleted)
  VALUES (@seasonId, @name, @country, @countryEmoji, @circuit, @round, @hasSprint, @qualiStart, @sprintStart, @raceStart, 0)
`);

for (const race of CALENDAR) {
  insertRace.run({
    seasonId: season.id,
    name: race.name,
    country: race.country,
    countryEmoji: race.countryEmoji,
    circuit: race.circuit,
    round: race.round,
    hasSprint: race.hasSprint,
    qualiStart: race.qualiStart,
    sprintStart: race.sprintStart || null,
    raceStart: race.raceStart,
  });
}
console.log(`✅ Sacīkstes: ${CALENDAR.length}`);

// Admin user
const adminPin = bcrypt.hashSync("1234", 10);
const adminId = `admin_${Date.now()}`;
db.prepare(`
  INSERT OR IGNORE INTO User (id, name, pin, isAdmin, createdAt)
  VALUES (@id, 'Admin', @pin, 1, datetime('now'))
`).run({ id: adminId, pin: adminPin });
console.log("✅ Admin lietotājs izveidots (PIN: 1234)");

console.log("🏁 Datubāze sagatavota!");
db.close();
