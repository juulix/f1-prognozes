import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchSessionResults } from "@/lib/f1-api";
import { calculateScore } from "@/lib/scoring/calculate";
import type { SessionResultType } from "@/lib/f1-api";
import type { SessionType } from "@/lib/scoring/rules";

export async function POST(request: Request) {
  try {
    const { raceId } = await request.json();

    if (!raceId) {
      return NextResponse.json({ error: "Trūkst raceId" }, { status: 400 });
    }

    const race = await prisma.race.findUnique({
      where: { id: parseInt(raceId) },
      include: { season: true, results: true },
    });

    if (!race) {
      return NextResponse.json({ error: "Sacīkstes nav atrastas" }, { status: 404 });
    }

    // Determine which sessions to fetch
    const sessionTypes: SessionResultType[] = race.hasSprint
      ? ["QUALIFYING", "SPRINT", "RACE"]
      : ["QUALIFYING", "RACE"];

    // Skip sessions that already have results
    const existingSessionTypes = race.results.map((r) => r.sessionType);
    const missingSessions = sessionTypes.filter(
      (s) => !existingSessionTypes.includes(s)
    );

    if (missingSessions.length === 0) {
      // All results already saved
      return NextResponse.json({ fetched: 0, message: "Visi rezultāti jau saglabāti" });
    }

    let fetchedCount = 0;

    for (const sessionType of missingSessions) {
      const result = await fetchSessionResults(
        race.season.year,
        race.round,
        sessionType
      );

      if (!result) continue;

      // Save result to database
      await prisma.raceResult.upsert({
        where: {
          raceId_sessionType: { raceId: race.id, sessionType },
        },
        update: {
          p1DriverId: result.p1DriverId,
          p2DriverId: result.p2DriverId,
          p3DriverId: result.p3DriverId,
        },
        create: {
          raceId: race.id,
          sessionType,
          p1DriverId: result.p1DriverId,
          p2DriverId: result.p2DriverId,
          p3DriverId: result.p3DriverId,
        },
      });

      // Calculate scores for all predictions for this session
      const predictions = await prisma.prediction.findMany({
        where: { raceId: race.id, sessionType },
      });

      for (const prediction of predictions) {
        const score = calculateScore(
          {
            p1DriverId: prediction.p1DriverId,
            p2DriverId: prediction.p2DriverId,
            p3DriverId: prediction.p3DriverId,
          },
          result,
          sessionType as SessionType
        );

        await prisma.score.upsert({
          where: {
            userId_raceId_sessionType: {
              userId: prediction.userId,
              raceId: race.id,
              sessionType,
            },
          },
          update: {
            basePoints: score.basePoints,
            bonusPoints: score.bonusPoints,
            totalPoints: score.totalPoints,
            breakdown: JSON.stringify(score.breakdown),
          },
          create: {
            userId: prediction.userId,
            raceId: race.id,
            sessionType,
            basePoints: score.basePoints,
            bonusPoints: score.bonusPoints,
            totalPoints: score.totalPoints,
            breakdown: JSON.stringify(score.breakdown),
          },
        });

        await prisma.prediction.update({
          where: { id: prediction.id },
          data: { isLocked: true },
        });
      }

      fetchedCount++;
    }

    // Check if all sessions now have results -> mark race completed
    const totalResults = await prisma.raceResult.count({
      where: { raceId: race.id },
    });
    const expectedSessions = race.hasSprint ? 3 : 2;
    if (totalResults >= expectedSessions) {
      await prisma.race.update({
        where: { id: race.id },
        data: { isCompleted: true },
      });
    }

    return NextResponse.json({
      fetched: fetchedCount,
      message: fetchedCount > 0
        ? `Ielādēti un saglabāti ${fetchedCount} sesiju rezultāti`
        : "F1 API vēl nav pieejami rezultāti",
    });
  } catch {
    return NextResponse.json({ error: "Servera kļūda" }, { status: 500 });
  }
}
