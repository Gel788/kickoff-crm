import { AppQuickNav } from "@/components/kickoff/app-quick-nav";
import { QueryProvider } from "@/components/kickoff/query-provider";
import { LeagueCommandPalette } from "@/components/league/league-command-palette";
import { LeagueKeyboardShortcuts } from "@/components/league/league-keyboard-shortcuts";
import { AppShell } from "@/components/kickoff/app-shell";
import { AppTopbar } from "@/components/kickoff/app-topbar";
import { Sidebar } from "@/components/kickoff/sidebar";
import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/queries";
import { runMatchdayScheduler } from "@/lib/scheduler";
import { redirect } from "next/navigation";

export default async function LeagueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getOrgContext();
  if (!ctx?.session) redirect("/login");

  if (ctx.season?.id) {
    await runMatchdayScheduler(ctx.season.id);
  }

  const clubs =
    ctx.season?.id
      ? await prisma.club.findMany({
          where: { seasonClubs: { some: { seasonId: ctx.season.id } } },
          select: { id: true, name: true, shortName: true },
          orderBy: { name: "asc" },
        })
      : [];

  return (
    <div className="relative min-h-screen bg-base">
      <div className="pointer-events-none fixed inset-0 grid-pitch opacity-[0.4]" />
      <div className="pointer-events-none fixed inset-0 app-atmosphere" />
      <div className="pointer-events-none fixed inset-0 landing-vignette opacity-30" />
      <Sidebar
        orgName={ctx.org?.name ?? "Лига"}
        seasonName={ctx.season?.name ?? "Сезон"}
        orgSlug={ctx.org?.slug}
        userName={ctx.session.name}
        userEmail={ctx.session.email}
      />
      <div className="relative min-h-screen pl-[272px]">
        <AppTopbar
          orgSlug={ctx.org?.slug}
          portal="league"
          orgName={ctx.org?.name}
          seasonName={ctx.season?.name}
        />
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <AppShell>
            <QueryProvider>
              <div className="animate-fade-in">
                <AppQuickNav />
                {children}
              </div>
            </QueryProvider>
          </AppShell>
        </div>
      </div>
      <LeagueKeyboardShortcuts />
      <LeagueCommandPalette clubs={clubs} />
    </div>
  );
}
