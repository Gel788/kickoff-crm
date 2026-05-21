import { MatchCard } from "@/components/kickoff/match-card";
import { PageHeader } from "@/components/kickoff/page-header";
import { fixtureStatusToBadge } from "@/lib/fixture-status";
import { format } from "@/lib/format";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function RefereeHomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const assignments = await prisma.refereeAssignment.findMany({
    where: { userId: session.userId },
    include: {
      fixture: {
        include: { homeClub: true, awayClub: true },
      },
    },
    orderBy: { fixture: { scheduledAt: "asc" } },
  });

  const live = assignments.filter((a) => a.fixture.status === "LIVE");
  const upcoming = assignments.filter((a) =>
    ["SCHEDULED", "SQUADS_OPEN", "SQUADS_SUBMITTED", "SQUADS_APPROVED", "SQUADS_LOCKED"].includes(
      a.fixture.status,
    ),
  );
  const past = assignments.filter((a) =>
    ["PROTOCOL_REVIEW", "CLOSED", "FINISHED"].includes(a.fixture.status),
  );

  return (
    <>
      <PageHeader
        label="Судья"
        title="Мои назначения"
        description={session.name}
      />

      {live.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-lg font-bold text-danger">
            Live сейчас
          </h2>
          <div className="grid gap-4">
            {live.map((a) => (
              <MatchCard
                key={a.id}
                home={a.fixture.homeClub.name}
                away={a.fixture.awayClub.name}
                score={`${a.fixture.homeScore} : ${a.fixture.awayScore}`}
                time={format.datetime(a.fixture.scheduledAt)}
                venue={a.fixture.venue ?? undefined}
                status={fixtureStatusToBadge(a.fixture.status)}
                href={`/referee/match/${a.fixture.id}`}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-bold">Предстоящие</h2>
        <div className="grid gap-4">
          {upcoming.length === 0 ? (
            <p className="text-muted">Нет назначений</p>
          ) : (
            upcoming.map((a) => (
              <MatchCard
                key={a.id}
                home={a.fixture.homeClub.name}
                away={a.fixture.awayClub.name}
                time={format.datetime(a.fixture.scheduledAt)}
                venue={a.fixture.venue ?? undefined}
                status={fixtureStatusToBadge(a.fixture.status)}
                href={`/referee/match/${a.fixture.id}`}
              />
            ))
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-muted">
            Завершённые
          </h2>
          <div className="grid gap-4">
            {past.map((a) => (
              <MatchCard
                key={a.id}
                home={a.fixture.homeClub.name}
                away={a.fixture.awayClub.name}
                score={`${a.fixture.homeScore} : ${a.fixture.awayScore}`}
                time={format.datetime(a.fixture.scheduledAt)}
                status={fixtureStatusToBadge(a.fixture.status)}
                href={`/referee/match/${a.fixture.id}`}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
