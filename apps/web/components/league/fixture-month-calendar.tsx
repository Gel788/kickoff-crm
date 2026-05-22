"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CalendarFixtureItem = {
  id: string;
  scheduledAt: string;
  homeShort: string;
  awayShort: string;
  status: string;
};

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function FixtureMonthCalendar({
  fixtures,
}: {
  fixtures: CalendarFixtureItem[];
}) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarFixtureItem[]>();
    for (const f of fixtures) {
      const d = new Date(f.scheduledAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const list = map.get(key) ?? [];
      list.push(f);
      map.set(key, list);
    }
    return map;
  }, [fixtures]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = cursor.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-elevated p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor(addMonths(cursor, -1))}
          className="rounded-lg border border-border p-2 hover:bg-base"
          aria-label="Предыдущий месяц"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="font-display text-lg font-bold capitalize">{monthLabel}</h3>
        <button
          type="button"
          onClick={() => setCursor(addMonths(cursor, 1))}
          className="rounded-lg border border-border p-2 hover:bg-base"
          aria-label="Следующий месяц"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 font-medium">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="min-h-[72px] rounded-lg bg-base/40" />;
          }
          const key = `${year}-${month}-${day}`;
          const dayFixtures = byDay.get(key) ?? [];
          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

          return (
            <div
              key={key}
              className={`min-h-[72px] rounded-lg border p-1 text-left ${
                isToday ? "border-accent/50 bg-accent-dim/20" : "border-border/50 bg-base"
              }`}
            >
              <span className="text-xs font-mono text-muted">{day}</span>
              <div className="mt-1 space-y-0.5">
                {dayFixtures.slice(0, 2).map((f) => (
                  <Link
                    key={f.id}
                    href={`/league/fixtures/${f.id}`}
                    className="block truncate rounded px-0.5 text-[10px] leading-tight hover:bg-elevated"
                    title={`${f.homeShort} — ${f.awayShort}`}
                  >
                    <span className="font-medium">{f.homeShort}</span>
                    <span className="text-muted">–{f.awayShort}</span>
                  </Link>
                ))}
                {dayFixtures.length > 2 && (
                  <span className="text-[10px] text-muted">+{dayFixtures.length - 2}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
