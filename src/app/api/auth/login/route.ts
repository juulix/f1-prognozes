import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPin, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, pin } = await request.json();

    if (!name || !pin) {
      return NextResponse.json({ error: "Vārds un PIN ir obligāti" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { name } });
    if (!user) {
      return NextResponse.json({ error: "Lietotājs nav atrasts" }, { status: 401 });
    }

    const valid = await verifyPin(pin, user.pin);
    if (!valid) {
      return NextResponse.json({ error: "Nepareizs PIN" }, { status: 401 });
    }

    await createSession({
      userId: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
    });

    return NextResponse.json({
      userId: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
    });
  } catch {
    return NextResponse.json({ error: "Servera kļūda" }, { status: 500 });
  }
}
