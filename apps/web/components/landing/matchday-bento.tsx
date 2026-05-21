"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Activity,
  ClipboardList,
  FileText,
  Flag,
  Radio,
  Shield,
  TableProperties,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

type Tile = {
  title: string;
  desc: string;
  icon: LucideIcon;
  className: string;
  glow: string;
  href?: string;
  tag?: string;
};

const tiles: Tile[] = [
  {
    title: "Live-протокол",
    desc: "Голы, карточки, замены — счёт и таблица обновляются с поля.",
    icon: Radio,
    className: "md:col-span-2 md:row-span-2 min-h-[280px]",
    glow: "from-danger/20",
    tag: "Судья · PWA",
    href: "/login",
  },
  {
    title: "Заявки",
    desc: "Состав до свистка. Lock — и никаких споров на старте.",
    icon: ClipboardList,
    className: "md:col-span-1",
    glow: "from-info/20",
    tag: "Клуб",
  },
  {
    title: "Допуск",
    desc: "Документы, баны, медицина — видно до матча.",
    icon: Shield,
    className: "md:col-span-1",
    glow: "from-accent/20",
    tag: "Лига",
  },
  {
    title: "Календарь тура",
    desc: "Генерация круга, переносы, назначения судей.",
    icon: Activity,
    className: "md:col-span-1",
    glow: "from-warning/15",
  },
  {
    title: "Таблица",
    desc: "Очки и бомбардиры — из событий, без ручного пересчёта.",
    icon: TableProperties,
    className: "md:col-span-1",
    glow: "from-accent/15",
  },
  {
    title: "PDF протокол",
    desc: "Официальный документ с брендингом лиги — в один клик.",
    icon: FileText,
    className: "md:col-span-2",
    glow: "from-accent/25",
    tag: "Федерация",
  },
];

export function MatchdayBento() {
  return (
    <section id="matchday" className="relative mx-auto max-w-6xl px-6 py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-accent">
          Платформа
        </p>
        <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-6xl">
          Всё, что случается
          <br />
          <span className="bg-gradient-to-r from-white via-white to-muted bg-clip-text text-transparent">
            в день матча
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          Лига, клубы, судьи и болельщики смотрят на один и тот же матч — в реальном времени.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-4 md:auto-rows-[140px]">
        {tiles.map((t) => {
          const Icon = t.icon;
          const inner = (
            <div
              className={cn(
                "group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.06] bg-elevated/80 p-6 transition-all duration-500",
                "hover:-translate-y-1 hover:border-accent/25 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]",
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100",
                  t.glow,
                )}
              />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  {t.tag && (
                    <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                      {t.tag}
                    </span>
                  )}
                </div>
                <h3 className="mt-5 font-display text-xl font-bold md:text-2xl">
                  {t.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
                  {t.desc}
                </p>
              </div>
              <div className="relative mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-accent opacity-0 transition-opacity group-hover:opacity-100">
                <Zap className="h-3 w-3" />
                В системе
              </div>
            </div>
          );
          const wrap = (node: ReactNode) =>
            t.href ? (
              <Link key={t.title} href={t.href} className={cn("block h-full", t.className)}>
                {node}
              </Link>
            ) : (
              <div key={t.title} className={t.className}>
                {node}
              </div>
            );

          return wrap(inner);
        })}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
        <span className="inline-flex items-center gap-2">
          <Flag className="h-4 w-4 text-warning" /> Судейская служба
        </span>
        <span className="h-1 w-1 rounded-full bg-border" />
        <span className="inline-flex items-center gap-2">
          <Shield className="h-4 w-4 text-accent" /> Реестр сезона
        </span>
        <span className="h-1 w-1 rounded-full bg-border" />
        <Link href="/live/demo" className="inline-flex items-center gap-2 text-accent hover:underline">
          <Radio className="h-4 w-4" /> Live-табло demo →
        </Link>
      </div>
    </section>
  );
}
