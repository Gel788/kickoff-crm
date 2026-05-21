import { Sidebar } from "@/components/kickoff/sidebar";
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

  return (
    <div className="relative min-h-screen bg-base">
      <div className="pointer-events-none fixed inset-0 grid-pitch opacity-[0.35]" />
      <div className="pointer-events-none fixed inset-0 app-atmosphere" />
      <Sidebar
        orgName={ctx.org?.name ?? "Лига"}
        seasonName={ctx.season?.name ?? "Сезон"}
        userName={ctx.session.name}
        userEmail={ctx.session.email}
      />
      <div className="relative pl-[272px]">
        <div className="mx-auto max-w-7xl animate-fade-in px-8 py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
