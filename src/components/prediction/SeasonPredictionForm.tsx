"use client";

import { useState } from "react";
import { DriverCombobox } from "./DriverCombobox";
import { TEAMS } from "@/data/teams";
import { cn } from "@/lib/utils/cn";

interface SeasonPredictionFormProps {
  existingPrediction?: {
    championDriverId: string;
    championTeamId: string;
  } | null;
  isLocked?: boolean;
}

export function SeasonPredictionForm({
  existingPrediction,
  isLocked = false,
}: SeasonPredictionFormProps) {
  const [driverId, setDriverId] = useState<string | null>(
    existingPrediction?.championDriverId ?? null
  );
  const [teamId, setTeamId] = useState<string | null>(
    existingPrediction?.championTeamId ?? null
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave() {
    if (!driverId || !teamId) {
      setMessage({ type: "error", text: "Jāizvēlas gan braucējs, gan komanda!" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/season-predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ championDriverId: driverId, championTeamId: teamId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Kļūda saglabājot");
      }

      setMessage({ type: "success", text: "✅ Sezonas prognoze saglabāta!" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Kļūda" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="f1-card p-4 md:p-6">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>🏆</span> Sezonas Prognozes
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Prognozē 2026. gada čempionu un labāko komandu. Pareizs braucējs = 50 punkti, pareiza komanda = 30 punkti!
      </p>

      <div className="space-y-6">
        {/* Driver champion */}
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <span>👑</span> Pasaules čempions
            <span className="text-xs text-muted-foreground">(50 pkt)</span>
          </h3>
          <DriverCombobox
            value={driverId}
            onChange={setDriverId}
            placeholder="Kurš kļūs par čempionu?"
          />
        </div>

        {/* Constructor champion */}
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <span>🏗️</span> Konstruktoru čempions
            <span className="text-xs text-muted-foreground">(30 pkt)</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {TEAMS.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => !isLocked && setTeamId(team.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-left text-sm",
                  teamId === team.id
                    ? "border-2 shadow-md"
                    : "border-border hover:border-primary/30 bg-muted",
                  isLocked && "opacity-50 cursor-not-allowed"
                )}
                style={
                  teamId === team.id
                    ? { borderColor: team.color, backgroundColor: team.color + "10" }
                    : undefined
                }
                disabled={isLocked}
              >
                <span
                  className="team-stripe shrink-0"
                  style={{ backgroundColor: team.color, height: 20 }}
                />
                <span>{team.emoji}</span>
                <span className="font-medium">{team.short}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={cn(
            "mt-4 px-3 py-2 rounded-lg text-sm",
            message.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
          )}
        >
          {message.text}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={isLocked || saving}
        className={cn(
          "mt-6 w-full py-3 rounded-lg font-semibold text-sm transition-colors",
          isLocked
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {isLocked ? "🔒 Sezonas prognoze slēgta" : saving ? "Saglabā..." : "💾 Saglabāt sezonas prognozi"}
      </button>
    </div>
  );
}
