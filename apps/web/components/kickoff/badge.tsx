import { cn } from "@/lib/utils";

export type MatchStatus =
  | "scheduled"
  | "squads_open"
  | "live"
  | "review"
  | "closed";

const config: Record<
  MatchStatus,
  { label: string; className: string; dot?: boolean }
> = {
  scheduled: { label: "Запланирован", className: "bg-border/80 text-muted" },
  squads_open: {
    label: "Заявки открыты",
    className: "bg-info/15 text-info border border-info/30",
  },
  live: {
    label: "LIVE",
    className: "bg-danger/15 text-danger border border-danger/40",
    dot: true,
  },
  review: {
    label: "На проверке",
    className: "bg-warning/15 text-warning border border-warning/30",
  },
  closed: {
    label: "Закрыт",
    className: "bg-accent-dim text-accent border border-accent/30",
  },
};

export function Badge({
  status,
  className,
}: {
  status: MatchStatus;
  className?: string;
}) {
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider",
        c.className,
        className,
      )}
    >
      {c.dot && (
        <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-danger" />
      )}
      {c.label}
    </span>
  );
}
