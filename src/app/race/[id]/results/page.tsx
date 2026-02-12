"use client";

import { useState, useEffect, use } from "react";
import { DriverChip } from "@/components/shared/DriverChip";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils/cn";

interface RaceResult {
  sessionType: string;
  p1DriverId: string;
  p2DriverId: string | null;
  p3DriverId: string | null;
}

interface ScoreEntry {
  userId: string;
  userName: string;
  sessionType: string;
  totalPoints: number;
  breakdown: { p1: string; p2?: string; p3?: string; allExactBonus: boolean };
}

const SESSION_LABELS: Record<string, string> = {
  QUALIFYING: "⏱️ Kvalifikācija",
  SPRINT: "⚡ Sprints",
  RACE: "🏁 Sacīkstes",
};

export default function RaceResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const raceRes = await fetch(`/api/races/${id}`);
        if (raceRes.ok) {
          const data = await raceRes.json();
          setResults(data.results || []);
        }

        const scoresRes = await fetch(`/api/scores/${id}`);
        if (scoresRes.ok) {
          setScores(await scoresRes.json());
        }
      } catch {
        // error handled
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🏁 Rezultāti</h1>

      {results.length === 0 ? (
        <div className="f1-card p-8 text-center text-muted-foreground">
          Rezultāti vēl nav ievadīti
        </div>
      ) : (
        <div className="space-y-6">
          {results.map((result) => (
            <div key={result.sessionType} className="f1-card p-4">
              <h2 className="font-bold mb-4">{SESSION_LABELS[result.sessionType] || result.sessionType}</h2>

              {/* Official result */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3">
                  <span className="position-badge position-badge-p1">P1</span>
                  <DriverChip driverId={result.p1DriverId} />
                </div>
                {result.p2DriverId && (
                  <div className="flex items-center gap-3">
                    <span className="position-badge position-badge-p2">P2</span>
                    <DriverChip driverId={result.p2DriverId} />
                  </div>
                )}
                {result.p3DriverId && (
                  <div className="flex items-center gap-3">
                    <span className="position-badge position-badge-p3">P3</span>
                    <DriverChip driverId={result.p3DriverId} />
                  </div>
                )}
              </div>

              {/* Scores */}
              <div className="border-t border-border pt-3">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Punkti:</h3>
                <div className="space-y-1">
                  {scores
                    .filter((s) => s.sessionType === result.sessionType)
                    .sort((a, b) => b.totalPoints - a.totalPoints)
                    .map((score) => (
                      <div
                        key={`${score.userId}-${score.sessionType}`}
                        className="flex items-center justify-between py-1.5 px-2 rounded"
                      >
                        <span className="text-sm">{score.userName}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs", score.breakdown.p1 === "exact" ? "score-exact" : score.breakdown.p1 === "top3" ? "score-top3" : "score-miss")}>
                            P1:{score.breakdown.p1}
                          </span>
                          <PointsBadge points={score.totalPoints} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
