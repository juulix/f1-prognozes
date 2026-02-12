import { z } from "zod";
import { SESSION_TYPES, type SessionType } from "@/lib/scoring/rules";

export const predictionSchema = z.object({
  raceId: z.number().int().positive(),
  sessionType: z.enum(["QUALIFYING", "SPRINT", "RACE"]),
  p1DriverId: z.string().min(1),
  p2DriverId: z.string().nullable(),
  p3DriverId: z.string().nullable(),
}).refine((data) => {
  // Qualifying: only p1
  if (data.sessionType === "QUALIFYING") {
    return true;
  }
  // Sprint/Race: all three required and unique
  if (!data.p2DriverId || !data.p3DriverId) return false;
  const ids = [data.p1DriverId, data.p2DriverId, data.p3DriverId];
  return new Set(ids).size === 3;
}, {
  message: "Sprintam un sacīkstēm jānorāda 3 dažādi braucēji",
});

export const seasonPredictionSchema = z.object({
  championDriverId: z.string().min(1),
  championTeamId: z.string().min(1),
});

export function isSessionLocked(
  sessionType: SessionType,
  race: { qualiStart: Date | string; sprintStart?: Date | string | null; raceStart: Date | string }
): boolean {
  const now = new Date();
  switch (sessionType) {
    case SESSION_TYPES.QUALIFYING:
      return now >= new Date(race.qualiStart);
    case SESSION_TYPES.SPRINT:
      return race.sprintStart ? now >= new Date(race.sprintStart) : true;
    case SESSION_TYPES.RACE:
      return now >= new Date(race.raceStart);
    default:
      return true;
  }
}

export function getSessionLockTime(
  sessionType: SessionType,
  race: { qualiStart: Date | string; sprintStart?: Date | string | null; raceStart: Date | string }
): Date | null {
  switch (sessionType) {
    case SESSION_TYPES.QUALIFYING:
      return new Date(race.qualiStart);
    case SESSION_TYPES.SPRINT:
      return race.sprintStart ? new Date(race.sprintStart) : null;
    case SESSION_TYPES.RACE:
      return new Date(race.raceStart);
    default:
      return null;
  }
}
