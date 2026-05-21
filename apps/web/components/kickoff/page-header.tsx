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
        "mb-10 flex flex-col gap-4 border-b border-border/50 pb-8 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        {label && (
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
            {label}
          </p>
        )}
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-base text-muted">{description}</p>
        )}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}
