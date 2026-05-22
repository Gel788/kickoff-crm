import { Badge } from "@/components/kickoff/badge";
import { Button } from "@/components/kickoff/button";
import { PageHeader } from "@/components/kickoff/page-header";
import { SquadPicker } from "@/components/club/squad-picker";
import { FixtureOps } from "@/components/fixture/fixture-ops";
import { IntegrityPanel } from "@/components/fixture/integrity-panel";
import { MedicalPanel } from "@/components/fixture/medical-panel";
import { LeagueCloseChecklist } from "@/components/league/league-close-checklist";
import { approveSquads, lockSquads, openSquads } from "@/lib/actions";
import { ensureFixtureChecklist } from "@/lib/actions-match";
import { getIneligibilityReason } from "@/lib/eligibility";
import { FixtureQr } from "@/components/fixture/fixture-qr";
import { ShareFixtureLink } from "@/components/fixture/share-fixture-link";
import { RefereeSlotsPanel } from "@/components/fixture/referee-slots-panel";
import { chiefAssignment } from "@/lib/referee-slots";
import { getSession } from "@/lib/auth";
import { canManageLeague } from "@/lib/auth";
import { FIXTURE_STATUS_LABELS, fixtureStatusToBadge } from "@/lib/fixture-status";
import { format } from "@/lib/format";
import { getFixtureDetail } from "@/lib/queries";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

const EVENT_RU: Record<string, string> = {
  GOAL: "Гол",
  OWN_GOAL: "Автогол",
  PENALTY_SCORED: "Пенальти",
  YELLOW: "ЖК",
  SECOND_YELLOW: "2ЖК",
  RED: "КК",
  SUBSTITUTION: "Замена",
  INJURY: "Травма",
  VAR_DECISION: "VAR",
  OTHER: "Прочее",
};

export default async function FixturePage({
  params,
}: {
  params: { id: string };
}) {
  const fixture = await getFixtureDetail(params.id);
  if (!fixture) notFound();

  await ensureFixtureChecklist(fixture.id);

  const session = await getSession();
  const canLeague = session ? canManageLeague(session.role) : false;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const orgSlug =
    session?.orgSlug ??
    (
      await prisma.organization.findUnique({
        where: { id: fixture.round.division.competition.season.organizationId },
        select: { slug: true },
      })
    )?.slug ??
    "demo";
  const seasonId = fixture.round.division.competition.season.id;

  const homeRegs = await prisma.playerRegistration.findMany({
    where: { clubId: fixture.homeClubId, seasonId },
    include: { player: true, club: true },
  });
  const awayRegs = await prisma.playerRegistration.findMany({
    where: { clubId: fixture.awayClubId, seasonId },
    include: { player: true, club: true },
  });

  const referees = await prisma.user.findMany({
    where: {
      memberships: {
        some: {
          organizationId: session?.organizationId,
          role: { in: ["REFEREE_CHIEF", "REFEREE_ASSISTANT"] },
        },
      },
    },
  });

  const homeSquad = fixture.squads.find((s) => s.clubId === fixture.homeClubId);
  const awaySquad = fixture.squads.find((s) => s.clubId === fixture.awayClubId);

  const medRegs = [...homeRegs, ...awayRegs].map((r) => ({
    id: r.id,
    name: `${r.player.firstName} ${r.player.lastName}`,
    club: r.club.shortName,
  }));

  const mapRegs = async (regs: typeof homeRegs, clubId: string) =>
    Promise.all(
      regs.map(async (r) => ({
        id: r.id,
        name: `${r.player.firstName} ${r.player.lastName}`,
        number: r.shirtNumber,
        eligibility: r.eligibility,
        blockReason: await getIneligibilityReason(r.id, seasonId, clubId),
      })),
    );

  const [homeRegPayload, awayRegPayload] = await Promise.all([
    mapRegs(homeRegs, fixture.homeClubId),
    mapRegs(awayRegs, fixture.awayClubId),
  ]);

  return (
    <>
      <PageHeader
        label={fixture.round.name ?? `Тур ${fixture.round.number}`}
        title={`${fixture.homeClub.name} — ${fixture.awayClub.name}`}
        description={format.datetime(fixture.scheduledAt)}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge status={fixtureStatusToBadge(fixture.status)} />
          <span className="font-mono text-2xl font-bold text-accent">
            {fixture.homeScore} : {fixture.awayScore}
          </span>
          <ShareFixtureLink url={`${appUrl}/league/fixtures/${fixture.id}`} />
          <Link
            href={`/league/compare?a=${fixture.homeClubId}&b=${fixture.awayClubId}`}
            className="text-sm text-accent hover:underline"
          >
            Очные встречи
          </Link>
        </div>
      </PageHeader>

      <div className="mb-8 flex flex-wrap gap-2">
        {fixture.status === "SCHEDULED" && (
          <form
            action={async () => {
              "use server";
              await openSquads(fixture.id);
            }}
          >
            <Button type="submit" size="sm">
              Открыть заявки
            </Button>
          </form>
        )}
        {["SQUADS_SUBMITTED", "SQUADS_OPEN"].includes(fixture.status) && (
          <form
            action={async () => {
              "use server";
              await approveSquads(fixture.id);
            }}
          >
            <Button type="submit" size="sm" variant="outline">
              Утвердить заявки
            </Button>
          </form>
        )}
        {fixture.status === "SQUADS_APPROVED" && (
          <form
            action={async () => {
              "use server";
              await lockSquads(fixture.id);
            }}
          >
            <Button type="submit" size="sm" variant="outline">
              Заблокировать заявки
            </Button>
          </form>
        )}
        <a href={`/api/fixtures/${fixture.id}/protocol`} download>
          <Button size="sm" variant="outline">
            Протокол PDF
          </Button>
        </a>
        <a
          href={`/api/fixtures/${fixture.id}/squad?clubId=${fixture.homeClubId}`}
          download
        >
          <Button size="sm" variant="ghost">
            Заявка {fixture.homeClub.shortName}
          </Button>
        </a>
        <a
          href={`/api/fixtures/${fixture.id}/squad?clubId=${fixture.awayClubId}`}
          download
        >
          <Button size="sm" variant="ghost">
            Заявка {fixture.awayClub.shortName}
          </Button>
        </a>
        <Link href={`/league/fixtures/${fixture.id}/print`} target="_blank">
          <Button size="sm" variant="ghost">
            Печать
          </Button>
        </Link>
      </div>

      <p className="mb-6 text-sm text-muted">
        {FIXTURE_STATUS_LABELS[fixture.status]}
        {chiefAssignment(fixture.refereeAssignments) &&
          ` · Главный: ${chiefAssignment(fixture.refereeAssignments)!.user.name}`}
      </p>

      <div className="mb-8 flex flex-wrap gap-6">
        <FixtureQr
          url={`${appUrl}/referee/match/${fixture.id}`}
          label="Судья: скан → матч"
        />
        <FixtureQr
          url={`${appUrl}/live/${orgSlug}`}
          label="Публичное live-табло"
        />
        <FixtureQr
          url={`${appUrl}/league/fixtures/${fixture.id}`}
          label="Карточка матча"
        />
      </div>

      {canLeague && (
        <RefereeSlotsPanel
          fixtureId={fixture.id}
          assignments={fixture.refereeAssignments}
          referees={referees}
          canManage
        />
      )}

      {fixture.status === "PROTOCOL_REVIEW" && canLeague && (
        <div className="mb-8">
          <LeagueCloseChecklist
            fixtureId={fixture.id}
            eventsOk={fixture.checklist?.eventsOk ?? false}
            signaturesOk={fixture.checklist?.signaturesOk ?? false}
            leagueReady={fixture.checklist?.leagueReady ?? false}
          />
        </div>
      )}

      {canLeague && (
        <FixtureOps
          fixtureId={fixture.id}
          homeClubId={fixture.homeClubId}
          awayClubId={fixture.awayClubId}
          scheduledAt={fixture.scheduledAt.toISOString()}
          status={fixture.status}
          canReopen={session?.role === "LEAGUE_OWNER"}
        />
      )}

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="xl:col-span-2">
          <h2 className="mb-4 font-display text-lg font-bold">Медицина</h2>
          <MedicalPanel
            fixtureId={fixture.id}
            registrations={medRegs}
            report={fixture.medicalReport}
          />
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-bold">Заявки</h2>
          <div className="space-y-4">
            <SquadPicker
              fixtureId={fixture.id}
              clubId={fixture.homeClubId}
              clubName={fixture.homeClub.name}
              opponentName={fixture.awayClub.name}
              matchDatetime={format.datetime(fixture.scheduledAt)}
              venue={fixture.venue}
              registrations={homeRegPayload}
              existingIds={homeSquad?.lines.map((l) => l.registrationId) ?? []}
              captainId={
                homeSquad?.lines.find((l) => l.isCaptain)?.registrationId
              }
              status={homeSquad?.status ?? "DRAFT"}
              rejectReason={homeSquad?.rejectReason}
            />
            <SquadPicker
              fixtureId={fixture.id}
              clubId={fixture.awayClubId}
              clubName={fixture.awayClub.name}
              opponentName={fixture.homeClub.name}
              matchDatetime={format.datetime(fixture.scheduledAt)}
              venue={fixture.venue}
              registrations={awayRegPayload}
              existingIds={awaySquad?.lines.map((l) => l.registrationId) ?? []}
              captainId={
                awaySquad?.lines.find((l) => l.isCaptain)?.registrationId
              }
              status={awaySquad?.status ?? "DRAFT"}
              rejectReason={awaySquad?.rejectReason}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-bold">Протокол</h2>
          <ul className="rounded-xl border border-border bg-elevated divide-y divide-border">
            {fixture.events.length === 0 ? (
              <li className="px-4 py-6 text-center text-muted">Событий нет</li>
            ) : (
              fixture.events.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span className="font-mono text-accent">{e.minute}&apos;</span>
                  <span className="font-medium">{EVENT_RU[e.type]}</span>
                  <span className="text-muted text-right">
                    {e.type === "SUBSTITUTION" && e.registration
                      ? `↑ ${e.registration.player.lastName}`
                      : e.registration
                        ? `${e.registration.player.firstName} ${e.registration.player.lastName}`
                        : e.teamClub.shortName}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="xl:col-span-2">
          <IntegrityPanel
            fixtureId={fixture.id}
            homeClubId={fixture.homeClubId}
            signatures={fixture.signatures}
            disputes={fixture.disputes}
            canLeague={canLeague}
          />
        </section>
      </div>
    </>
  );
}
