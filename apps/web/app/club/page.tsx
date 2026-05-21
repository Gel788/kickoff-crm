import { Button } from "@/components/kickoff/button";
import { MatchCard } from "@/components/kickoff/match-card";
import { PageHeader } from "@/components/kickoff/page-header";
import { RoleValuePanel } from "@/components/kickoff/role-value-panel";
import { StatCard } from "@/components/kickoff/stat-card";
import { SquadPicker } from "@/components/club/squad-picker";
import { fixtureStatusToBadge } from "@/lib/fixture-status";
import { getIneligibilityReason } from "@/lib/eligibility";
import { format } from "@/lib/format";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Calendar, ClipboardList, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ClubPage() {
  const session = await getSession();
  if (!session?.clubId) redirect("/login");

  const club = await prisma.club.findUnique({
    where: { id: session.clubId },
  });

  const season = await prisma.season.findFirst({
    where: { organizationId: session.organizationId, isActive: true },
  });
  if (!season) redirect("/login");

  const [registrations, rosterCount, allFixtures, openFixtures] =
    await Promise.all([
      prisma.playerRegistration.findMany({
        where: { clubId: session.clubId, seasonId: season.id },
        include: { player: true },
      }),
      prisma.seasonRosterEntry.count({
        where: { clubId: session.clubId, seasonId: season.id },
      }),
      prisma.fixture.findMany({
        where: {
          OR: [{ homeClubId: session.clubId }, { awayClubId: session.clubId }],
          round: { division: { competition: { seasonId: season.id } } },
        },
        include: {
          homeClub: true,
          awayClub: true,
          squads: { where: { clubId: session.clubId }, include: { lines: true } },
        },
        orderBy: { scheduledAt: "asc" },
        take: 8,
      }),
      prisma.fixture.findMany({
        where: {
          OR: [{ homeClubId: session.clubId }, { awayClubId: session.clubId }],
          status: "SQUADS_OPEN",
          round: { division: { competition: { seasonId: season.id } } },
        },
        include: {
          homeClub: true,
          awayClub: true,
          squads: { where: { clubId: session.clubId }, include: { lines: true } },
        },
        orderBy: { scheduledAt: "asc" },
        take: 1,
      }),
    ]);

  const openFixture = openFixtures[0];
  const eligibleCount = registrations.filter(
    (r) => r.eligibility === "ELIGIBLE",
  ).length;

  const regPayload = await Promise.all(
    registrations.map(async (r) => ({
      id: r.id,
      name: `${r.player.firstName} ${r.player.lastName}`,
      number: r.shirtNumber,
      eligibility: r.eligibility,
      blockReason: await getIneligibilityReason(
        r.id,
        season.id,
        session.clubId!,
      ),
    })),
  );

  return (
    <>
      <PageHeader
        label="Кабинет клуба"
        title={club?.name ?? "Клуб"}
        description={`${season.name} · заявки и протокол без звонков в лигу`}
      />

      <RoleValuePanel role="club" guideHref="/club/guide" />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="В листе сезона"
          value={rosterCount}
          hint={`макс. ${season.maxSquadSize}`}
          icon={ClipboardList}
        />
        <StatCard
          label="Допущено"
          value={eligibleCount}
          icon={Users}
        />
        <StatCard
          label="Матчей"
          value={allFixtures.length}
          icon={Calendar}
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/club/roster">
          <Button size="sm">Заявочный лист сезона</Button>
        </Link>
        <Link href="/club/delegate">
          <Button variant="outline" size="sm">
            Подпись протокола
          </Button>
        </Link>
      </div>

      {openFixture ? (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-lg font-bold">
            Заявка открыта
          </h2>
          <p className="mb-4 text-sm text-muted">
            vs{" "}
            {openFixture.homeClubId === session.clubId
              ? openFixture.awayClub.name
              : openFixture.homeClub.name}{" "}
            · {format.datetime(openFixture.scheduledAt)}
          </p>
          <SquadPicker
            fixtureId={openFixture.id}
            clubId={session.clubId}
            clubName={club?.name ?? ""}
            registrations={regPayload}
            existingIds={
              openFixture.squads[0]?.lines.map((l) => l.registrationId) ?? []
            }
            captainId={
              openFixture.squads[0]?.lines.find((l) => l.isCaptain)
                ?.registrationId
            }
            status={openFixture.squads[0]?.status ?? "DRAFT"}
            rejectReason={openFixture.squads[0]?.rejectReason}
          />
        </section>
      ) : (
        <p className="mb-8 rounded-xl border border-border bg-elevated p-6 text-sm text-muted">
          Сейчас нет открытого окна заявки. Следующий матч — в списке ниже.
        </p>
      )}

      <section>
        <h2 className="mb-4 font-display text-lg font-bold">Календарь клуба</h2>
        <div className="grid gap-4">
          {allFixtures.length === 0 ? (
            <p className="text-muted">Матчей нет</p>
          ) : (
            allFixtures.map((f) => (
              <MatchCard
                key={f.id}
                home={f.homeClub.name}
                away={f.awayClub.name}
                time={format.datetime(f.scheduledAt)}
                status={fixtureStatusToBadge(f.status)}
                href={`/league/fixtures/${f.id}`}
              />
            ))
          )}
        </div>
      </section>
    </>
  );
}
