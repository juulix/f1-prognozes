"use client";

import { useState } from "react";
import { DriverCombobox } from "./DriverCombobox";
import { LockIndicator } from "./LockIndicator";
import { cn } from "@/lib/utils/cn";

interface PredictionFormProps {
  raceId: number;
  raceName: string;
  hasSprint: boolean;
  qualiStart: string;
  sprintStart?: string | null;
  raceStart: string;
  existingPredictions?: Record<string, {
    p1DriverId: string;
    p2DriverId: string | null;
    p3DriverId: string | null;
  }>;
}

type Tab = "QUALIFYING" | "SPRINT" | "RACE";

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: "QUALIFYING", label: "Kvalifikācija", emoji: "⏱️" },
  { key: "SPRINT",     label: "Sprints",       emoji: "⚡" },
  { key: "RACE",       label: "Sacīkstes",     emoji: "🏁" },
];

export function PredictionForm({
  raceId,
  hasSprint,
  qualiStart,
  sprintStart,
  raceStart,
  existingPredictions = {},
}: PredictionFormProps) {
  const availableTabs = TABS.filter((t) => t.key !== "SPRINT" || hasSprint);
  const [activeTab, setActiveTab] = useState<Tab>("QUALIFYING");
  const [predictions, setPredictions] = useState<Record<string, { p1: string | null; p2: string | null; p3: string | null }>>(
    () => {
      const initial: Record<string, { p1: string | null; p2: string | null; p3: string | null }> = {};
      for (const tab of availableTabs) {
        const existing = existingPredictions[tab.key];
        initial[tab.key] = existing
          ? { p1: existing.p1DriverId, p2: existing.p2DriverId, p3: existing.p3DriverId }
          : { p1: null, p2: null, p3: null };
      }
      return initial;
    }
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const current = predictions[activeTab] || { p1: null, p2: null, p3: null };
  const isQuali = activeTab === "QUALIFYING";

  const lockTime = activeTab === "QUALIFYING"
    ? qualiStart
    : activeTab === "SPRINT"
    ? sprintStart
    : raceStart;

  const isLocked = lockTime ? new Date(lockTime) <= new Date() : true;

  function updateDriver(position: "p1" | "p2" | "p3", driverId: string) {
    setPredictions((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [position]: driverId },
    }));
    setMessage(null);
  }

  const selectedIds = [current.p1, current.p2, current.p3].filter(Boolean) as string[];

  async function handleSave() {
    if (!current.p1) {
      setMessage({ type: "error", text: "Jānorāda vismaz P1 braucējs!" });
      return;
    }
    if (!isQuali && (!current.p2 || !current.p3)) {
      setMessage({ type: "error", text: "Sprintam/sacīkstēm jānorāda visi 3 braucēji!" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raceId,
          sessionType: activeTab,
          p1DriverId: current.p1,
          p2DriverId: isQuali ? null : current.p2,
          p3DriverId: isQuali ? null : current.p3,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Kļūda saglabājot");
      }

      setMessage({ type: "success", text: "✅ Prognoze saglabāta!" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Kļūda" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="f1-card p-4 md:p-6">
      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
        {availableTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-card text-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>{tab.emoji}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Lock status */}
      {lockTime && <LockIndicator lockTime={lockTime} isLocked={isLocked} />}

      {/* Position selectors */}
      <div className="space-y-4 mt-4">
        {/* P1 — always visible */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="position-badge position-badge-p1">P1</span>
            <span className="text-sm font-medium">
              {isQuali ? "Pole Position" : "Uzvarētājs"}
            </span>
          </div>
          <DriverCombobox
            value={current.p1}
            onChange={(id) => updateDriver("p1", id)}
            excludeIds={isQuali ? [] : selectedIds.filter((id) => id !== current.p1)}
            placeholder={isQuali ? "Kurš dabūs pole?" : "Kurš uzvarēs?"}
          />
        </div>

        {/* P2, P3 — only for Sprint/Race */}
        {!isQuali && (
          <>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="position-badge position-badge-p2">P2</span>
                <span className="text-sm font-medium">Otrā vieta</span>
              </div>
              <DriverCombobox
                value={current.p2}
                onChange={(id) => updateDriver("p2", id)}
                excludeIds={selectedIds.filter((id) => id !== current.p2)}
                placeholder="Kurš būs otrs?"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="position-badge position-badge-p3">P3</span>
                <span className="text-sm font-medium">Trešā vieta</span>
              </div>
              <DriverCombobox
                value={current.p3}
                onChange={(id) => updateDriver("p3", id)}
                excludeIds={selectedIds.filter((id) => id !== current.p3)}
                placeholder="Kurš būs trešais?"
              />
            </div>
          </>
        )}
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
        {isLocked ? "🔒 Balsošana slēgta" : saving ? "Saglabā..." : "💾 Saglabāt prognozi"}
      </button>
    </div>
  );
}
