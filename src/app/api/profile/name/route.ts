import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Nav autorizēts" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Vārds ir obligāts" }, { status: 400 });
    }

    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      return NextResponse.json(
        { error: "Vārdam jābūt no 2 līdz 30 simboliem" },
        { status: 400 }
      );
    }

    // Update user name in DB
    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: { name: trimmed },
    });

    // Refresh the JWT session with the new name
    await createSession({
      userId: updated.id,
      name: updated.name,
      isAdmin: updated.isAdmin,
    });

    return NextResponse.json({ success: true, name: updated.name });
  } catch (error: unknown) {
    // Handle unique constraint (name already taken)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Šis vārds jau ir aizņemts" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Servera kļūda" }, { status: 500 });
  }
}
