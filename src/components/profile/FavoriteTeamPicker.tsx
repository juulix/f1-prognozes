"use client";

import { useState } from "react";
import Image from "next/image";
import { TEAMS } from "@/data/teams";
import { cn } from "@/lib/utils/cn";

interface FavoriteTeamPickerProps {
  currentTeamId: string | null;
  onSave: (teamId: string) => Promise<void>;
}

export function FavoriteTeamPicker({ currentTeamId, onSave }: FavoriteTeamPickerProps) {
  const [selected, setSelected] = useState<string | null>(currentTeamId);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      await onSave(selected);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <span>❤️</span> Mana Favorītu Komanda
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {TEAMS.map((team) => (
          <button
            key={team.id}
            onClick={() => setSelected(team.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
              selected === team.id
                ? "shadow-lg scale-105"
                : "border-border hover:border-primary/20 bg-muted"
            )}
            style={
              selected === team.id
                ? { borderColor: team.color, backgroundColor: team.color + "15" }
                : undefined
            }
          >
            <Image src={team.logoUrl} alt={team.name} width={40} height={40} className="object-contain" unoptimized />
            <span
              className="text-xs font-bold"
              style={selected === team.id ? { color: team.color } : undefined}
            >
              {team.short}
            </span>
          </button>
        ))}
      </div>

      {selected && selected !== currentTeamId && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {saving ? "Saglabā..." : "Saglabāt izvēli"}
        </button>
      )}
    </div>
  );
}
