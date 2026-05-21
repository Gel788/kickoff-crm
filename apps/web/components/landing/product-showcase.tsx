"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Building2, Users } from "lucide-react";

export function ProductShowcase() {
  const [tab, setTab] = useState<"league" | "club">("league");

  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <div className="text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-accent">
          Интерфейс
        </p>
        <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
          Кабинет под вашу роль
        </h2>
      </div>

      <div className="mt-10 flex justify-center gap-2">
        {(
          [
            { id: "league" as const, label: "Лига", icon: Building2 },
            { id: "club" as const, label: "Клуб", icon: Users },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all",
              tab === t.id
                ? "border-accent/40 bg-accent-dim text-accent shadow-glow"
                : "border-border text-muted hover:border-white/20 hover:text-white",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0e12] shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
          <span className="ml-3 font-mono text-[10px] text-muted">
            kickoff.app/{tab === "league" ? "league/dashboard" : "club"}
          </span>
        </div>

        {tab === "league" ? (
          <div className="grid gap-6 p-8 md:grid-cols-[1fr_300px]">
            <div className="space-y-5">
              <div className="h-10 w-56 rounded-xl bg-white/5" />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["4", "матча сегодня"],
                  ["1", "live"],
                  ["2", "на проверке"],
                  ["8/12", "тур"],
                ].map(([v, l]) => (
                  <div
                    key={l}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <p className="font-mono text-2xl font-bold text-accent">{v}</p>
                    <p className="mt-1 text-[11px] text-muted">{l}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-warning/20 bg-warning/5 p-5">
                <p className="text-xs font-medium text-warning">Требует внимания</p>
                <p className="mt-2 text-sm text-muted">
                  Заявка не подана · DIN — ZEN · 15:00
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
              <p className="font-mono text-[10px] uppercase text-accent">Протокол</p>
              <ul className="mt-4 space-y-3 font-mono text-sm">
                <li className="flex justify-between">
                  <span>67&apos; Гол</span>
                  <span className="text-muted">#10</span>
                </li>
                <li className="flex justify-between text-warning">
                  <span>55&apos; ЖК</span>
                  <span className="text-muted">#7</span>
                </li>
                <li className="flex justify-between">
                  <span>34&apos; Гол</span>
                  <span className="text-muted">#9</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6 p-8">
            <div className="rounded-2xl border border-info/25 bg-gradient-to-br from-info/15 to-transparent p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-info">
                Заявка открыта
              </p>
              <p className="mt-3 font-display text-2xl font-bold">Динамо — Зенит</p>
              <p className="mt-1 text-sm text-muted">Суббота 15:00 · дедлайн через 18ч</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-base">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-info to-accent" />
              </div>
              <p className="mt-2 font-mono text-xs text-muted">18 из 20 в заявке</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["№1 Иванов", "№7 Петров", "№9 Сидоров", "№11 Козлов"].map((n) => (
                <span
                  key={n}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
