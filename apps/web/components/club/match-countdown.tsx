"use client";

import { useEffect, useState } from "react";

function formatRemaining(ms: number) {
  if (ms <= 0) return "Скоро свисток";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  if (h > 0) return `${h}ч ${m}м`;
  if (m > 0) return `${m}м ${s}с`;
  return `${s}с`;
}

export function MatchCountdown({
  targetIso,
  label = "До матча",
}: {
  targetIso: string;
  label?: string;
}) {
  const [text, setText] = useState("—");

  useEffect(() => {
    const target = new Date(targetIso).getTime();
    const tick = () => setText(formatRemaining(target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return (
    <div className="rounded-xl border border-info/25 bg-info/5 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-info">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-white">
        {text}
      </p>
    </div>
  );
}
