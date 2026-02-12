import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Nav autorizēts" }, { status: 401 });
    }

    const { teamId } = await request.json();

    await prisma.user.update({
      where: { id: session.userId },
      data: { favoriteTeamId: teamId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Servera kļūda" }, { status: 500 });
  }
}
