import { Badge, MatchStatus } from "@/components/kickoff/badge";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function MatchCard({
  home,
  away,
  score,
  time,
  venue,
  status,
  href = "#",
}: {
  home: string;
  away: string;
  score?: string;
  time: string;
  venue?: string;
  status: MatchStatus;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-2xl border border-border/80 bg-elevated/90 p-6 shadow-card backdrop-blur-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-glow",
        status === "live" && "border-danger/40 ring-1 ring-danger/20",
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <Badge status={status} />
        <span className="font-mono text-xs text-muted">{time}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold">{home}</p>
          <p className="truncate font-display text-lg font-semibold text-muted">
            {away}
          </p>
        </div>
        {score ? (
          <p className="font-mono text-3xl font-bold text-accent">{score}</p>
        ) : (
          <span className="font-mono text-sm text-muted">— : —</span>
        )}
        <ChevronRight className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
      </div>
      {venue && <p className="mt-3 text-xs text-muted">{venue}</p>}
    </Link>
  );
}
