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

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveTeam(teamId: string) {
    await fetch("/api/profile/favorite-team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });
    setProfile((prev) => prev ? { ...prev, favoriteTeamId: teamId } : prev);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (!profile) return null;

  const team = profile.favoriteTeamId ? getTeamById(profile.favoriteTeamId) : null;

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
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              {profile.isAdmin && (
                <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-medium">
                  ⚙️ Admin
                </span>
              )}
              {team && (
                <span
                  className="text-xs px-2 py-0.5 rounded font-medium"
                  style={{ backgroundColor: team.color + "20", color: team.color }}
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
