import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function PortalWelcomeStrip({
  label,
  title,
  description,
  icon: Icon,
  children,
}: {
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children?: ReactNode;
}) {
  return (
    <div className="app-dashboard-hero mb-8 overflow-hidden rounded-2xl border border-white/[0.08] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10">
            <Icon className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
              {label}
            </p>
            <h2 className="mt-1 font-display text-xl font-bold sm:text-2xl">{title}</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">{description}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
