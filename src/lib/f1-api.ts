import { DRIVERS } from "@/data/drivers";

const JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1";

// Map Jolpica driver code (3-letter) to our internal driver ID
const CODE_TO_ID = new Map(DRIVERS.map((d) => [d.short, d.id]));

interface JolpicaDriver {
  driverId: string;
  permanentNumber: string;
  code: string;
  givenName: string;
  familyName: string;
}

interface JolpicaResult {
  number: string;
  position: string;
  Driver: JolpicaDriver;
}

interface FetchedResult {
  p1DriverId: string;
  p2DriverId: string | null;
  p3DriverId: string | null;
}

function resolveDriverId(driver: JolpicaDriver): string | null {
  // Try code first (most reliable)
  if (CODE_TO_ID.has(driver.code)) return CODE_TO_ID.get(driver.code)!;

  // Fallback: try matching by number
  const num = parseInt(driver.permanentNumber);
  const byNumber = DRIVERS.find((d) => d.number === num);
  if (byNumber) return byNumber.id;

  // Fallback: try last name match
  const byName = DRIVERS.find(
    (d) => d.name.toLowerCase().includes(driver.familyName.toLowerCase())
  );
  if (byName) return byName.id;

  return null;
}

function pickByPosition(results: JolpicaResult[], pos: number): string | null {
  const entry = results.find((r) => r.position === String(pos));
  if (!entry) return null;
  return resolveDriverId(entry.Driver);
}

export async function fetchQualifyingResults(
  season: number,
  round: number
): Promise<FetchedResult | null> {
  const url = `${JOLPICA_BASE}/${season}/${round}/qualifying.json`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return null;

  const data = await res.json();
  const races = data?.MRData?.RaceTable?.Races;
  if (!races?.length) return null;

  const results: JolpicaResult[] = races[0].QualifyingResults;
  if (!results?.length) return null;

  const p1 = pickByPosition(results, 1);
  if (!p1) return null;

  return { p1DriverId: p1, p2DriverId: null, p3DriverId: null };
}

export async function fetchSprintResults(
  season: number,
  round: number
): Promise<FetchedResult | null> {
  const url = `${JOLPICA_BASE}/${season}/${round}/sprint.json`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return null;

  const data = await res.json();
  const races = data?.MRData?.RaceTable?.Races;
  if (!races?.length) return null;

  const results: JolpicaResult[] = races[0].SprintResults;
  if (!results?.length) return null;

  const p1 = pickByPosition(results, 1);
  const p2 = pickByPosition(results, 2);
  const p3 = pickByPosition(results, 3);
  if (!p1) return null;

  return { p1DriverId: p1, p2DriverId: p2, p3DriverId: p3 };
}

export async function fetchRaceResults(
  season: number,
  round: number
): Promise<FetchedResult | null> {
  const url = `${JOLPICA_BASE}/${season}/${round}/results.json`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return null;

  const data = await res.json();
  const races = data?.MRData?.RaceTable?.Races;
  if (!races?.length) return null;

  const results: JolpicaResult[] = races[0].Results;
  if (!results?.length) return null;

  const p1 = pickByPosition(results, 1);
  const p2 = pickByPosition(results, 2);
  const p3 = pickByPosition(results, 3);
  if (!p1) return null;

  return { p1DriverId: p1, p2DriverId: p2, p3DriverId: p3 };
}

export type SessionResultType = "QUALIFYING" | "SPRINT" | "RACE";

export async function fetchSessionResults(
  season: number,
  round: number,
  sessionType: SessionResultType
): Promise<FetchedResult | null> {
  switch (sessionType) {
    case "QUALIFYING":
      return fetchQualifyingResults(season, round);
    case "SPRINT":
      return fetchSprintResults(season, round);
    case "RACE":
      return fetchRaceResults(season, round);
  }
}
