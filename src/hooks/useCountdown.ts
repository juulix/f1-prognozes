"use client";

import { useState, useEffect } from "react";
import { getTimeUntil } from "@/lib/utils/dates";

export function useCountdown(targetDate: Date | string) {
  const [time, setTime] = useState(() => getTimeUntil(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const t = getTimeUntil(targetDate);
      setTime(t);
      if (t.total <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return { ...time, isExpired: time.total <= 0 };
}
