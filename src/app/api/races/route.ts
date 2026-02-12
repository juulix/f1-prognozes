import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const races = await prisma.race.findMany({
      orderBy: { round: "asc" },
      include: { season: true },
    });

    return NextResponse.json(races);
  } catch {
    return NextResponse.json({ error: "Servera kļūda" }, { status: 500 });
  }
}
