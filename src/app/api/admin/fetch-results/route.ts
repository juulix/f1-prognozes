import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fetchSessionResults } from "@/lib/f1-api";
import type { SessionResultType } from "@/lib/f1-api";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Nav admin tiesību" }, { status: 403 });
    }

    const { season, round, sessionType } = await request.json();

    if (!season || !round || !sessionType) {
      return NextResponse.json(
        { error: "Trūkst parametru (season, round, sessionType)" },
        { status: 400 }
      );
    }

    const result = await fetchSessionResults(
      parseInt(season),
      parseInt(round),
      sessionType as SessionResultType
    );

    if (!result) {
      return NextResponse.json(
        { error: "Rezultāti vēl nav pieejami F1 API" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Kļūda ielādējot rezultātus" }, { status: 500 });
  }
}
