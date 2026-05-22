import { Logo } from "@/components/kickoff/logo";
import type { ReactNode } from "react";

export function AuthPageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="login-page relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-base px-6 py-16">
      <div className="pointer-events-none fixed inset-0 grid-pitch opacity-45" />
      <div className="pointer-events-none fixed inset-0 landing-aurora" />
      <div className="pointer-events-none fixed inset-0 landing-vignette" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="auth-card relative">
          <div className="pointer-events-none absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-accent/25 via-transparent to-info/15 opacity-70" />
          <div className="relative rounded-[1.3rem] border border-white/[0.08] bg-[#0c1014]/95 p-8 shadow-2xl backdrop-blur-2xl sm:p-10">
            <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
