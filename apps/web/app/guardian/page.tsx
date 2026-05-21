import { Button } from "@/components/kickoff/button";
import { PageHeader } from "@/components/kickoff/page-header";
import { PortalHeader } from "@/components/kickoff/portal-header";
import { Card, EmptyState } from "@/components/kickoff/ui";
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

  return (
    <div className="relative min-h-screen bg-base">
      <div className="pointer-events-none fixed inset-0 grid-pitch opacity-[0.2]" />
      <PortalHeader subtitle="Опекун" nav={[{ href: "/guardian", label: "Мои дети" }]} />
      <div className="relative mx-auto max-w-2xl animate-fade-in px-6 py-10">
        <PageHeader
          title="Мои дети"
          description="Согласие на обработку данных несовершеннолетних (фаза 1b)"
        />

        {upcomingFixtures.length > 0 && (
          <Card className="mb-8">
            <h3 className="font-display font-bold">Ближайшие матчи</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {upcomingFixtures.map((f) => (
                <li key={f.id} className="rounded-lg bg-base/50 px-3 py-2">
                  {f.homeClub.shortName} — {f.awayClub.shortName} ·{" "}
                  {format.datetime(f.scheduledAt)} · {f.status}
                </li>
              ))}
            </ul>
          </Card>
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
      </div>
    </div>
  );
}
