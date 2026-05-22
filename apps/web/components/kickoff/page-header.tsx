import { cn } from "@/lib/utils";

export function PageHeader({
  label,
  title,
  description,
  children,
  className,
}: {
  label?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "app-page-header relative mb-10 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] via-transparent to-accent/[0.04] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8",
        children ? "flex flex-col gap-6" : "",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="relative min-w-0 flex-1">
        {label && (
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
            {label}
          </p>
        )}
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl md:text-[2.35rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="relative flex shrink-0 flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </header>
  );
}
