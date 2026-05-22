"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavGroup = {
  id: string;
  label: string;
  match: (path: string) => boolean;
  items: { href: string; label: string }[];
};

const GROUPS: NavGroup[] = [
  {
    id: "matchday",
    label: "Матчдень",
    match: (p) =>
      p.startsWith("/league/dashboard") ||
      p.startsWith("/league/calendar") ||
      p.startsWith("/league/notifications") ||
      p.startsWith("/league/fixtures"),
    items: [
      { href: "/league/dashboard", label: "Дашборд" },
      { href: "/league/calendar", label: "Календарь" },
      { href: "/league/notifications", label: "Inbox" },
    ],
  },
  {
    id: "competition",
    label: "Турнир",
    match: (p) =>
      [
        "/league/standings",
        "/league/leaderboard",
        "/league/cup",
        "/league/compare",
        "/league/tools",
        "/league/competitions",
        "/league/seasons",
        "/league/regulations",
      ].some((x) => p.startsWith(x)),
    items: [
      { href: "/league/standings", label: "Таблица" },
      { href: "/league/leaderboard", label: "Лидерборд" },
      { href: "/league/cup", label: "Кубок" },
      { href: "/league/compare", label: "Очные" },
      { href: "/league/tools", label: "Инструменты" },
    ],
  },
  {
    id: "registry",
    label: "Реестр",
    match: (p) =>
      p.startsWith("/league/clubs") ||
      p.startsWith("/league/players") ||
      p.startsWith("/league/referees") ||
      p.startsWith("/league/disciplinary"),
    items: [
      { href: "/league/clubs", label: "Клубы" },
      { href: "/league/players", label: "Игроки" },
      { href: "/league/referees", label: "Судьи" },
      { href: "/league/disciplinary", label: "Дисциплина" },
    ],
  },
  {
    id: "admin",
    label: "Админ",
    match: (p) =>
      p.startsWith("/league/reports") ||
      p.startsWith("/league/users") ||
      p.startsWith("/league/settings") ||
      p.startsWith("/league/guide"),
    items: [
      { href: "/league/reports", label: "Отчёты" },
      { href: "/league/users", label: "Команда" },
      { href: "/league/settings", label: "Настройки" },
      { href: "/league/guide", label: "Гайд" },
    ],
  },
];

export function AppQuickNav() {
  const pathname = usePathname();
  if (pathname === "/league/dashboard") return null;
  const group = GROUPS.find((g) => g.match(pathname));
  if (!group) return null;

  return (
    <nav
      aria-label="Быстрая навигация раздела"
      className="app-quick-nav mb-8 flex flex-wrap items-center gap-2"
    >
      <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-muted">
        {group.label}
      </span>
      {group.items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
              active
                ? "border-accent/40 bg-accent-dim text-accent"
                : "border-border/70 bg-base/40 text-muted hover:border-accent/25 hover:text-white",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
