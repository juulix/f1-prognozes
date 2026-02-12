"use client";

import { cn } from "@/lib/utils/cn";

interface LeaderboardEntry {
  userId: string;
  name: string;
  totalPoints: number;
  raceCount: number;
  favoriteTeamId: string | null;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const PODIUM_STYLES = [
  "bg-yellow-500/10 border-yellow-500/30",
  "bg-gray-400/10 border-gray-400/30",
  "bg-amber-700/10 border-amber-700/30",
];

const PODIUM_EMOJIS = ["🥇", "🥈", "🥉"];

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="f1-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-bold flex items-center gap-2">
          <span>📊</span> Kopvērtējums
        </h2>
      </div>

      <div className="divide-y divide-border">
        {entries.map((entry, i) => (
          <div
            key={entry.userId}
            className={cn(
              "flex items-center gap-3 px-4 py-3 transition-colors",
              i < 3 && PODIUM_STYLES[i],
              entry.userId === currentUserId && "ring-1 ring-primary/30 bg-primary/5"
            )}
          >
            {/* Position */}
            <div className="w-8 text-center">
              {i < 3 ? (
                <span className="text-xl">{PODIUM_EMOJIS[i]}</span>
              ) : (
                <span className="text-sm font-bold text-muted-foreground">{i + 1}.</span>
              )}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <span className={cn("font-medium text-sm", entry.userId === currentUserId && "text-primary")}>
                {entry.name}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                ({entry.raceCount} sacīkstes)
              </span>
            </div>

            {/* Points */}
            <div className="text-right">
              <span className="font-bold text-lg">{entry.totalPoints}</span>
              <span className="text-xs text-muted-foreground ml-1">pkt</span>
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          Vēl nav punktu. Gaidām pirmo sacīkšu rezultātus! 🏎️
        </div>
      )}
    </div>
  );
}
