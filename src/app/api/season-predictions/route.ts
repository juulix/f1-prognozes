import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { seasonPredictionSchema } from "@/lib/predictions/validate";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Nav autorizēts" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = seasonPredictionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Nepareizi dati" },
        { status: 400 }
      );
    }

    // Get active season
    const season = await prisma.season.findFirst({ where: { isActive: true } });
    if (!season) {
      return NextResponse.json({ error: "Nav aktīvas sezonas" }, { status: 404 });
    }

    // Check if season predictions are locked (after round 3)
    const completedRaces = await prisma.race.count({
      where: { seasonId: season.id, isCompleted: true },
    });
    if (completedRaces >= 3) {
      return NextResponse.json(
        { error: "Sezonas prognozes slēgtas pēc 3. raunda" },
        { status: 403 }
      );
    }

    const prediction = await prisma.seasonPrediction.upsert({
      where: {
        userId_seasonId: {
          userId: session.userId,
          seasonId: season.id,
        },
      },
      update: {
        championDriverId: parsed.data.championDriverId,
        championTeamId: parsed.data.championTeamId,
      },
      create: {
        userId: session.userId,
        seasonId: season.id,
        championDriverId: parsed.data.championDriverId,
        championTeamId: parsed.data.championTeamId,
      },
    });

    return NextResponse.json(prediction);
  } catch {
    return NextResponse.json({ error: "Servera kļūda" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Nav autorizēts" }, { status: 401 });
    }

    const season = await prisma.season.findFirst({ where: { isActive: true } });
    if (!season) {
      return NextResponse.json(null);
    }

    const prediction = await prisma.seasonPrediction.findUnique({
      where: {
        userId_seasonId: {
          userId: session.userId,
          seasonId: season.id,
        },
      },
    });

    return NextResponse.json(prediction);
  } catch {
    return NextResponse.json({ error: "Servera kļūda" }, { status: 500 });
  }
}
