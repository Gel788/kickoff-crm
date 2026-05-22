import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export function Card({
  children,
  className,
  hover,
  padding = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
}) {
  return (
    <div
      className={cn(
        "app-list-card relative overflow-hidden",
        hover ? "kickoff-card-hover" : "kickoff-card",
        padding && "p-6",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function FormCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("space-y-4", className)}>
      <div>
        <h3 className="font-display text-lg font-bold">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      {children}
    </Card>
  );
}

export function SectionTitle({
  children,
  action,
  className,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-5 flex items-center justify-between gap-4",
        className,
      )}
    >
      <h2 className="kickoff-section-title">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card className="flex flex-col items-center justify-center border-dashed border-white/10 py-20 text-center">
      {Icon && (
        <div className="mb-5 rounded-2xl border border-accent/20 bg-accent-dim p-5 shadow-glow">
          <Icon className="h-9 w-9 text-accent" />
        </div>
      )}
      <p className="font-display text-xl font-bold">{title}</p>
      {description && (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          {description}
        </p>
      )}
    </Card>
  );
}

export function FilterBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("kickoff-filter-bar", className)}>{children}</div>;
}

export function DataTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("kickoff-table-wrap", className)}>
      <table className="kickoff-table">{children}</table>
    </div>
  );
}

export function AlertPanel({
  variant = "warning",
  title,
  children,
  icon: Icon,
}: {
  variant?: "warning" | "danger" | "info";
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
}) {
  const styles = {
    warning: "kickoff-alert-warning text-warning",
    danger: "kickoff-alert-danger text-danger",
    info: "kickoff-alert-info text-info",
  };
  return (
    <div className={styles[variant]}>
      <div className="flex items-start gap-3">
        {Icon && <Icon className="mt-0.5 h-5 w-5 shrink-0" />}
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-semibold">{title}</h3>
          <div className="mt-3 space-y-2 text-sm text-muted">{children}</div>
        </div>
      </div>
    </div>
  );
}

export const inputClass = "kickoff-input";
export const selectClass = "kickoff-select";
export const labelClass = "kickoff-label";
