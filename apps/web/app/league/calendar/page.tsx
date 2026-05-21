import { Badge } from "@/components/kickoff/badge";
import { Button } from "@/components/kickoff/button";
import { DeleteButton } from "@/components/kickoff/confirm-form";
import { FlashBanner } from "@/components/kickoff/flash-banner";
import { PageHeader } from "@/components/kickoff/page-header";
import { CalendarMatchForms } from "@/components/league/calendar-match-forms";
import { Card, DataTable, selectClass } from "@/components/kickoff/ui";
import { deleteFixture } from "@/lib/actions-crud";
import { FIXTURE_STATUS_LABELS, fixtureStatusToBadge } from "@/lib/fixture-status";
import { format } from "@/lib/format";
import { getOrgContext, getDashboardStats } from "@/lib/queries";
import { openSquads } from "@/lib/actions";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: {
    club?: string;
    round?: string;
    error?: string;
    flash?: string;
  };
}) {
  const ctx = await getOrgContext();
  if (!ctx?.season) redirect("/league/settings");

  const division = await prisma.division.findFirst({
    where: { competition: { seasonId: ctx.season.id } },
    include: { rounds: { orderBy: { number: "asc" } } },
  });
  if (!division) redirect("/league/settings");

  const { fixtures } = await getDashboardStats(
    ctx.session.organizationId,
    ctx.season.id,
  );

  const clubs = await prisma.club.findMany({
    where: { seasonClubs: { some: { seasonId: ctx.season.id } } },
    orderBy: { name: "asc" },
  });

  const roundsFromDb = division.rounds;
  const roundsFromFixtures = Array.from(
    new Map(fixtures.map((f) => [f.round.number, f.round])).values(),
  );
  const rounds =
    roundsFromDb.length > 0
      ? roundsFromDb
      : roundsFromFixtures.sort((a, b) => a.number - b.number);

  const clubFilter = searchParams.club ?? "";
  const roundFilter = searchParams.round ? Number(searchParams.round) : null;

  const filtered = fixtures.filter((f) => {
    if (clubFilter && f.homeClubId !== clubFilter && f.awayClubId !== clubFilter) {
      return false;
    }
    if (roundFilter != null && f.round.number !== roundFilter) return false;
    return true;
  });

  const byRound = roundFilter
    ? filtered
    : filtered.sort((a, b) => a.round.number - b.round.number || a.scheduledAt.getTime() - b.scheduledAt.getTime());

  return (
    <>
      <PageHeader
        label="Календарь"
        title="Матчи сезона"
        description={`${filtered.length} матчей · добавление, заявки, управление`}
      />

      <FlashBanner code={searchParams.error} flash={searchParams.flash} />

      <CalendarMatchForms
        seasonId={ctx.season.id}
        divisionId={division.id}
        rounds={roundsFromDb}
        clubs={clubs}
      />

      <form method="get" className="kickoff-filter-bar mb-8 flex flex-wrap gap-3">
        <select name="club" defaultValue={clubFilter} className={selectClass}>
          <option value="">Все клубы</option>
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="round" defaultValue={roundFilter ?? ""} className={selectClass}>
          <option value="">Все туры</option>
          {rounds.map((r) => (
            <option key={r.number} value={r.number}>
              {r.name ?? `Тур ${r.number}`}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm">
          Фильтр
        </Button>
        <Link href="/league/calendar">
          <Button type="button" size="sm" variant="ghost">
            Сброс
          </Button>
        </Link>
      </form>

      {roundFilter == null && (
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rounds.map((round) => {
            const roundFixtures = fixtures.filter(
              (f) => f.round.number === round.number,
            );
            return (
              <Card key={round.number} hover className="!p-5">
                <h3 className="font-display text-lg font-bold">
                  {round.name ?? `Тур ${round.number}`}
                </h3>
                <p className="mt-1 font-mono text-xs text-muted">
                  {roundFixtures.length} матч(ей)
                </p>
                <Link
                  href={`/league/calendar?round=${round.number}`}
                  className="mt-4 inline-flex text-sm font-medium text-accent hover:text-white"
                >
                  Открыть тур →
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      <DataTable>
          <thead>
            <tr>
              <th>Тур</th>
              <th>Дата</th>
              <th>Матч</th>
              <th>Статус</th>
              <th>Счёт</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {byRound.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted">
                  Матчей пока нет — добавьте выше
                </td>
              </tr>
            )}
            {byRound.map((f) => (
              <tr key={f.id}>
                <td className="font-mono text-xs text-muted">{f.round.number}</td>
                <td className="font-mono text-xs text-muted">
                  {format.datetime(f.scheduledAt)}
                </td>
                <td>
                  <span className="font-medium">{f.homeClub.shortName}</span>
                  <span className="text-muted"> — </span>
                  <span className="font-medium">{f.awayClub.shortName}</span>
                </td>
                <td>
                  <Badge status={fixtureStatusToBadge(f.status)} />
                  <p className="mt-1 text-xs text-muted">
                    {FIXTURE_STATUS_LABELS[f.status]}
                  </p>
                </td>
                <td className="font-mono">
                  {f.status === "LIVE" || f.status === "CLOSED"
                    ? `${f.homeScore} : ${f.awayScore}`
                    : "—"}
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    {f.status === "SCHEDULED" && (
                      <form
                        action={async () => {
                          "use server";
                          await openSquads(f.id);
                        }}
                      >
                        <Button type="submit" size="sm" variant="outline">
                          Открыть заявки
                        </Button>
                      </form>
                    )}
                    <Link href={`/league/fixtures/${f.id}`}>
                      <Button size="sm" variant="outline">
                        Матч
                      </Button>
                    </Link>
                    {(f.status === "SCHEDULED" || f.status === "SQUADS_OPEN") && (
                      <DeleteButton
                        action={deleteFixture}
                        confirmMessage={`Удалить матч ${f.homeClub.shortName} — ${f.awayClub.shortName}?`}
                        hidden={{ fixtureId: f.id }}
                        label="Удалить"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
      </DataTable>
    </>
  );
}
