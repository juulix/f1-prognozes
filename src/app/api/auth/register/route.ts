import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPin, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, pin } = await request.json();

    if (!name || !pin) {
      return NextResponse.json({ error: "Vārds un PIN ir obligāti" }, { status: 400 });
    }

    if (pin.length < 4) {
      return NextResponse.json({ error: "PIN jābūt vismaz 4 cipari" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Šāds vārds jau eksistē" }, { status: 409 });
    }

    const hashedPin = await hashPin(pin);
    const user = await prisma.user.create({
      data: { name, pin: hashedPin },
    });

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
