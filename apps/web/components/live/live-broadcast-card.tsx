"use client";

import { livePhaseLabel, parseLiveScore } from "@/lib/live-labels";
import { cn } from "@/lib/utils";
import { Radio } from "lucide-react";

export function LiveBroadcastCard({
  home,
  away,
  score,
  phase,
  featured,
}: {
  home: string;
  away: string;
  score: string;
  phase: string;
  featured?: boolean;
}) {
  const { home: hs, away: as } = parseLiveScore(score);

  return (
    <article
      className={cn(
        "live-broadcast-card relative overflow-hidden rounded-[1.75rem] border p-[1px]",
        featured
          ? "border-danger/50 shadow-[0_0_80px_rgba(255,71,87,0.2)]"
          : "border-white/10",
      )}
    >
      <div className="relative rounded-[1.7rem] bg-[#080c10]/95 px-6 py-8 backdrop-blur-xl sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,71,87,0.08)_0%,transparent_35%,transparent_70%,rgba(0,0,0,0.5)_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.4)_2px,rgba(255,255,255,0.4)_3px)]" />

        <div className="relative mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-danger/40 bg-danger/10 px-4 py-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-danger shadow-[0_0_12px_#ff4757]" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-danger">
              В эфире
            </span>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-muted">
            {livePhaseLabel(phase)}
          </span>
        </div>

        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted sm:text-xs">
              Хозяева
            </p>
            <p className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {home}
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <span className="font-mono text-5xl font-bold tabular-nums text-white sm:text-7xl lg:text-8xl">
              {hs}
            </span>
            <span className="font-mono text-2xl font-light text-white/25 sm:text-4xl">:</span>
            <span className="font-mono text-5xl font-bold tabular-nums text-accent sm:text-7xl lg:text-8xl">
              {as}
            </span>
          </div>

          <div className="text-left">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted sm:text-xs">
              Гости
            </p>
            <p className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {away}
            </p>
          </div>
        </div>

        {featured && (
          <p className="relative mt-8 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted/80">
            <Radio className="h-3.5 w-3.5 text-accent" />
            Kickoff Live · обновление в реальном времени
          </p>
        )}
      </div>
    </article>
  );
}
