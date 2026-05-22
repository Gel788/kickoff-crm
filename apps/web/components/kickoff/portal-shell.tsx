import { AppShell } from "@/components/kickoff/app-shell";
import { AppTopbar } from "@/components/kickoff/app-topbar";
import type { ReactNode } from "react";

/** Оболочка порталов клуб / судья — как лига, без бокового меню. */
export function PortalShell({
  children,
  orgSlug,
  portal,
  wide,
  orgName,
  seasonName,
}: {
  children: ReactNode;
  orgSlug?: string;
  portal: "club" | "referee" | "guardian";
  wide?: boolean;
  orgName?: string;
  seasonName?: string;
}) {
  return (
    <div className="relative min-h-screen bg-base">
      <div className="pointer-events-none fixed inset-0 grid-pitch opacity-[0.35]" />
      <div className="pointer-events-none fixed inset-0 app-atmosphere" />
      <div className="pointer-events-none fixed inset-0 landing-vignette opacity-40" />
      <AppTopbar
        orgSlug={orgSlug}
        portal={portal}
        orgName={orgName}
        seasonName={seasonName}
      />
      <div
        className={`relative mx-auto animate-fade-in px-4 py-8 sm:px-6 sm:py-10 ${
          wide ? "max-w-6xl" : "max-w-4xl"
        }`}
      >
        <AppShell>{children}</AppShell>
      </div>
    </div>
  );
}
