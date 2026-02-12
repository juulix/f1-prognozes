import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateScore } from "@/lib/scoring/calculate";
import type { SessionType } from "@/lib/scoring/rules";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Nav admin tiesību" }, { status: 403 });
    }

    const { raceId, sessionType, p1DriverId, p2DriverId, p3DriverId } = await request.json();

    if (!raceId || !sessionType || !p1DriverId) {
      return NextResponse.json({ error: "Trūkst obligāto lauku" }, { status: 400 });
    }

    // Save result
    const result = await prisma.raceResult.upsert({
      where: {
        raceId_sessionType: { raceId: parseInt(raceId), sessionType },
      },
      update: { p1DriverId, p2DriverId, p3DriverId },
      create: {
        raceId: parseInt(raceId),
        sessionType,
        p1DriverId,
        p2DriverId,
        p3DriverId,
      },
    });

    // Calculate scores for all predictions
    const predictions = await prisma.prediction.findMany({
      where: { raceId: parseInt(raceId), sessionType },
    });

    const resultData = { p1DriverId, p2DriverId, p3DriverId };

    for (const prediction of predictions) {
      const score = calculateScore(
        {
          p1DriverId: prediction.p1DriverId,
          p2DriverId: prediction.p2DriverId,
          p3DriverId: prediction.p3DriverId,
        },
        resultData,
        sessionType as SessionType
      );

      await prisma.score.upsert({
        where: {
          userId_raceId_sessionType: {
            userId: prediction.userId,
            raceId: parseInt(raceId),
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
          raceId: parseInt(raceId),
          sessionType,
          basePoints: score.basePoints,
          bonusPoints: score.bonusPoints,
          totalPoints: score.totalPoints,
          breakdown: JSON.stringify(score.breakdown),
        },
      });

      // Lock prediction
      await prisma.prediction.update({
        where: { id: prediction.id },
        data: { isLocked: true },
      });
    }

    // Check if all sessions completed for this race
    const race = await prisma.race.findUnique({ where: { id: parseInt(raceId) } });
    if (race) {
      const resultsCount = await prisma.raceResult.count({
        where: { raceId: parseInt(raceId) },
      });
      const expectedSessions = race.hasSprint ? 3 : 2;
      if (resultsCount >= expectedSessions) {
        await prisma.race.update({
          where: { id: parseInt(raceId) },
          data: { isCompleted: true },
        });
      }
    }

    return NextResponse.json({
      result,
      scoresCalculated: predictions.length,
    });
  } catch {
    return NextResponse.json({ error: "Servera kļūda" }, { status: 500 });
  }
}
