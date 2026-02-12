"use client";

import { CountdownTimer } from "@/components/race/CountdownTimer";

interface LockIndicatorProps {
  lockTime: string;
  isLocked: boolean;
}

export function LockIndicator({ lockTime, isLocked }: LockIndicatorProps) {
  if (isLocked) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
        <span className="text-lg">🔒</span>
        <span className="text-sm text-red-400 font-medium">Balsošana ir slēgta</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
      <div className="flex items-center gap-2">
        <span className="text-lg">⏳</span>
        <span className="text-sm text-green-400 font-medium">Atvērts līdz:</span>
      </div>
      <CountdownTimer targetDate={lockTime} />
    </div>
  );
}
