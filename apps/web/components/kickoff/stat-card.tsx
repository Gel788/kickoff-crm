import { AnimatedNumber } from "@/components/kickoff/animated-number";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  animate,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  accent?: boolean;
  animate?: boolean;
}) {
  const numeric = typeof value === "number";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-elevated/80 p-6 shadow-card backdrop-blur-sm transition-all duration-200 hover:border-accent/25 hover:shadow-glow",
        accent && "border-accent/30 shadow-glow",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
          accent ? "via-accent/80" : "via-white/10",
        )}
      />
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          {label}
        </span>
        {Icon && (
          <div
            className={cn(
              "rounded-lg p-2",
              accent ? "bg-accent-dim text-accent" : "bg-base text-muted",
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p
        className={cn(
          "font-mono text-4xl font-bold tracking-tight",
          accent && "text-accent",
        )}
      >
        {animate && numeric ? <AnimatedNumber value={value} /> : value}
      </p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}
