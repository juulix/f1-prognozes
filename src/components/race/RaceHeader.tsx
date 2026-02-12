import { formatDateLV } from "@/lib/utils/dates";

interface RaceHeaderProps {
  name: string;
  country: string;
  countryEmoji: string;
  circuit: string;
  round: number;
  raceStart: string;
  hasSprint: boolean;
}

export function RaceHeader({
  name,
  countryEmoji,
  circuit,
  round,
  raceStart,
  hasSprint,
}: RaceHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        <span>Raunds {round}</span>
        <span>•</span>
        <span>{formatDateLV(raceStart)}</span>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
        <span className="text-3xl md:text-4xl">{countryEmoji}</span>
        {name}
      </h1>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm text-muted-foreground">{circuit}</span>
        {hasSprint && (
          <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-medium">
            ⚡ Sprint nedēļas nogale
          </span>
        )}
      </div>
    </div>
  );
}
