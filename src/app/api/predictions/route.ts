import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { predictionSchema } from "@/lib/predictions/validate";
import { isSessionLocked } from "@/lib/predictions/validate";
import type { SessionType } from "@/lib/scoring/rules";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Nav autorizēts" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = predictionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Nepareizi dati" },
        { status: 400 }
      );
    }

    const { raceId, sessionType, p1DriverId, p2DriverId, p3DriverId } = parsed.data;

    // Check race exists
    const race = await prisma.race.findUnique({ where: { id: raceId } });
    if (!race) {
      return NextResponse.json({ error: "Sacīkstes nav atrastas" }, { status: 404 });
    }

    // Check if locked
    if (isSessionLocked(sessionType as SessionType, race)) {
      return NextResponse.json({ error: "Balsošana ir slēgta — sesija jau sākusies" }, { status: 403 });
    }

    // Upsert prediction
    const prediction = await prisma.prediction.upsert({
      where: {
        userId_raceId_sessionType: {
          userId: session.userId,
          raceId,
          sessionType,
        },
      },
      update: {
        p1DriverId,
        p2DriverId,
        p3DriverId,
      },
      create: {
        userId: session.userId,
        raceId,
        sessionType,
        p1DriverId,
        p2DriverId,
        p3DriverId,
      },
    });

    return NextResponse.json(prediction);
  } catch {
    return NextResponse.json({ error: "Servera kļūda" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Nav autorizēts" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const raceId = searchParams.get("raceId");

    const where: Record<string, unknown> = { userId: session.userId };
    if (raceId) where.raceId = parseInt(raceId);

    const predictions = await prisma.prediction.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(predictions);
  } catch {
    return NextResponse.json({ error: "Servera kļūda" }, { status: 500 });
  }
}
