import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ raceId: string }> }
) {
  try {
    const { raceId } = await params;
    const scores = await prisma.score.findMany({
      where: { raceId: parseInt(raceId) },
      include: { user: { select: { name: true } } },
    });

    return NextResponse.json(
      scores.map((s) => ({
        userId: s.userId,
        userName: s.user.name,
        sessionType: s.sessionType,
        totalPoints: s.totalPoints,
        basePoints: s.basePoints,
        bonusPoints: s.bonusPoints,
        breakdown: JSON.parse(s.breakdown),
      }))
    );
  } catch {
    return NextResponse.json({ error: "Servera kļūda" }, { status: 500 });
  }
}
