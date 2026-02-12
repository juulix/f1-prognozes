import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const race = await prisma.race.findUnique({
      where: { id: parseInt(id) },
      include: {
        results: true,
        predictions: true,
      },
    });

    if (!race) {
      return NextResponse.json({ error: "Sacīkstes nav atrastas" }, { status: 404 });
    }

    return NextResponse.json(race);
  } catch {
    return NextResponse.json({ error: "Servera kļūda" }, { status: 500 });
  }
}
