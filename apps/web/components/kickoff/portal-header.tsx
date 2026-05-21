"use client";

import { Logo } from "@/components/kickoff/logo";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PortalHeader({
  subtitle,
  nav,
}: {
  subtitle?: string;
  nav: { href: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-elevated/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
        <div>
          <Logo />
          {subtitle && (
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
              {subtitle}
            </p>
          )}
        </div>
        <nav className="hidden items-center gap-1 sm:flex">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent-dim text-accent"
                    : "text-muted hover:bg-hover hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-hover hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Выйти</span>
          </button>
        </form>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-border/50 px-4 py-2 sm:hidden">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium",
                active ? "bg-accent-dim text-accent" : "text-muted",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
