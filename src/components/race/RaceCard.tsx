"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { formatDateShortLV, formatTimeLV, isInPast } from "@/lib/utils/dates";

interface RaceCardProps {
  id: number;
  round: number;
  name: string;
  country: string;
  countryEmoji: string;
  circuit: string;
  hasSprint: boolean;
  raceStart: string;
  qualiStart: string;
  isCompleted: boolean;
}

export function RaceCard({
  id,
  round,
  name,
  country,
  countryEmoji,
  circuit,
  hasSprint,
  raceStart,
  qualiStart,
  isCompleted,
}: RaceCardProps) {
  const isPast = isInPast(raceStart);
  const isNext = !isPast && !isCompleted;

  return (
    <Link href={`/race/${id}`} className="block">
      <div
        className={cn(
          "f1-card p-4 flex gap-3",
          isNext && "border-primary/50 ring-1 ring-primary/20",
          isCompleted && "opacity-70"
        )}
      >
        {/* Round number */}
        <div className="flex flex-col items-center justify-center min-w-[40px]">
          <span className="text-xs text-muted-foreground">R</span>
          <span className="text-lg font-bold">{round}</span>
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{countryEmoji}</span>
            <h3 className="font-semibold text-sm truncate">{name}</h3>
          </div>
          <p className="text-xs text-muted-foreground truncate">{circuit}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDateShortLV(raceStart)} {formatTimeLV(raceStart)}
            </span>
            {hasSprint && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-medium">
                Sprint
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col items-end justify-center">
          {isCompleted ? (
            <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400">✅ Pabeigts</span>
          ) : isNext ? (
            <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-semibold">Nākamais →</span>
          ) : isPast ? (
            <span className="text-xs text-muted-foreground">Gaida rezultātus</span>
          ) : (
            <span className="text-xs text-muted-foreground">Drīzumā</span>
          )}
        </div>
      </div>
    </Link>
  );
}
