import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function AppSection({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  accent,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  accent?: "default" | "danger" | "muted";
}) {
  const titleClass =
    accent === "danger"
      ? "text-danger"
      : accent === "muted"
        ? "text-muted"
        : "text-white";

  return (
    <section className={cn("mb-10", className)}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
              <Icon className="h-5 w-5 text-accent" />
            </div>
          )}
          <div>
            <h2 className={cn("font-display text-lg font-bold sm:text-xl", titleClass)}>
              {title}
            </h2>
            {description && (
              <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
