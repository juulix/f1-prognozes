"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { DRIVERS, type Driver } from "@/data/drivers";
import { getTeamById } from "@/data/teams";
import { cn } from "@/lib/utils/cn";

interface DriverComboboxProps {
  value: string | null;
  onChange: (driverId: string) => void;
  excludeIds?: string[];
  label?: string;
  placeholder?: string;
}

export function DriverCombobox({
  value,
  onChange,
  excludeIds = [],
  label,
  placeholder = "Izvēlies braucēju...",
}: DriverComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedDriver = value ? DRIVERS.find((d) => d.id === value) : null;
  const selectedTeam = selectedDriver ? getTeamById(selectedDriver.teamId) : null;

  const filtered = DRIVERS.filter((d) => {
    if (excludeIds.includes(d.id)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.short.toLowerCase().includes(q) ||
      d.number.toString().includes(q) ||
      d.teamId.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(driver: Driver) {
    onChange(driver.id);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-xs text-muted-foreground mb-1 font-medium">
          {label}
        </label>
      )}

      {/* Selected / Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors text-left",
          "bg-muted border-border hover:border-primary/50",
          open && "border-primary ring-1 ring-primary/20"
        )}
      >
        {selectedDriver && selectedTeam ? (
          <>
            <span
              className="team-stripe shrink-0"
              style={{ backgroundColor: selectedTeam.color, height: 20 }}
            />
            <Image src={selectedDriver.imageUrl} alt={selectedDriver.name} width={24} height={24} className="rounded-full object-cover" unoptimized />
            <span className="text-muted-foreground font-mono text-xs">
              #{selectedDriver.number}
            </span>
            <span className="font-medium">{selectedDriver.name}</span>
            <span
              className="ml-auto text-xs font-medium px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: selectedTeam.color + "20",
                color: selectedTeam.color,
              }}
            >
              {selectedTeam.short}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border border-border bg-card shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted">
              <span className="text-muted-foreground">🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Meklēt pēc vārda, numura vai komandas..."
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Nav atrasts neviens braucējs
              </div>
            ) : (
              filtered.map((driver) => {
                const team = getTeamById(driver.teamId);
                const isSelected = value === driver.id;

                return (
                  <button
                    key={driver.id}
                    type="button"
                    onClick={() => handleSelect(driver)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors",
                      "hover:bg-muted/80",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    {/* Team color stripe */}
                    {team && (
                      <span
                        className="team-stripe shrink-0"
                        style={{ backgroundColor: team.color, height: 24 }}
                      />
                    )}

                    {/* Driver photo */}
                    <Image src={driver.imageUrl} alt={driver.name} width={28} height={28} className="rounded-full object-cover shrink-0" unoptimized />

                    {/* Number */}
                    <span className="text-xs text-muted-foreground font-mono w-7">
                      #{driver.number}
                    </span>

                    {/* Name */}
                    <span className={cn("font-medium text-sm flex-1", isSelected && "text-primary")}>
                      {driver.name}
                    </span>

                    {/* Team badge */}
                    {team && (
                      <span
                        className="text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: team.color + "20",
                          color: team.color,
                        }}
                      >
                        {team.short}
                      </span>
                    )}

                    {/* Selected check */}
                    {isSelected && <span className="text-primary">✓</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
