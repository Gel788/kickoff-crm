import { format } from "@/lib/format";
import { ExternalLink, Keyboard, Radio } from "lucide-react";
import Link from "next/link";

const PORTAL_LABELS = {
  league: "Кабинет лиги",
  club: "Кабинет клуба",
  referee: "Судейская служба",
  guardian: "Опекун",
} as const;

export function AppTopbar({
  orgSlug,
  portal = "league",
  orgName,
  seasonName,
}: {
  orgSlug?: string;
  portal?: keyof typeof PORTAL_LABELS;
  orgName?: string;
  seasonName?: string;
}) {
  const liveHref = orgSlug ? `/live/${orgSlug}` : "/live/demo";
  const publicHref = orgSlug ? `/o/${orgSlug}` : "/o/demo";
  const now = new Date();

  return (
    <div className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0a0e12]/85 backdrop-blur-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5">
        <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            {PORTAL_LABELS[portal]}
          </p>
          {(orgName || seasonName) && (
            <div className="hidden h-4 w-px bg-border sm:block" />
          )}
          {orgName && (
            <p className="truncate font-display text-sm font-semibold text-white/90">
              {orgName}
            </p>
          )}
          {seasonName && (
            <span className="hidden rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] text-accent lg:inline">
              {seasonName}
            </span>
          )}
          <span className="hidden font-mono text-[10px] text-muted/80 xl:inline">
            {format.shortDate(now)} · {format.time(now)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={liveHref}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/20"
          >
            <Radio className="h-3.5 w-3.5" />
            Live-табло
          </Link>
          <Link
            href={publicHref}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-elevated/80 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/25 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Сайт лиги
          </Link>
          {portal === "league" && (
            <span className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-base/50 px-3 py-1.5 font-mono text-[10px] text-muted sm:inline-flex">
              <Keyboard className="h-3 w-3" />
              ⌘K поиск
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
