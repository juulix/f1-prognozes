"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FavoriteTeamPicker } from "@/components/profile/FavoriteTeamPicker";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { getTeamById } from "@/data/teams";

interface Profile {
  userId: string;
  name: string;
  isAdmin: boolean;
  favoriteTeamId: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Name editing state
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setProfile(data);
        if (data) setNewName(data.name);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveTeam(teamId: string) {
    await fetch("/api/profile/favorite-team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });
    setProfile((prev) => (prev ? { ...prev, favoriteTeamId: teamId } : prev));
  }

  async function handleSaveName() {
    const trimmed = newName.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      setNameError("Vārdam jābūt no 2 līdz 30 simboliem");
      return;
    }
    if (trimmed === profile?.name) {
      setEditingName(false);
      setNameError("");
      return;
    }

    setSavingName(true);
    setNameError("");

    try {
      const res = await fetch("/api/profile/name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => (prev ? { ...prev, name: data.name } : prev));
        setNewName(data.name);
        setEditingName(false);
      } else {
        const err = await res.json();
        setNameError(err.error || "Neizdevās saglabāt");
      }
    } catch {
      setNameError("Savienojuma kļūda");
    } finally {
      setSavingName(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (!profile) return null;

  const team = profile.favoriteTeamId
    ? getTeamById(profile.favoriteTeamId)
    : null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>👤</span> Profils
      </h1>

      {/* Profile card */}
      <div className="f1-card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            {editingName ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      setNameError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") {
                        setEditingName(false);
                        setNewName(profile.name);
                        setNameError("");
                      }
                    }}
                    className="bg-muted border border-border rounded-lg px-3 py-1.5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 w-full max-w-[200px]"
                    maxLength={30}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    {savingName ? "..." : "Saglabāt"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setNewName(profile.name);
                      setNameError("");
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Atcelt
                  </button>
                </div>
                {nameError && (
                  <p className="text-xs text-red-400">{nameError}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-xs px-2 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
                  title="Mainīt vārdu"
                >
                  ✏️
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              {profile.isAdmin && (
                <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-medium">
                  ⚙️ Admin
                </span>
              )}
              {team && (
                <span
                  className="text-xs px-2 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor: team.color + "20",
                    color: team.color,
                  }}
                >
                  {team.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Favorite team picker */}
      <div className="f1-card p-6 mb-6">
        <FavoriteTeamPicker
          currentTeamId={profile.favoriteTeamId}
          onSave={handleSaveTeam}
        />
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-sm font-medium transition-colors"
      >
        Izlogoties
      </button>
    </div>
  );
}
