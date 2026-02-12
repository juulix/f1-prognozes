"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { RaceCard } from "@/components/race/RaceCard";
import { CountdownTimer } from "@/components/race/CountdownTimer";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CALENDAR_2026 } from "@/data/calendar";
import { isInFuture } from "@/lib/utils/dates";

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

interface LeaderboardEntry {
  userId: string;
  name: string;
  totalPoints: number;
}

export default function HomePage() {
  const { user } = useCurrentUser();
  const [nextRace, setNextRace] = useState<Race | null>(null);
  const [upcomingRaces, setUpcomingRaces] = useState<Race[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        let races: Race[] = [];
        const racesRes = await fetch("/api/races");
        if (racesRes.ok) {
          const data = await racesRes.json();
          if (Array.isArray(data) && data.length > 0) {
            races = data;
          }
        }

        if (races.length === 0) {
          races = CALENDAR_2026.map((r, i) => ({
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
          }));
        }

        const future = races.filter((r) => isInFuture(r.raceStart) && !r.isCompleted);
        setNextRace(future[0] || null);
        setUpcomingRaces(future.slice(1, 4));

        const lbRes = await fetch("/api/scores/leaderboard");
        if (lbRes.ok) {
          const lbData = await lbRes.json();
          if (Array.isArray(lbData)) setLeaderboard(lbData.slice(0, 5));
        }
      } catch {
        // fallback handled
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Sveiks, {user?.name || "Draug"}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Gatavs prognozēt F1 rezultātus?
        </p>
      </div>

      {/* Next race highlight */}
      {nextRace && (
        <Link href={`/race/${nextRace.id}`} className="block mb-6">
          <div className="f1-card p-6 border-primary/30 bg-gradient-to-br from-card to-primary/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-primary font-semibold uppercase tracking-wider">
                Nākamā sacīkstes
              </span>
              {nextRace.hasSprint && (
                <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-medium">
                  ⚡ Sprint
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{nextRace.countryEmoji}</span>
              <div>
                <h2 className="text-xl font-bold">{nextRace.name}</h2>
                <p className="text-sm text-muted-foreground">{nextRace.circuit}</p>
              </div>
            </div>

            <CountdownTimer targetDate={nextRace.qualiStart} label="Kvalifikācija sākas pēc:" />

            <div className="mt-4 text-sm text-primary font-medium">
              Balsot tagad →
            </div>
          </div>
        </Link>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Link href="/calendar" className="f1-card p-4 text-center hover:border-primary/30">
          <span className="text-2xl mb-1 block">📅</span>
          <span className="text-xs font-medium">Kalendārs</span>
        </Link>
        <Link href="/season" className="f1-card p-4 text-center hover:border-primary/30">
          <span className="text-2xl mb-1 block">🏆</span>
          <span className="text-xs font-medium">Sezona</span>
        </Link>
        <Link href="/leaderboard" className="f1-card p-4 text-center hover:border-primary/30">
          <span className="text-2xl mb-1 block">📊</span>
          <span className="text-xs font-medium">Punkti</span>
        </Link>
        <Link href="/stats" className="f1-card p-4 text-center hover:border-primary/30">
          <span className="text-2xl mb-1 block">📈</span>
          <span className="text-xs font-medium">Statistika</span>
        </Link>
      </div>

      {/* Mini leaderboard */}
      {leaderboard.length > 0 && (
        <div className="f1-card p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm">📊 Top 5</h2>
            <Link href="/leaderboard" className="text-xs text-primary">
              Visi →
            </Link>
          </div>
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <div key={entry.userId} className="flex items-center justify-between text-sm">
                <span>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}{" "}
                  {entry.name}
                </span>
                <span className="font-bold">{entry.totalPoints} pkt</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming races */}
      {upcomingRaces.length > 0 && (
        <div>
          <h2 className="font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wider">
            Tuvākās sacīkstes
          </h2>
          <div className="space-y-2">
            {upcomingRaces.map((race) => (
              <RaceCard key={race.id} {...race} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
