import { AppSection } from "@/components/kickoff/app-section";
import { MatchCard } from "@/components/kickoff/match-card";
import { PageHeader } from "@/components/kickoff/page-header";
import { PortalWelcomeStrip } from "@/components/kickoff/portal-welcome-strip";
import { StatCard } from "@/components/kickoff/stat-card";
import { EmptyState } from "@/components/kickoff/ui";
import { fixtureStatusToBadge } from "@/lib/fixture-status";
import { format } from "@/lib/format";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Calendar, Flag, Radio } from "lucide-react";
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
      <PortalWelcomeStrip
        label="Судейская служба"
        title={session.name}
        description="Live-протокол с поля, офлайн-режим и PDF для лиги — всё с планшета."
        icon={Flag}
      />

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Live"
          value={live.length}
          icon={Radio}
          accent={live.length > 0}
          animate
        />
        <StatCard
          label="Предстоящие"
          value={upcoming.length}
          icon={Calendar}
          animate
        />
        <StatCard
          label="Завершённые"
          value={past.length}
          icon={Flag}
          animate
        />
      </div>

      <PageHeader
        label="Назначения"
        title="Мои матчи"
        description="Откройте карточку — протокол, голы, карточки"
      />

      {live.length > 0 && (
        <AppSection title="Live сейчас" accent="danger" icon={Radio}>
          <div className="grid gap-4 md:grid-cols-2">
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
        </AppSection>
      )}

      <AppSection title="Предстоящие" icon={Calendar}>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Нет назначений"
            description="Лига назначит бригаду на матч — он появится здесь"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((a) => (
              <MatchCard
                key={a.id}
                home={a.fixture.homeClub.name}
                away={a.fixture.awayClub.name}
                time={format.datetime(a.fixture.scheduledAt)}
                venue={a.fixture.venue ?? undefined}
                status={fixtureStatusToBadge(a.fixture.status)}
                href={`/referee/match/${a.fixture.id}`}
              />
            ))}
          </div>
        )}
      </AppSection>

      {past.length > 0 && (
        <AppSection title="Завершённые" accent="muted">
          <div className="grid gap-4 md:grid-cols-2">
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
        </AppSection>
      )}
    </>
  );
}
