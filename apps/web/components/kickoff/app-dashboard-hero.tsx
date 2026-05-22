import { Button } from "@/components/kickoff/button";
import {
  Calendar,
  FileBarChart,
  Radio,
  TableProperties,
  Trophy,
} from "lucide-react";
import Link from "next/link";

export function AppDashboardHero({
  orgName,
  seasonName,
  roundLabel,
  liveCount,
}: {
  orgName: string;
  seasonName: string;
  roundLabel?: string;
  liveCount?: number;
}) {
  const quick = [
    { href: "/league/calendar", label: "Календарь", icon: Calendar },
    { href: "/league/standings", label: "Таблица", icon: TableProperties },
    { href: "/league/reports", label: "Отчёты", icon: FileBarChart },
    { href: "/league/cup", label: "Кубок", icon: Trophy },
  ];

  return (
    <div className="app-dashboard-hero mb-10 overflow-hidden rounded-2xl border border-white/[0.08] p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
            {seasonName}
            {roundLabel ? ` · ${roundLabel}` : ""}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Добро пожаловать, {orgName}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Сводка матчденя: матчи сегодня, заявки, протоколы и таблица — всё на
            одном экране.
            {liveCount ? (
              <span className="ml-2 inline-flex items-center gap-1.5 text-danger">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
                {liveCount} live
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quick.map((q) => {
            const Icon = q.icon;
            return (
              <Link key={q.href} href={q.href}>
                <Button size="sm" variant="outline" className="gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  {q.label}
                </Button>
              </Link>
            );
          })}
          <Link href="/live/demo" target="_blank">
            <Button size="sm" className="gap-2">
              <Radio className="h-3.5 w-3.5" />
              Live
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
