"use client";

import { useState, useEffect } from "react";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { PointsChart } from "@/components/leaderboard/PointsChart";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface LeaderboardEntry {
  userId: string;
  name: string;
  totalPoints: number;
  raceCount: number;
  favoriteTeamId: string | null;
  scores: { raceId: number; totalPoints: number }[];
}

export default function LeaderboardPage() {
  const { user } = useCurrentUser();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/scores/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEntries(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  // Build chart data
  const allRaceIds = [...new Set(entries.flatMap((e) => e.scores.map((s) => s.raceId)))].sort();
  const chartData = allRaceIds.map((raceId) => {
    const point: { round: number; name: string; [userName: string]: number | string } = { round: raceId, name: `R${raceId}` };
    for (const entry of entries) {
      const cumul = entry.scores
        .filter((s) => s.raceId <= raceId)
        .reduce((sum, s) => sum + s.totalPoints, 0);
      point[entry.name] = cumul;
    }
    return point;
  });
  const userNames = entries.map((e) => e.name);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>📊</span> Kopvērtējums
      </h1>

      <LeaderboardTable entries={entries} currentUserId={user?.userId} />

      {chartData.length > 0 && (
        <div className="mt-6">
          <PointsChart data={chartData} userNames={userNames} />
        </div>
      )}
    </div>
  );
}
