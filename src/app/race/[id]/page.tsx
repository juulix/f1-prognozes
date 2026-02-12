"use client";

import { useState, useEffect, use } from "react";
import { RaceHeader } from "@/components/race/RaceHeader";
import { PredictionForm } from "@/components/prediction/PredictionForm";
import { CountdownTimer } from "@/components/race/CountdownTimer";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CALENDAR_2026 } from "@/data/calendar";
import Link from "next/link";

interface RaceData {
  id: number;
  round: number;
  name: string;
  country: string;
  countryEmoji: string;
  circuit: string;
  hasSprint: boolean;
  qualiStart: string;
  sprintStart: string | null;
  raceStart: string;
  isCompleted: boolean;
}

interface PredictionData {
  sessionType: string;
  p1DriverId: string;
  p2DriverId: string | null;
  p3DriverId: string | null;
}

export default function RacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [race, setRace] = useState<RaceData | null>(null);
  const [predictions, setPredictions] = useState<Record<string, PredictionData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const raceRes = await fetch(`/api/races/${id}`);
        if (raceRes.ok) {
          const raceData = await raceRes.json();
          setRace(raceData);
        } else {
          // Fallback to static calendar
          const idx = parseInt(id) - 1;
          if (idx >= 0 && idx < CALENDAR_2026.length) {
            const cal = CALENDAR_2026[idx];
            setRace({
              id: idx + 1,
              round: cal.round,
              name: cal.name,
              country: cal.country,
              countryEmoji: cal.countryEmoji,
              circuit: cal.circuit,
              hasSprint: cal.hasSprint,
              qualiStart: cal.qualiStart,
              sprintStart: cal.sprintStart || null,
              raceStart: cal.raceStart,
              isCompleted: false,
            });
          }
        }

        const predRes = await fetch(`/api/predictions?raceId=${id}`);
        if (predRes.ok) {
          const predData: PredictionData[] = await predRes.json();
          const map: Record<string, PredictionData> = {};
          for (const p of predData) {
            map[p.sessionType] = p;
          }
          setPredictions(map);
        }
      } catch {
        // fallback handled above
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (!race) return <div className="text-center mt-20 text-muted-foreground">Sacīkstes nav atrastas</div>;

  return (
    <div>
      <RaceHeader
        name={race.name}
        country={race.country}
        countryEmoji={race.countryEmoji}
        circuit={race.circuit}
        round={race.round}
        raceStart={race.raceStart}
        hasSprint={race.hasSprint}
      />

      {/* Countdown to next session */}
      <div className="f1-card p-4 mb-6">
        <h3 className="text-sm font-semibold mb-3">⏰ Nākamā sesija:</h3>
        <CountdownTimer targetDate={race.raceStart} label="Sacīkstes sākums" />
      </div>

      {/* Prediction form */}
      {!race.isCompleted ? (
        <PredictionForm
          raceId={race.id}
          raceName={race.name}
          hasSprint={race.hasSprint}
          qualiStart={race.qualiStart}
          sprintStart={race.sprintStart}
          raceStart={race.raceStart}
          existingPredictions={predictions}
        />
      ) : (
        <div className="f1-card p-6 text-center">
          <span className="text-3xl mb-2 block">🏁</span>
          <p className="font-medium">Sacīkstes pabeigtas!</p>
          <Link
            href={`/race/${race.id}/results`}
            className="inline-block mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
          >
            Skatīt rezultātus →
          </Link>
        </div>
      )}
    </div>
  );
}
