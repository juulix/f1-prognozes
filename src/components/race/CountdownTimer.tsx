"use client";

import { useCountdown } from "@/hooks/useCountdown";

interface CountdownTimerProps {
  targetDate: Date | string;
  label?: string;
}

export function CountdownTimer({ targetDate, label }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  if (isExpired) {
    return (
      <div className="flex items-center gap-2">
        <span className="pulse-dot w-2 h-2 rounded-full bg-red-500" />
        <span className="text-sm font-medium text-red-400">Sesija sākusies</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <div className="flex items-center gap-2">
        {days > 0 && (
          <>
            <div className="countdown-digit">{days}</div>
            <span className="text-xs text-muted-foreground">d</span>
          </>
        )}
        <div className="countdown-digit">{String(hours).padStart(2, "0")}</div>
        <span className="text-muted-foreground font-bold">:</span>
        <div className="countdown-digit">{String(minutes).padStart(2, "0")}</div>
        <span className="text-muted-foreground font-bold">:</span>
        <div className="countdown-digit">{String(seconds).padStart(2, "0")}</div>
      </div>
    </div>
  );
}
