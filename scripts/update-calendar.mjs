/**
 * Updates the 2026 F1 race calendar in the production PostgreSQL database.
 * Uses Prisma client. Run with: npx tsx scripts/update-calendar.mjs
 * Or: node --loader tsx scripts/update-calendar.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CALENDAR = [
  { round: 1,  name: "Australian Grand Prix",      country: "Austrālija",          countryEmoji: "🇦🇺", circuit: "Albert Park Circuit",                hasSprint: false, qualiStart: "2026-03-07T05:00:00Z",                                                    raceStart: "2026-03-08T04:00:00Z" },
  { round: 2,  name: "Chinese Grand Prix",          country: "Ķīna",                countryEmoji: "🇨🇳", circuit: "Shanghai International Circuit",     hasSprint: true,  qualiStart: "2026-03-14T07:00:00Z", sprintStart: "2026-03-14T03:00:00Z",              raceStart: "2026-03-15T07:00:00Z" },
  { round: 3,  name: "Japanese Grand Prix",         country: "Japāna",              countryEmoji: "🇯🇵", circuit: "Suzuka International Racing Course", hasSprint: false, qualiStart: "2026-03-28T06:00:00Z",                                                    raceStart: "2026-03-29T05:00:00Z" },
  { round: 4,  name: "Bahrain Grand Prix",          country: "Bahreina",            countryEmoji: "🇧🇭", circuit: "Bahrain International Circuit",      hasSprint: false, qualiStart: "2026-04-11T16:00:00Z",                                                    raceStart: "2026-04-12T15:00:00Z" },
  { round: 5,  name: "Saudi Arabian Grand Prix",    country: "Saūda Arābija",       countryEmoji: "🇸🇦", circuit: "Jeddah Corniche Circuit",            hasSprint: false, qualiStart: "2026-04-18T17:00:00Z",                                                    raceStart: "2026-04-19T17:00:00Z" },
  { round: 6,  name: "Miami Grand Prix",            country: "ASV (Maiami)",        countryEmoji: "🇺🇸", circuit: "Miami International Autodrome",      hasSprint: true,  qualiStart: "2026-05-02T20:00:00Z", sprintStart: "2026-05-02T16:00:00Z",              raceStart: "2026-05-03T20:00:00Z" },
  { round: 7,  name: "Canadian Grand Prix",         country: "Kanāda",              countryEmoji: "🇨🇦", circuit: "Circuit Gilles Villeneuve",          hasSprint: true,  qualiStart: "2026-05-23T20:00:00Z", sprintStart: "2026-05-23T16:00:00Z",              raceStart: "2026-05-24T20:00:00Z" },
  { round: 8,  name: "Monaco Grand Prix",           country: "Monako",              countryEmoji: "🇲🇨", circuit: "Circuit de Monaco",                  hasSprint: false, qualiStart: "2026-06-06T14:00:00Z",                                                    raceStart: "2026-06-07T13:00:00Z" },
  { round: 9,  name: "Spanish Grand Prix",          country: "Spānija (Barselona)", countryEmoji: "🇪🇸", circuit: "Circuit de Barcelona-Catalunya",     hasSprint: false, qualiStart: "2026-06-13T14:00:00Z",                                                    raceStart: "2026-06-14T13:00:00Z" },
  { round: 10, name: "Austrian Grand Prix",         country: "Austrija",            countryEmoji: "🇦🇹", circuit: "Red Bull Ring",                      hasSprint: false, qualiStart: "2026-06-27T14:00:00Z",                                                    raceStart: "2026-06-28T13:00:00Z" },
  { round: 11, name: "British Grand Prix",          country: "Lielbritānija",       countryEmoji: "🇬🇧", circuit: "Silverstone Circuit",                hasSprint: true,  qualiStart: "2026-07-04T15:00:00Z", sprintStart: "2026-07-04T11:00:00Z",              raceStart: "2026-07-05T14:00:00Z" },
  { round: 12, name: "Belgian Grand Prix",          country: "Beļģija",             countryEmoji: "🇧🇪", circuit: "Circuit de Spa-Francorchamps",       hasSprint: false, qualiStart: "2026-07-18T14:00:00Z",                                                    raceStart: "2026-07-19T13:00:00Z" },
  { round: 13, name: "Hungarian Grand Prix",        country: "Ungārija",            countryEmoji: "🇭🇺", circuit: "Hungaroring",                        hasSprint: false, qualiStart: "2026-07-25T14:00:00Z",                                                    raceStart: "2026-07-26T13:00:00Z" },
  { round: 14, name: "Dutch Grand Prix",            country: "Nīderlande",          countryEmoji: "🇳🇱", circuit: "Circuit Zandvoort",                  hasSprint: true,  qualiStart: "2026-08-22T14:00:00Z", sprintStart: "2026-08-22T10:00:00Z",              raceStart: "2026-08-23T13:00:00Z" },
  { round: 15, name: "Italian Grand Prix",          country: "Itālija (Monca)",     countryEmoji: "🇮🇹", circuit: "Autodromo Nazionale Monza",          hasSprint: false, qualiStart: "2026-09-05T14:00:00Z",                                                    raceStart: "2026-09-06T13:00:00Z" },
  { round: 16, name: "Spanish Grand Prix",          country: "Spānija (Madride)",   countryEmoji: "🇪🇸", circuit: "Circuito de Madrid",                 hasSprint: false, qualiStart: "2026-09-12T14:00:00Z",                                                    raceStart: "2026-09-13T13:00:00Z" },
  { round: 17, name: "Azerbaijan Grand Prix",       country: "Azerbaidžāna",        countryEmoji: "🇦🇿", circuit: "Baku City Circuit",                  hasSprint: false, qualiStart: "2026-09-25T12:00:00Z",                                                    raceStart: "2026-09-26T11:00:00Z" },
  { round: 18, name: "Singapore Grand Prix",        country: "Singapūra",           countryEmoji: "🇸🇬", circuit: "Marina Bay Street Circuit",          hasSprint: true,  qualiStart: "2026-10-10T13:00:00Z", sprintStart: "2026-10-10T09:00:00Z",              raceStart: "2026-10-11T12:00:00Z" },
  { round: 19, name: "United States Grand Prix",    country: "ASV (Ostina)",        countryEmoji: "🇺🇸", circuit: "Circuit of the Americas",            hasSprint: false, qualiStart: "2026-10-24T21:00:00Z",                                                    raceStart: "2026-10-25T20:00:00Z" },
  { round: 20, name: "Mexico City Grand Prix",      country: "Meksika",             countryEmoji: "🇲🇽", circuit: "Autódromo Hermanos Rodríguez",       hasSprint: false, qualiStart: "2026-10-31T21:00:00Z",                                                    raceStart: "2026-11-01T20:00:00Z" },
  { round: 21, name: "São Paulo Grand Prix",        country: "Brazīlija",           countryEmoji: "🇧🇷", circuit: "Autódromo José Carlos Pace",         hasSprint: false, qualiStart: "2026-11-07T18:00:00Z",                                                    raceStart: "2026-11-08T17:00:00Z" },
  { round: 22, name: "Las Vegas Grand Prix",        country: "ASV (Lasvegasa)",     countryEmoji: "🇺🇸", circuit: "Las Vegas Strip Circuit",            hasSprint: false, qualiStart: "2026-11-21T04:00:00Z",                                                    raceStart: "2026-11-22T04:00:00Z" },
  { round: 23, name: "Qatar Grand Prix",            country: "Katara",              countryEmoji: "🇶🇦", circuit: "Lusail International Circuit",       hasSprint: false, qualiStart: "2026-11-28T18:00:00Z",                                                    raceStart: "2026-11-29T16:00:00Z" },
  { round: 24, name: "Abu Dhabi Grand Prix",        country: "Abu Dabi",            countryEmoji: "🇦🇪", circuit: "Yas Marina Circuit",                 hasSprint: false, qualiStart: "2026-12-05T14:00:00Z",                                                    raceStart: "2026-12-06T13:00:00Z" },
];

async function main() {
  console.log("🔄 Atjauninu 2026 F1 kalendāru...");

  // Get or create the 2026 season
  let season = await prisma.season.findUnique({ where: { year: 2026 } });
  if (!season) {
    season = await prisma.season.create({
      data: { year: 2026, isActive: true },
    });
    console.log("📅 Izveidota jauna 2026 sezona");
  }
  console.log(`📅 Sezona 2026, id: ${season.id}`);

  // Check if predictions exist
  const predCount = await prisma.prediction.count({
    where: { race: { seasonId: season.id } },
  });

  if (predCount > 0) {
    console.log(`⚠️  Atrasti ${predCount} prognozes — atjauninu sacīkstes bez dzēšanas...`);
  } else {
    console.log("🗑️  Nav prognožu — dzēšu vecās sacīkstes un ielieku jaunas...");
    await prisma.score.deleteMany({ where: { race: { seasonId: season.id } } });
    await prisma.raceResult.deleteMany({ where: { race: { seasonId: season.id } } });
    await prisma.race.deleteMany({ where: { seasonId: season.id } });
  }

  for (const race of CALENDAR) {
    if (predCount > 0) {
      // Update existing by round
      const existing = await prisma.race.findUnique({
        where: { seasonId_round: { seasonId: season.id, round: race.round } },
      });

      if (existing) {
        await prisma.race.update({
          where: { id: existing.id },
          data: {
            name: race.name,
            country: race.country,
            countryEmoji: race.countryEmoji,
            circuit: race.circuit,
            hasSprint: race.hasSprint,
            qualiStart: new Date(race.qualiStart),
            sprintStart: race.sprintStart ? new Date(race.sprintStart) : null,
            raceStart: new Date(race.raceStart),
          },
        });
        console.log(`  ✏️  R${race.round} ${race.name}`);
      } else {
        await prisma.race.create({
          data: {
            seasonId: season.id,
            round: race.round,
            name: race.name,
            country: race.country,
            countryEmoji: race.countryEmoji,
            circuit: race.circuit,
            hasSprint: race.hasSprint,
            qualiStart: new Date(race.qualiStart),
            sprintStart: race.sprintStart ? new Date(race.sprintStart) : null,
            raceStart: new Date(race.raceStart),
          },
        });
        console.log(`  ➕ R${race.round} ${race.name}`);
      }
    } else {
      // Insert fresh
      await prisma.race.create({
        data: {
          seasonId: season.id,
          round: race.round,
          name: race.name,
          country: race.country,
          countryEmoji: race.countryEmoji,
          circuit: race.circuit,
          hasSprint: race.hasSprint,
          qualiStart: new Date(race.qualiStart),
          sprintStart: race.sprintStart ? new Date(race.sprintStart) : null,
          raceStart: new Date(race.raceStart),
        },
      });
      console.log(`  ✅ R${race.round} ${race.name}`);
    }
  }

  // Verify
  const total = await prisma.race.count({ where: { seasonId: season.id } });
  console.log(`\n🏁 ${total} sacīkstes datubāzē!`);
}

main()
  .catch((err) => {
    console.error("❌ Kļūda:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
