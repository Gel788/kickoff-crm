import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/80 bg-elevated/90 p-6 shadow-card backdrop-blur-sm transition-all duration-200 hover:border-accent/20",
        accent && "border-accent/35 shadow-glow",
      )}
    >
      {accent && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
      )}
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
        {value}
      </p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}
