import { PortalHeader } from "@/components/kickoff/portal-header";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.clubId) redirect("/login");

  const club = await prisma.club.findUnique({
    where: { id: session.clubId },
  });

  return (
    <div className="relative min-h-screen bg-base">
      <div className="pointer-events-none fixed inset-0 grid-pitch opacity-[0.25]" />
      <div className="pointer-events-none fixed inset-0 app-atmosphere" />
      <PortalHeader
        subtitle={club?.name}
        nav={[
          { href: "/club", label: "Кабинет" },
          { href: "/club/guide", label: "Как работает" },
          { href: "/club/roster", label: "Состав сезона" },
          { href: "/club/delegate", label: "Протокол" },
        ]}
      />
      <div className="relative mx-auto max-w-3xl animate-fade-in px-6 py-10">
        {children}
      </div>
    </div>
  );
}
