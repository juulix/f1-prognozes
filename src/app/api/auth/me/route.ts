import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(null, { status: 401 });
  }

  // Fetch full user from DB to include favoriteTeamId
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      isAdmin: true,
      favoriteTeamId: true,
    },
  });

  if (!user) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json({
    userId: user.id,
    name: user.name,
    isAdmin: user.isAdmin,
    favoriteTeamId: user.favoriteTeamId,
  });
}
