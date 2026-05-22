"use client";

import { useEffect, useState } from "react";

type LiveItem = { home: string; away: string; score: string; phase: string };

export function LiveScoreTicker({ slug = "demo" }: { slug?: string }) {
  const [items, setItems] = useState<LiveItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/v1/${slug}/live`);
        if (!res.ok) return;
        const data = await res.json();
        const live = (data.live ?? []) as LiveItem[];
        const today = (data.today ?? [])
          .filter((t: { status: string }) => t.status === "LIVE")
          .map((t: { home: string; away: string; score: string | null }) => ({
            home: t.home,
            away: t.away,
            score: t.score ?? "0:0",
            phase: "LIVE",
          }));
        setItems([...live, ...today].slice(0, 8));
      } catch {
        setItems([]);
      }
    }
    load();
    const t = setInterval(load, 12_000);
    return () => clearInterval(t);
  }, [slug]);

  if (items.length === 0) {
    return (
      <div className="overflow-hidden border-y border-white/5 bg-black/30 py-3">
        <p className="text-center font-mono text-xs text-muted">
          Live-матчи появятся здесь · slug {slug}
        </p>
      </div>
    );
  }

  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-accent/20 bg-accent/5 py-3">
      <div className="flex animate-marquee gap-10 whitespace-nowrap px-4">
        {doubled.map((m, i) => (
          <span key={i} className="inline-flex items-center gap-3 font-mono text-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
            <span className="text-white">{m.home}</span>
            <span className="text-accent font-bold">{m.score}</span>
            <span className="text-white">{m.away}</span>
            <span className="text-[10px] uppercase text-muted">{m.phase}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
