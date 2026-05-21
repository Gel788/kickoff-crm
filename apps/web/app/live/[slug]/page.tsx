"use client";

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

export default function LiveBoardPage({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<LiveData | null>(null);
  const [mode, setMode] = useState<"sse" | "poll">("sse");

  useEffect(() => {
    let es: EventSource | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    async function loadPoll() {
      const res = await fetch(`/api/v1/${params.slug}/live`);
      if (res.ok) setData(await res.json());
    }

    function startSse() {
      es = new EventSource(`/api/v1/${params.slug}/live/stream`);
      es.onmessage = (ev) => {
        try {
          const parsed = JSON.parse(ev.data);
          setData((prev) =>
            prev
              ? { ...prev, live: parsed.live }
              : {
                  organization: params.slug,
                  live: parsed.live,
                  today: [],
                },
          );
          loadPoll();
        } catch {
          /* ignore */
        }
      };
      es.onerror = () => {
        es?.close();
        setMode("poll");
      };
    }

    loadPoll();
    if (mode === "sse") startSse();
    else pollTimer = setInterval(loadPoll, 5000);

    return () => {
      es?.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [params.slug, mode]);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base text-muted">
        Загрузка…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base p-6">
      <header className="mb-8 border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Live {mode === "sse" ? "· SSE" : "· polling"}
        </p>
        <h1 className="font-display text-3xl font-bold">{data.organization}</h1>
      </header>

      {data.live.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-xl text-danger">Сейчас в эфире</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {data.live.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl border border-danger/40 bg-elevated p-6 shadow-glow"
              >
                <p className="text-sm text-muted">{m.phase}</p>
                <p className="mt-2 font-display text-2xl font-bold">
                  {m.home} <span className="text-muted">—</span> {m.away}
                </p>
                <p className="mt-4 font-mono text-5xl text-accent">{m.score}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-xl">Сегодня</h2>
        <div className="space-y-2">
          {data.today.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-xl border border-border bg-elevated px-5 py-4"
            >
              <div>
                <p className="font-medium">
                  {m.home} — {m.away}
                </p>
                <p className="text-xs text-muted">
                  {new Date(m.time).toLocaleTimeString("ru-RU")} · {m.status}
                </p>
              </div>
              {m.score && (
                <p className="font-mono text-2xl text-accent">{m.score}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
