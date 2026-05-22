import { PortalNav } from "@/components/kickoff/portal-nav";
import { PortalShell } from "@/components/kickoff/portal-shell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function RefereeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [org, season] = await Promise.all([
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
      portal="referee"
      orgName={org?.name}
      seasonName={season?.name}
    >
      <PortalNav
        subtitle="Судейская служба"
        nav={[{ href: "/referee", label: "Назначения" }]}
      />
      {children}
    </PortalShell>
  );
}
