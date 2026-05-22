"use client";

import { Logo } from "@/components/kickoff/logo";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PortalNav({
  subtitle,
  nav,
}: {
  subtitle?: string;
  nav: { href: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <div className="portal-nav-bar mb-8 rounded-2xl border border-white/[0.06] bg-base/40 p-4 sm:p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          {subtitle && (
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
              {subtitle}
            </p>
          )}
        </div>
        <nav className="flex flex-wrap items-center gap-1.5">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-accent-dim text-accent shadow-[inset_0_0_0_1px_rgba(0,230,118,0.25)]"
                    : "text-muted hover:bg-hover/80 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <form action="/api/auth/logout" method="POST" className="ml-1">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2.5 text-sm text-muted transition-colors hover:border-danger/30 hover:bg-danger/10 hover:text-danger"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </form>
        </nav>
      </div>
    </div>
  );
}
