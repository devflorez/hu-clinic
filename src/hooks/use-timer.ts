"use client";

import { useEffect, useState } from "react";

export function useTimer(timerEndAt: string | null) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!timerEndAt) { setRemaining(0); return; }

    const calc = () => {
      const diff = new Date(timerEndAt).getTime() - Date.now();
      setRemaining(Math.max(0, Math.floor(diff / 1000)));
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [timerEndAt]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return { remaining, display, isExpired: remaining === 0 && !!timerEndAt };
}
