"use client";

import { LiveBroadcastCard } from "@/components/live/live-broadcast-card";
import { LiveTodayRow } from "@/components/live/live-today-row";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type LiveData = {
  organization: string;
  live: { id: string; home: string; away: string; score: string; phase: string }[];
  today: {
    id: string;
    home: string;
    away: string;
    status: string;
    score: string | null;
    time: string;
  }[];
};

function LiveSkeleton() {
  return (
    <div className="min-h-screen bg-base">
      <div className="pointer-events-none fixed inset-0 grid-pitch opacity-40" />
      <div className="pointer-events-none fixed inset-0 landing-aurora opacity-60" />
      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/5" />
        <div className="mt-4 h-12 w-72 animate-pulse rounded-xl bg-white/5" />
        <div className="mt-12 h-64 animate-pulse rounded-[1.75rem] bg-white/5" />
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}

async function fetchLive(slug: string): Promise<LiveData> {
  const res = await fetch(`/api/v1/${slug}/live`);
  if (!res.ok) throw new Error("live fetch failed");
  return res.json();
}

export default function LiveBoardPage({ params }: { params: { slug: string } }) {
  const [mode, setMode] = useState<"sse" | "poll">("sse");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["live", params.slug],
    queryFn: () => fetchLive(params.slug),
    refetchInterval: mode === "poll" ? 5000 : 8000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const es = new EventSource(`/api/v1/${params.slug}/live/stream`);
    es.onmessage = () => {
      void refetch();
    };
    es.onerror = () => {
      es.close();
      setMode("poll");
    };
    return () => es.close();
  }, [params.slug, refetch]);

  if (isLoading && !data) return <LiveSkeleton />;
  if (!data) return <LiveSkeleton />;

  const todaySorted = [...data.today].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-base">
      <div className="pointer-events-none fixed inset-0 grid-pitch opacity-50" />
      <div className="pointer-events-none fixed inset-0 landing-aurora opacity-70" />
      <div className="pointer-events-none fixed inset-0 landing-vignette" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <Link
              href="/"
              className="font-display text-sm font-bold tracking-tight text-muted hover:text-white"
            >
              KICK<span className="text-accent">OFF</span>
            </Link>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.35em] text-accent">
              Live-табло
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
              {data.organization}
            </h1>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider ${
                mode === "sse"
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-warning/30 bg-warning/10 text-warning"
              }`}
            >
              {mode === "sse" ? (
                <Wifi className="h-3.5 w-3.5" />
              ) : (
                <WifiOff className="h-3.5 w-3.5" />
              )}
              {mode === "sse" ? "SSE + react-query" : "Poll · 5с"}
            </div>
            <Link
              href={`/o/${params.slug}`}
              className="text-sm text-muted transition-colors hover:text-accent"
            >
              Страница лиги →
            </Link>
          </div>
        </header>

        {data.live.length > 0 ? (
          <section className="mb-14 space-y-6">
            {data.live.map((m, i) => (
              <LiveBroadcastCard
                key={m.id}
                home={m.home}
                away={m.away}
                score={m.score}
                phase={m.phase}
                featured={i === 0 && data.live.length === 1}
              />
            ))}
          </section>
        ) : (
          <section className="mb-14 rounded-2xl border border-dashed border-white/10 bg-elevated/40 px-8 py-16 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Сейчас нет live-матчей
            </p>
            <p className="mt-3 text-sm text-muted">
              Когда судья откроет протокол, счёт появится здесь автоматически
            </p>
          </section>
        )}

        <section>
          <div className="mb-6 flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-accent" />
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              Расписание на сегодня
            </h2>
            <span className="rounded-full border border-border bg-elevated px-2.5 py-0.5 font-mono text-xs text-muted">
              {todaySorted.length}
            </span>
          </div>

          {todaySorted.length === 0 ? (
            <p className="rounded-2xl border border-border/60 bg-elevated/30 px-6 py-10 text-center text-sm text-muted">
              На сегодня матчей нет
            </p>
          ) : (
            <div className="space-y-3">
              {todaySorted.map((m) => (
                <LiveTodayRow
                  key={m.id}
                  home={m.home}
                  away={m.away}
                  time={m.time}
                  status={m.status}
                  score={m.score}
                />
              ))}
            </div>
          )}
        </section>

        <footer className="mt-16 border-t border-white/5 pt-8 text-center font-mono text-[10px] uppercase tracking-widest text-muted/60">
          Для экрана на стадионе · полноэкранный режим F11
        </footer>
      </div>
    </div>
  );
}
