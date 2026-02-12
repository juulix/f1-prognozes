import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Nav autorizēts" }, { status: 401 });
    }

    const scores = await prisma.score.findMany({
      where: { userId: session.userId },
      include: { race: true },
      orderBy: { race: { round: "asc" } },
    });

    const predictions = await prisma.prediction.findMany({
      where: { userId: session.userId },
    });

    // Calculate stats
    const totalPoints = scores.reduce((sum, s) => sum + s.totalPoints, 0);
    const totalPredictions = predictions.length;
    const exactHits = scores.filter((s) => {
      const bd = JSON.parse(s.breakdown);
      return bd.p1 === "exact" || bd.p2 === "exact" || bd.p3 === "exact";
    }).length;
    const top3Hits = scores.filter((s) => {
      const bd = JSON.parse(s.breakdown);
      return bd.p1 === "top3" || bd.p2 === "top3" || bd.p3 === "top3";
    }).length;

    // Points by session type
    const bySession: Record<string, number> = {};
    for (const s of scores) {
      bySession[s.sessionType] = (bySession[s.sessionType] || 0) + s.totalPoints;
    }

    // Points over time (cumulative)
    let cumulative = 0;
    const pointsOverTime = scores.map((s) => {
      cumulative += s.totalPoints;
      return {
        round: s.race.round,
        name: s.race.name,
        points: s.totalPoints,
        cumulative,
      };
    });

    return NextResponse.json({
      totalPoints,
      totalPredictions,
      exactHits,
      top3Hits,
      bySession,
      pointsOverTime,
    });
  } catch {
    return NextResponse.json({ error: "Servera kļūda" }, { status: 500 });
  }
}
