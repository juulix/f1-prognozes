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

// Oficiālais 2026 F1 kalendārs (FIA apstiprināts)
// Laiki UTC
// Sprinti: Ķīna, Maiami, Kanāda, Lielbritānija, Nīderlande, Singapūra
const CALENDAR = [
  { round: 1,  name: "Australian Grand Prix",      country: "Austrālija",          countryEmoji: "🇦🇺", circuit: "Albert Park Circuit",                hasSprint: 0, qualiStart: "2026-03-07T05:00:00Z",                                                    raceStart: "2026-03-08T04:00:00Z" },
  { round: 2,  name: "Chinese Grand Prix",          country: "Ķīna",                countryEmoji: "🇨🇳", circuit: "Shanghai International Circuit",     hasSprint: 1, qualiStart: "2026-03-14T07:00:00Z", sprintStart: "2026-03-14T03:00:00Z",              raceStart: "2026-03-15T07:00:00Z" },
  { round: 3,  name: "Japanese Grand Prix",         country: "Japāna",              countryEmoji: "🇯🇵", circuit: "Suzuka International Racing Course", hasSprint: 0, qualiStart: "2026-03-28T06:00:00Z",                                                    raceStart: "2026-03-29T05:00:00Z" },
  { round: 4,  name: "Bahrain Grand Prix",          country: "Bahreina",            countryEmoji: "🇧🇭", circuit: "Bahrain International Circuit",      hasSprint: 0, qualiStart: "2026-04-11T16:00:00Z",                                                    raceStart: "2026-04-12T15:00:00Z" },
  { round: 5,  name: "Saudi Arabian Grand Prix",    country: "Saūda Arābija",       countryEmoji: "🇸🇦", circuit: "Jeddah Corniche Circuit",            hasSprint: 0, qualiStart: "2026-04-18T17:00:00Z",                                                    raceStart: "2026-04-19T17:00:00Z" },
  { round: 6,  name: "Miami Grand Prix",            country: "ASV (Maiami)",        countryEmoji: "🇺🇸", circuit: "Miami International Autodrome",      hasSprint: 1, qualiStart: "2026-05-02T20:00:00Z", sprintStart: "2026-05-02T16:00:00Z",              raceStart: "2026-05-03T20:00:00Z" },
  { round: 7,  name: "Canadian Grand Prix",         country: "Kanāda",              countryEmoji: "🇨🇦", circuit: "Circuit Gilles Villeneuve",          hasSprint: 1, qualiStart: "2026-05-23T20:00:00Z", sprintStart: "2026-05-23T16:00:00Z",              raceStart: "2026-05-24T20:00:00Z" },
  { round: 8,  name: "Monaco Grand Prix",           country: "Monako",              countryEmoji: "🇲🇨", circuit: "Circuit de Monaco",                  hasSprint: 0, qualiStart: "2026-06-06T14:00:00Z",                                                    raceStart: "2026-06-07T13:00:00Z" },
  { round: 9,  name: "Spanish Grand Prix",          country: "Spānija (Barselona)", countryEmoji: "🇪🇸", circuit: "Circuit de Barcelona-Catalunya",     hasSprint: 0, qualiStart: "2026-06-13T14:00:00Z",                                                    raceStart: "2026-06-14T13:00:00Z" },
  { round: 10, name: "Austrian Grand Prix",         country: "Austrija",            countryEmoji: "🇦🇹", circuit: "Red Bull Ring",                      hasSprint: 0, qualiStart: "2026-06-27T14:00:00Z",                                                    raceStart: "2026-06-28T13:00:00Z" },
  { round: 11, name: "British Grand Prix",          country: "Lielbritānija",       countryEmoji: "🇬🇧", circuit: "Silverstone Circuit",                hasSprint: 1, qualiStart: "2026-07-04T15:00:00Z", sprintStart: "2026-07-04T11:00:00Z",              raceStart: "2026-07-05T14:00:00Z" },
  { round: 12, name: "Belgian Grand Prix",          country: "Beļģija",             countryEmoji: "🇧🇪", circuit: "Circuit de Spa-Francorchamps",       hasSprint: 0, qualiStart: "2026-07-18T14:00:00Z",                                                    raceStart: "2026-07-19T13:00:00Z" },
  { round: 13, name: "Hungarian Grand Prix",        country: "Ungārija",            countryEmoji: "🇭🇺", circuit: "Hungaroring",                        hasSprint: 0, qualiStart: "2026-07-25T14:00:00Z",                                                    raceStart: "2026-07-26T13:00:00Z" },
  { round: 14, name: "Dutch Grand Prix",            country: "Nīderlande",          countryEmoji: "🇳🇱", circuit: "Circuit Zandvoort",                  hasSprint: 1, qualiStart: "2026-08-22T14:00:00Z", sprintStart: "2026-08-22T10:00:00Z",              raceStart: "2026-08-23T13:00:00Z" },
  { round: 15, name: "Italian Grand Prix",          country: "Itālija (Monca)",     countryEmoji: "🇮🇹", circuit: "Autodromo Nazionale Monza",          hasSprint: 0, qualiStart: "2026-09-05T14:00:00Z",                                                    raceStart: "2026-09-06T13:00:00Z" },
  { round: 16, name: "Spanish Grand Prix",          country: "Spānija (Madride)",   countryEmoji: "🇪🇸", circuit: "Circuito de Madrid",                 hasSprint: 0, qualiStart: "2026-09-12T14:00:00Z",                                                    raceStart: "2026-09-13T13:00:00Z" },
  { round: 17, name: "Azerbaijan Grand Prix",       country: "Azerbaidžāna",        countryEmoji: "🇦🇿", circuit: "Baku City Circuit",                  hasSprint: 0, qualiStart: "2026-09-25T12:00:00Z",                                                    raceStart: "2026-09-26T11:00:00Z" },
  { round: 18, name: "Singapore Grand Prix",        country: "Singapūra",           countryEmoji: "🇸🇬", circuit: "Marina Bay Street Circuit",          hasSprint: 1, qualiStart: "2026-10-10T13:00:00Z", sprintStart: "2026-10-10T09:00:00Z",              raceStart: "2026-10-11T12:00:00Z" },
  { round: 19, name: "United States Grand Prix",    country: "ASV (Ostina)",        countryEmoji: "🇺🇸", circuit: "Circuit of the Americas",            hasSprint: 0, qualiStart: "2026-10-24T21:00:00Z",                                                    raceStart: "2026-10-25T20:00:00Z" },
  { round: 20, name: "Mexico City Grand Prix",      country: "Meksika",             countryEmoji: "🇲🇽", circuit: "Autódromo Hermanos Rodríguez",       hasSprint: 0, qualiStart: "2026-10-31T21:00:00Z",                                                    raceStart: "2026-11-01T20:00:00Z" },
  { round: 21, name: "São Paulo Grand Prix",        country: "Brazīlija",           countryEmoji: "🇧🇷", circuit: "Autódromo José Carlos Pace",         hasSprint: 0, qualiStart: "2026-11-07T18:00:00Z",                                                    raceStart: "2026-11-08T17:00:00Z" },
  { round: 22, name: "Las Vegas Grand Prix",        country: "ASV (Lasvegasa)",     countryEmoji: "🇺🇸", circuit: "Las Vegas Strip Circuit",            hasSprint: 0, qualiStart: "2026-11-21T04:00:00Z",                                                    raceStart: "2026-11-22T04:00:00Z" },
  { round: 23, name: "Qatar Grand Prix",            country: "Katara",              countryEmoji: "🇶🇦", circuit: "Lusail International Circuit",       hasSprint: 0, qualiStart: "2026-11-28T18:00:00Z",                                                    raceStart: "2026-11-29T16:00:00Z" },
  { round: 24, name: "Abu Dhabi Grand Prix",        country: "Abu Dabi",            countryEmoji: "🇦🇪", circuit: "Yas Marina Circuit",                 hasSprint: 0, qualiStart: "2026-12-05T14:00:00Z",                                                    raceStart: "2026-12-06T13:00:00Z" },
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
