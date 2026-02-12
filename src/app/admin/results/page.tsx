"use client";

import { useState, useEffect } from "react";
import { DriverCombobox } from "@/components/prediction/DriverCombobox";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils/cn";
import { CALENDAR_2026 } from "@/data/calendar";
import { getDriverById } from "@/data/drivers";

interface Race {
  id: number;
  round: number;
  name: string;
  countryEmoji: string;
  hasSprint: boolean;
}

type SessionType = "QUALIFYING" | "SPRINT" | "RACE";

const SEASON = 2026;

export default function AdminResultsPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [sessionType, setSessionType] = useState<SessionType>("QUALIFYING");
  const [p1, setP1] = useState<string | null>(null);
  const [p2, setP2] = useState<string | null>(null);
  const [p3, setP3] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/races")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRaces(data);
        } else {
          setRaces(
            CALENDAR_2026.map((r, i) => ({
              id: i + 1,
              round: r.round,
              name: r.name,
              countryEmoji: r.countryEmoji,
              hasSprint: r.hasSprint,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isQuali = sessionType === "QUALIFYING";
  const selectedIds = [p1, p2, p3].filter(Boolean) as string[];

  async function handleFetchFromAPI() {
    if (!selectedRace) return;
    setFetching(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/fetch-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          season: SEASON,
          round: selectedRace.round,
          sessionType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Kļūda");
      }

      const result = await res.json();

      // Auto-fill the driver selectors
      if (result.p1DriverId) setP1(result.p1DriverId);
      if (result.p2DriverId) setP2(result.p2DriverId);
      if (result.p3DriverId) setP3(result.p3DriverId);

      // Build readable message
      const names = [result.p1DriverId, result.p2DriverId, result.p3DriverId]
        .filter(Boolean)
        .map((id: string, i: number) => {
          const d = getDriverById(id);
          return d ? `P${i + 1}: ${d.emoji} ${d.name}` : `P${i + 1}: ${id}`;
        });

      setMessage({
        type: "info",
        text: `Ielādēti no F1 API: ${names.join(" | ")}`,
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Neizdevās ielādēt",
      });
    } finally {
      setFetching(false);
    }
  }

  async function handleSave() {
    if (!selectedRace || !p1) {
      setMessage({ type: "error", text: "Izvēlies sacīkstes un P1!" });
      return;
    }
    if (!isQuali && (!p2 || !p3)) {
      setMessage({ type: "error", text: "Norādi visus 3 braucējus!" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raceId: selectedRace.id,
          sessionType,
          p1DriverId: p1,
          p2DriverId: isQuali ? null : p2,
          p3DriverId: isQuali ? null : p3,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Kļūda");
      }

      const data = await res.json();
      setMessage({
        type: "success",
        text: `Rezultāts saglabāts! Aprēķināti punkti ${data.scoresCalculated} lietotājiem.`,
      });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Kļūda" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>🏁</span> Ievadīt Rezultātus
      </h1>

      {/* Race selector */}
      <div className="f1-card p-4 mb-4">
        <h3 className="text-sm font-medium mb-2">Sacīkstes:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
          {races.map((race) => (
            <button
              key={race.id}
              onClick={() => {
                setSelectedRace(race);
                setP1(null);
                setP2(null);
                setP3(null);
                setMessage(null);
              }}
              className={cn(
                "px-3 py-2 rounded-lg border text-left text-sm transition-colors",
                selectedRace?.id === race.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/30"
              )}
            >
              {race.countryEmoji} R{race.round}
            </button>
          ))}
        </div>
      </div>

      {selectedRace && (
        <div className="f1-card p-4">
          <h3 className="font-bold mb-4">
            {selectedRace.countryEmoji} {selectedRace.name}
          </h3>

          {/* Session type */}
          <div className="flex gap-1 mb-4 bg-muted rounded-lg p-1">
            {(["QUALIFYING", "SPRINT", "RACE"] as SessionType[])
              .filter((t) => t !== "SPRINT" || selectedRace.hasSprint)
              .map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setSessionType(t);
                    setP1(null);
                    setP2(null);
                    setP3(null);
                    setMessage(null);
                  }}
                  className={cn(
                    "flex-1 py-2 rounded-md text-sm font-medium transition-colors",
                    sessionType === t ? "bg-card shadow" : "text-muted-foreground"
                  )}
                >
                  {t === "QUALIFYING" ? "Kvalif." : t === "SPRINT" ? "Sprints" : "Sacīkstes"}
                </button>
              ))}
          </div>

          {/* Auto-fetch from F1 API */}
          <button
            onClick={handleFetchFromAPI}
            disabled={fetching}
            className="w-full mb-4 py-3 rounded-lg border-2 border-dashed border-primary/40 text-primary font-medium text-sm hover:bg-primary/5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {fetching ? (
              <span className="animate-pulse">Ielādē no F1 API...</span>
            ) : (
              "Ielādēt rezultātus no F1 API"
            )}
          </button>

          {/* Driver selectors */}
          <div className="space-y-4">
            <div>
              <span className="position-badge position-badge-p1 mr-2">P1</span>
              <DriverCombobox
                value={p1}
                onChange={setP1}
                excludeIds={selectedIds.filter((id) => id !== p1)}
              />
            </div>
            {!isQuali && (
              <>
                <div>
                  <span className="position-badge position-badge-p2 mr-2">P2</span>
                  <DriverCombobox
                    value={p2}
                    onChange={setP2}
                    excludeIds={selectedIds.filter((id) => id !== p2)}
                  />
                </div>
                <div>
                  <span className="position-badge position-badge-p3 mr-2">P3</span>
                  <DriverCombobox
                    value={p3}
                    onChange={setP3}
                    excludeIds={selectedIds.filter((id) => id !== p3)}
                  />
                </div>
              </>
            )}
          </div>

          {message && (
            <div
              className={cn(
                "mt-4 px-3 py-2 rounded-lg text-sm",
                message.type === "success"
                  ? "bg-green-500/10 text-green-400"
                  : message.type === "info"
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-red-500/10 text-red-400"
              )}
            >
              {message.text}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saglabā..." : "Saglabāt rezultātu un aprēķināt punktus"}
          </button>
        </div>
      )}
    </div>
  );
}
