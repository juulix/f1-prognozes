"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), pin }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Kļūda");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kļūda");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="f1-card p-6 md:p-8 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-5xl mb-3 block">🏎️</span>
          <h1 className="text-2xl font-bold">F1 Prognozes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Balsošanas sistēma
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
          <button
            onClick={() => setMode("login")}
            className={cn(
              "flex-1 py-2 rounded-md text-sm font-medium transition-colors",
              mode === "login"
                ? "bg-card text-foreground shadow"
                : "text-muted-foreground"
            )}
          >
            Ielogoties
          </button>
          <button
            onClick={() => setMode("register")}
            className={cn(
              "flex-1 py-2 rounded-md text-sm font-medium transition-colors",
              mode === "register"
                ? "bg-card text-foreground shadow"
                : "text-muted-foreground"
            )}
          >
            Reģistrēties
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Tavs vārds
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="piem., Jānis"
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              PIN kods
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Vismaz 4 cipari"
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-mono tracking-widest text-center text-lg"
              required
              minLength={4}
            />
          </div>

          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading
              ? "⏳ Gaidi..."
              : mode === "login"
              ? "🏁 Ielogoties"
              : "🏁 Reģistrēties"}
          </button>
        </form>
      </div>
    </div>
  );
}
