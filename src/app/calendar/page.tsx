"use client";

import { useState, useEffect } from "react";
import { RaceCard } from "@/components/race/RaceCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { CALENDAR_2026 } from "@/data/calendar";

interface Race {
  id: number;
  round: number;
  name: string;
  country: string;
  countryEmoji: string;
  circuit: string;
  hasSprint: boolean;
  qualiStart: string;
  raceStart: string;
  isCompleted: boolean;
}

export default function CalendarPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/races")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRaces(data);
        } else {
          // Use static calendar as fallback
          setRaces(
            CALENDAR_2026.map((r, i) => ({
              id: i + 1,
              round: r.round,
              name: r.name,
              country: r.country,
              countryEmoji: r.countryEmoji,
              circuit: r.circuit,
              hasSprint: r.hasSprint,
              qualiStart: r.qualiStart,
              raceStart: r.raceStart,
              isCompleted: false,
            }))
          );
        }
      })
      .catch(() => {
        setRaces(
          CALENDAR_2026.map((r, i) => ({
            id: i + 1,
            round: r.round,
            name: r.name,
            country: r.country,
            countryEmoji: r.countryEmoji,
            circuit: r.circuit,
            hasSprint: r.hasSprint,
            qualiStart: r.qualiStart,
            raceStart: r.raceStart,
            isCompleted: false,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  if (races.length === 0) {
    return <EmptyState emoji="📅" title="Nav sacīkšu" description="Kalendārs vēl nav pieejams" />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>📅</span> 2026. gada kalendārs
      </h1>

      <div className="space-y-3">
        {races.map((race) => (
          <RaceCard key={race.id} {...race} />
        ))}
      </div>
    </div>
  );
}
