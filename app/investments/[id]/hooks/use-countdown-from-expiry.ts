"use client";

import { useEffect, useState } from "react";

export function useCountdownFromExpiry(
  expiresAt: string | undefined,
  fallbackHours: number,
  fallbackMinutes: number
): { hours: number; minutes: number } {
  const [remaining, setRemaining] = useState({
    hours: fallbackHours,
    minutes: fallbackMinutes,
  });

  useEffect(() => {
    const compute = () => {
      if (!expiresAt) {
        return { hours: fallbackHours, minutes: fallbackMinutes };
      }

      const remainingMs = new Date(expiresAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        return { hours: 0, minutes: 0 };
      }

      return {
        hours: Math.floor(remainingMs / (60 * 60 * 1000)),
        minutes: Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000)),
      };
    };

    setRemaining(compute());
    const intervalId = window.setInterval(() => setRemaining(compute()), 30_000);
    return () => window.clearInterval(intervalId);
  }, [expiresAt, fallbackHours, fallbackMinutes]);

  return remaining;
}
