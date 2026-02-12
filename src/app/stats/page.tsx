"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { EmptyState } from "@/components/shared/EmptyState";

interface Stats {
  totalPoints: number;
  totalPredictions: number;
  exactHits: number;
  top3Hits: number;
  bySession: Record<string, number>;
  pointsOverTime: { round: number; name: string; points: number; cumulative: number }[];
}

const SESSION_LABELS: Record<string, { label: string; emoji: string }> = {
  QUALIFYING: { label: "Kvalifikācija", emoji: "⏱️" },
  SPRINT: { label: "Sprints", emoji: "⚡" },
  RACE: { label: "Sacīkstes", emoji: "🏁" },
};

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (!stats) return <EmptyState emoji="📈" title="Nav statistikas" description="Gaidi pirmos rezultātus!" />;

  const accuracy = stats.totalPredictions > 0
    ? Math.round((stats.exactHits / stats.totalPredictions) * 100)
    : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>📈</span> Mana Statistika
      </h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="f1-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.totalPoints}</p>
          <p className="text-xs text-muted-foreground">Kopā punkti</p>
        </div>
        <div className="f1-card p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{accuracy}%</p>
          <p className="text-xs text-muted-foreground">Precizitāte</p>
        </div>
        <div className="f1-card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.exactHits}</p>
          <p className="text-xs text-muted-foreground">Precīzi minējumi</p>
        </div>
        <div className="f1-card p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.top3Hits}</p>
          <p className="text-xs text-muted-foreground">Top 3 trāpījumi</p>
        </div>
      </div>

      {/* Points by session */}
      <div className="f1-card p-4 mb-6">
        <h2 className="font-bold text-sm mb-3">Punkti pa sesijām</h2>
        <div className="space-y-2">
          {Object.entries(stats.bySession).map(([type, pts]) => {
            const info = SESSION_LABELS[type];
            const maxPts = Math.max(...Object.values(stats.bySession), 1);
            return (
              <div key={type} className="flex items-center gap-3">
                <span className="text-sm w-28">
                  {info?.emoji} {info?.label || type}
                </span>
                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/70 rounded-full transition-all"
                    style={{ width: `${(pts / maxPts) * 100}%` }}
                  />
                </div>
                <PointsBadge points={pts} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Points over time */}
      {stats.pointsOverTime.length > 0 && (
        <div className="f1-card p-4">
          <h2 className="font-bold text-sm mb-3">Punktu attīstība</h2>
          <div className="space-y-1">
            {stats.pointsOverTime.map((entry) => (
              <div key={entry.round} className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground w-8">R{entry.round}</span>
                <span className="flex-1 truncate">{entry.name}</span>
                <PointsBadge points={entry.points} />
                <span className="text-muted-foreground text-xs">({entry.cumulative} kopā)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
