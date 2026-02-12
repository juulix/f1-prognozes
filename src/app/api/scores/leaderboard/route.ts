import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        scores: true,
      },
    });

    const leaderboard = users
      .map((user) => ({
        userId: user.id,
        name: user.name,
        favoriteTeamId: user.favoriteTeamId,
        totalPoints: user.scores.reduce((sum, s) => sum + s.totalPoints, 0),
        raceCount: new Set(user.scores.map((s) => s.raceId)).size,
        scores: user.scores,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    return NextResponse.json(leaderboard);
  } catch {
    return NextResponse.json({ error: "Servera kļūda" }, { status: 500 });
  }
}
