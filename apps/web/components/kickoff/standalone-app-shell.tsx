import { AppShell } from "@/components/kickoff/app-shell";
import { AppTopbar } from "@/components/kickoff/app-topbar";
import type { ReactNode } from "react";

/** Оболочка для platform / settings без бокового меню лиги. */
export function StandaloneAppShell({
  children,
  portal = "league",
  title,
}: {
  children: ReactNode;
  portal?: "league" | "club" | "referee" | "guardian";
  title?: string;
}) {
  return (
    <div className="relative min-h-screen bg-base">
      <div className="pointer-events-none fixed inset-0 grid-pitch opacity-[0.35]" />
      <div className="pointer-events-none fixed inset-0 app-atmosphere" />
      <div className="pointer-events-none fixed inset-0 landing-vignette opacity-35" />
      <AppTopbar portal={portal} orgName={title} />
      <div className="relative mx-auto max-w-5xl animate-fade-in px-4 py-8 sm:px-6 sm:py-10">
        <AppShell>{children}</AppShell>
      </div>
    </div>
  );
}
