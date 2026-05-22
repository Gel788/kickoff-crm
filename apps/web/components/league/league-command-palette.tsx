"use client";

import Fuse from "fuse.js";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";

type PaletteItem = {
  id: string;
  label: string;
  hint?: string;
  href: string;
  group: string;
};

const ROUTES: PaletteItem[] = [
  { id: "dash", label: "Дашборд", href: "/league/dashboard", group: "Навигация" },
  { id: "cal", label: "Календарь", href: "/league/calendar", group: "Навигация" },
  { id: "calfc", label: "Календарь (drag)", href: "/league/calendar?view=fc", group: "Навигация" },
  { id: "stand", label: "Таблица", href: "/league/standings", group: "Навигация" },
  { id: "lead", label: "Лидерборд", href: "/league/leaderboard", group: "Навигация" },
  { id: "cup", label: "Кубок", href: "/league/cup", group: "Навигация" },
  { id: "cmp", label: "Сравнение клубов", href: "/league/compare", group: "Навигация" },
  { id: "tools", label: "Инструменты", href: "/league/tools", group: "Навигация" },
  { id: "play", label: "Игроки", href: "/league/players", group: "Навигация" },
  { id: "club", label: "Клубы", href: "/league/clubs", group: "Навигация" },
  { id: "rep", label: "Отчёты", href: "/league/reports", group: "Навигация" },
  { id: "ref", label: "Судьи", href: "/league/referees", group: "Навигация" },
  { id: "disc", label: "Дисциплина", href: "/league/disciplinary", group: "Навигация" },
];

export function LeagueCommandPalette({
  clubs,
}: {
  clubs: { id: string; name: string; shortName: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const clubItems: PaletteItem[] = clubs.map((c) => ({
      id: `club-${c.id}`,
      label: c.name,
      hint: c.shortName,
      href: `/league/clubs/${c.id}`,
      group: "Клубы",
    }));
    return [...ROUTES, ...clubItems];
  }, [clubs]);

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ["label", "hint", "group"],
        threshold: 0.35,
      }),
    [items],
  );

  const results = q.trim()
    ? fuse.search(q.trim(), { limit: 16 }).map((r) => r.item)
    : items.slice(0, 14);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQ("");
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <Command
        shouldFilter={false}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-elevated shadow-2xl"
        onClick={(e: MouseEvent) => e.stopPropagation()}
        label="Быстрый поиск"
      >
        <Command.Input
          value={q}
          onValueChange={setQ}
          placeholder="Страница или клуб…"
          className="w-full border-b border-border bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-muted"
        />
        <Command.List className="max-h-72 overflow-y-auto py-1">
          {results.length === 0 ? (
            <Command.Empty className="px-4 py-6 text-center text-sm text-muted">
              Ничего не найдено
            </Command.Empty>
          ) : (
            results.map((item) => (
              <Command.Item
                key={item.id}
                value={item.id}
                onSelect={() => go(item.href)}
                className="flex cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-sm aria-selected:bg-hover"
              >
                <span>
                  <span className="font-medium">{item.label}</span>
                  {item.hint && (
                    <span className="ml-2 font-mono text-xs text-muted">
                      {item.hint}
                    </span>
                  )}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted">
                  {item.group}
                </span>
              </Command.Item>
            ))
          )}
        </Command.List>
        <p className="border-t border-border px-4 py-2 font-mono text-[10px] text-muted">
          ⌘K · cmdk + fuse.js
        </p>
      </Command>
    </div>
  );
}
