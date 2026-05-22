import { liveStatusLabel, parseLiveScore } from "@/lib/live-labels";
import { cn } from "@/lib/utils";

export function LiveTodayRow({
  home,
  away,
  time,
  status,
  score,
}: {
  home: string;
  away: string;
  time: string;
  status: string;
  score: string | null;
}) {
  const isLive = status === "LIVE";
  const isClosed = status === "CLOSED";
  const parsed = score ? parseLiveScore(score) : null;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border px-5 py-4 transition-colors",
        isLive
          ? "border-danger/35 bg-danger/5"
          : isClosed
            ? "border-border/60 bg-elevated/50"
            : "border-border/80 bg-elevated/30",
      )}
    >
      <div className="w-14 shrink-0 text-center">
        <p className="font-mono text-sm font-semibold text-white">
          {new Date(time).toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg font-semibold">
          <span className="text-white">{home}</span>
          <span className="mx-2 text-muted/60">—</span>
          <span className="text-white/90">{away}</span>
        </p>
        <p
          className={cn(
            "mt-1 font-mono text-[10px] uppercase tracking-wider",
            isLive ? "text-danger" : "text-muted",
          )}
        >
          {liveStatusLabel(status)}
        </p>
      </div>

      {parsed ? (
        <div className="flex shrink-0 items-center gap-2 font-mono text-2xl font-bold tabular-nums">
          <span className={isLive ? "text-white" : "text-muted"}>{parsed.home}</span>
          <span className="text-white/20">:</span>
          <span className={isLive ? "text-accent" : "text-accent/80"}>{parsed.away}</span>
        </div>
      ) : (
        <span className="shrink-0 font-mono text-sm text-muted">— : —</span>
      )}
    </div>
  );
}
