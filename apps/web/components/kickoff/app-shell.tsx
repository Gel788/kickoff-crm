import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Стеклянная панель контента кабинета — единый стиль с лендингом. */
export function AppShell({
  children,
  className,
  flush,
}: {
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <div
      className={cn(
        "app-main-shell relative overflow-hidden",
        !flush && "rounded-[1.5rem] border border-white/[0.07] p-6 sm:p-8 md:p-10",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-accent/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-info/[0.03] blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  );
}
