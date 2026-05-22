import { Button } from "@/components/kickoff/button";
import { AppSection } from "@/components/kickoff/app-section";
import { PageHeader } from "@/components/kickoff/page-header";
import { PortalNav } from "@/components/kickoff/portal-nav";
import { PortalShell } from "@/components/kickoff/portal-shell";
import { PortalWelcomeStrip } from "@/components/kickoff/portal-welcome-strip";
import { Card, EmptyState } from "@/components/kickoff/ui";
import { Heart } from "lucide-react";
import { recordGuardianConsent } from "@/lib/actions-guardian";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { format } from "@/lib/format";
import { Users } from "lucide-react";
import { redirect } from "next/navigation";

export default async function GuardianPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const links = await prisma.guardianLink.findMany({
    where: { userId: session.userId, revokedAt: null },
    include: {
      player: {
        include: {
          registrations: {
            include: { club: true, season: true },
          },
          documents: true,
        },
      },
    },
  });

  const clubIds = Array.from(
    new Set(links.flatMap((l) => l.player.registrations.map((r) => r.clubId))),
  );

  const upcomingFixtures =
    clubIds.length > 0
      ? await prisma.fixture.findMany({
          where: {
            scheduledAt: { gte: new Date() },
            OR: [
              { homeClubId: { in: clubIds } },
              { awayClubId: { in: clubIds } },
            ],
          },
          include: { homeClub: true, awayClub: true },
          orderBy: { scheduledAt: "asc" },
          take: 10,
        })
      : [];

  const consentStaleMs = 365 * 24 * 60 * 60 * 1000;

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
      portal="guardian"
      orgName={org?.name}
      seasonName={season?.name}
    >
      <PortalNav subtitle="Опекун" nav={[{ href: "/guardian", label: "Мои дети" }]} />

      <PortalWelcomeStrip
        label="Опекун"
        title="Мои дети"
        description="Согласие на участие несовершеннолетних и ближайшие матчи клуба."
        icon={Heart}
      />

      <PageHeader
        label="Реестр"
        title="Привязанные игроки"
        description={`${links.length} ребёнок(ей) · GDPR / согласие`}
      />

      {upcomingFixtures.length > 0 && (
        <AppSection title="Ближайшие матчи">
          <Card>
            <ul className="space-y-2 text-sm">
              {upcomingFixtures.map((f) => (
                <li
                  key={f.id}
                  className="app-list-card rounded-xl border border-border/60 bg-base/50 px-4 py-3"
                >
                  <span className="font-medium">
                    {f.homeClub.shortName} — {f.awayClub.shortName}
                  </span>
                  <span className="mt-1 block font-mono text-xs text-muted">
                    {format.datetime(f.scheduledAt)} · {f.status}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </AppSection>
      )}

        {links.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Нет привязанных игроков"
            description="Лига добавляет связь опекун — ребёнок"
          />
        ) : (
          links.map((l) => {
            const needsConsent =
              l.player.isMinor &&
              Date.now() - l.consentAt.getTime() > consentStaleMs;

            return (
              <Card key={l.id} className="mb-6">
                <h3 className="font-display text-lg font-bold">
                  {l.player.firstName} {l.player.lastName}
                  {l.player.isMinor && (
                    <span className="ml-2 text-xs text-warning">U18</span>
                  )}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Согласие: {format.datetime(l.consentAt)}
                </p>

                {(needsConsent || l.player.isMinor) && (
                  <form action={recordGuardianConsent} className="mt-4 space-y-3 rounded-lg border border-border bg-base/50 p-4">
                    <input type="hidden" name="linkId" value={l.id} />
                    <label className="flex items-start gap-2 text-sm">
                      <input type="checkbox" name="agreed" required className="mt-1" />
                      <span>
                        Подтверждаю согласие на обработку персональных данных ребёнка
                        и участие в соревнованиях лиги.
                      </span>
                    </label>
                    <Button type="submit" size="sm">
                      {needsConsent ? "Обновить согласие" : "Подтвердить согласие"}
                    </Button>
                  </form>
                )}

                <ul className="mt-4 space-y-2 text-sm">
                  {l.player.registrations.map((r) => (
                    <li key={r.id} className="rounded-lg bg-base/50 px-3 py-2">
                      {r.club.name} · {r.season.name}
                      {r.ageCategory && (
                        <span className="ml-2 text-muted">· {r.ageCategory}</span>
                      )}
                      · {r.eligibility}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted">
                  Документов: {l.player.documents.length}
                </p>
              </Card>
            );
          })
        )}
    </PortalShell>
  );
}
