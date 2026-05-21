"use client";

import { Logo } from "@/components/kickoff/logo";
import { cn } from "@/lib/utils";
import {
  Bell,
  Calendar,
  CalendarRange,
  FileBarChart,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Scale,
  Flag,
  ScrollText,
  Settings,
  Shield,
  TableProperties,
  Trophy,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; icon: LucideIcon };

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Старт",
    items: [
      { href: "/league/guide", label: "Как работает", icon: HelpCircle },
    ],
  },
  {
    title: "Матчдень",
    items: [
      { href: "/league/dashboard", label: "Дашборд", icon: LayoutDashboard },
      { href: "/league/calendar", label: "Календарь", icon: Calendar },
      { href: "/league/notifications", label: "Уведомления", icon: Bell },
    ],
  },
  {
    title: "Соревнование",
    items: [
      { href: "/league/standings", label: "Таблица", icon: TableProperties },
      { href: "/league/competitions", label: "Турниры", icon: Trophy },
      { href: "/league/seasons", label: "Сезоны", icon: CalendarRange },
      { href: "/league/regulations", label: "Регламент", icon: ScrollText },
    ],
  },
  {
    title: "Реестр",
    items: [
      { href: "/league/clubs", label: "Клубы", icon: Shield },
      { href: "/league/players", label: "Игроки", icon: Users },
      { href: "/league/referees", label: "Судьи", icon: Flag },
      { href: "/league/disciplinary", label: "Дисциплина", icon: Scale },
    ],
  },
  {
    title: "Админ",
    items: [
      { href: "/league/reports", label: "Отчёты", icon: FileBarChart },
      { href: "/league/users", label: "Команда", icon: UserCog },
      { href: "/league/settings", label: "Настройки", icon: Settings },
    ],
  },
];

const footerLink = { href: "/settings/account", label: "Аккаунт · 2FA", icon: UserCog };

export function Sidebar({
  orgName,
  seasonName,
  userName,
  userEmail,
}: {
  orgName: string;
  seasonName: string;
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-border/80 bg-elevated/95 backdrop-blur-xl">
      <div className="border-b border-border/60 px-5 py-6">
        <Logo />
        <div className="mt-4 rounded-xl border border-border/60 bg-base/50 px-3 py-2.5">
          <p className="truncate font-display text-sm font-semibold">{orgName}</p>
          <p className="truncate font-mono text-[10px] uppercase tracking-widest text-accent">
            {seasonName}
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted/70">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-accent-dim text-accent shadow-[inset_0_0_0_1px_rgba(0,230,118,0.2)]"
                        : "text-muted hover:bg-hover/80 hover:text-white",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-accent shadow-[0_0_12px_rgba(0,230,118,0.6)]" />
                    )}
                    <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-accent")} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-border/60 p-4">
        <Link
          href={footerLink.href}
          className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:bg-hover hover:text-white"
        >
          <UserCog className="h-4 w-4" />
          {footerLink.label}
        </Link>
        <div className="mb-3 rounded-xl border border-border/50 bg-base/40 px-3 py-3">
          <p className="text-xs font-medium text-white">{userName}</p>
          <p className="truncate text-[11px] text-muted">{userEmail}</p>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 px-3 py-2.5 text-sm text-muted transition-colors hover:border-border hover:bg-hover hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </form>
      </div>
    </aside>
  );
}
