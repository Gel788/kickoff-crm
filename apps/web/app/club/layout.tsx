import { PortalNav } from "@/components/kickoff/portal-nav";
import { PortalShell } from "@/components/kickoff/portal-shell";
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

  const [club, org, season] = await Promise.all([
    prisma.club.findUnique({ where: { id: session.clubId } }),
    prisma.organization.findUnique({
      where: { id: session.organizationId },
      select: { slug: true, name: true },
    }),
    prisma.season.findFirst({
      where: { organizationId: session.organizationId, isActive: true },
      select: { name: true },
    }),
  ]);

  return (
    <PortalShell
      orgSlug={org?.slug}
      portal="club"
      wide
      orgName={club?.name}
      seasonName={season?.name}
    >
      <PortalNav
        subtitle={club?.name}
        nav={[
          { href: "/club", label: "Кабинет" },
          { href: "/club/guide", label: "Как работает" },
          { href: "/club/roster", label: "Состав сезона" },
          { href: "/club/delegate", label: "Протокол" },
        ]}
      />
      {children}
    </PortalShell>
  );
}
