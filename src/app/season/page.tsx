"use client";

import { useState, useEffect } from "react";
import { SeasonPredictionForm } from "@/components/prediction/SeasonPredictionForm";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function SeasonPage() {
  const [prediction, setPrediction] = useState<{
    championDriverId: string;
    championTeamId: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/season-predictions")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPrediction(data))
      .catch(() => setPrediction(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <span>🏆</span> Sezonas Prognozes
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Prognozē, kurš kļūs par 2026. gada čempionu! Prognozes jāiesniedz pirms 3. raunda.
      </p>

      <SeasonPredictionForm existingPrediction={prediction} />
    </div>
  );
}
