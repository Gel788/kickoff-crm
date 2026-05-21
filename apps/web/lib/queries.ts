import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getScheduleConflicts } from "@/lib/conflicts";
import { getSeasonPointsConfig } from "@/lib/season-rules";
import { computeStandings } from "@/lib/standings";
import { FixtureStatus, Prisma } from "@prisma/client";

const fixtureListInclude = {
  homeClub: true,
  awayClub: true,
  squads: true,
  round: true,
} satisfies Prisma.FixtureInclude;

export type FixtureListItem = Prisma.FixtureGetPayload<{
  include: typeof fixtureListInclude;
}>;

export async function getOrgContext() {
  const session = await getSession();
  if (!session) return null;

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    include: {
      seasons: {
        where: { isActive: true },
        take: 1,
        include: {
          competitions: {
            include: {
              divisions: {
                include: { rounds: { orderBy: { number: "desc" }, take: 1 } },
              },
            },
          },
        },
      },
    },
  });

  const season = org?.seasons[0] ?? null;
  const division = season?.competitions[0]?.divisions[0] ?? null;
  const round = division?.rounds[0] ?? null;

  return { session, org, season, division, round };
}

export async function getDashboardStats(organizationId: string, seasonId?: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const fixtures = await prisma.fixture.findMany({
    where: seasonId
      ? { round: { division: { competition: { seasonId } } } }
      : { round: { division: { competition: { season: { organizationId } } } } },
    include: fixtureListInclude,
    orderBy: { scheduledAt: "asc" },
  });

  const today = fixtures.filter(
    (f) => f.scheduledAt >= todayStart && f.scheduledAt <= todayEnd,
  );

  const live = fixtures.filter((f) => f.status === FixtureStatus.LIVE);
  const overdueSquads = fixtures.filter(
    (f) =>
      f.status === FixtureStatus.SQUADS_OPEN &&
      f.squads.filter((s) => s.status === "SUBMITTED").length < 2,
  );
  const protocolReview = fixtures.filter(
    (f) => f.status === FixtureStatus.PROTOCOL_REVIEW,
  );

  const activeRound = fixtures.reduce(
    (max, f) => Math.max(max, f.round.number),
    0,
  );
  const roundFixtures = fixtures.filter((f) => f.round.number === activeRound);
  const closedInRound = roundFixtures.filter((f) => f.status === FixtureStatus.CLOSED).length;

  const openDisputes = seasonId
    ? await prisma.dispute.count({
        where: {
          status: "OPEN",
          fixture: { round: { division: { competition: { seasonId } } } },
        },
      })
    : 0;

  const conflictAlerts = seasonId ? await getScheduleConflicts(seasonId) : [];
  const expiringDocs = seasonId
    ? await prisma.playerDocument.count({
        where: {
          expiresAt: {
            lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
          player: {
            registrations: { some: { seasonId } },
          },
        },
      })
    : 0;

  return {
    fixtures,
    today,
    live,
    stats: {
      todayCount: today.length,
      liveCount: live.length,
      overdueSquads: overdueSquads.length,
      protocolReview: protocolReview.length,
      roundClosed: `${closedInRound}/${roundFixtures.length}`,
      openDisputes,
    },
    alerts: [
      ...buildAlerts(fixtures),
      ...conflictAlerts.map((c) => `· ${c}`),
      ...(openDisputes > 0 ? [`· ${openDisputes} открытых споров`] : []),
      ...(expiringDocs > 0
        ? [`· ${expiringDocs} документ(ов) истекает в 14 дней`]
        : []),
    ].slice(0, 8),
  };
}

function buildAlerts(fixtures: FixtureListItem[]) {
  const alerts: string[] = [];
  for (const f of fixtures) {
    if (f.status === FixtureStatus.SQUADS_OPEN) {
      const submitted = f.squads.filter((s) => s.status !== "DRAFT").length;
      if (submitted < 2) {
        const missing =
          submitted === 0
            ? `${f.homeClub.shortName} / ${f.awayClub.shortName}`
            : f.squads[0]?.clubId === f.homeClubId
              ? f.awayClub.name
              : f.homeClub.name;
        alerts.push(`· ${missing} — заявка не подана`);
      }
    }
    if (f.status === FixtureStatus.PROTOCOL_REVIEW) {
      alerts.push(
        `· Протокол ${f.homeClub.shortName} — ${f.awayClub.shortName} на проверке`,
      );
    }
  }
  return alerts.slice(0, 5);
}

export async function getSeasonDivisions(seasonId: string) {
  return prisma.division.findMany({
    where: { competition: { seasonId } },
    include: { competition: true },
    orderBy: [{ competition: { name: "asc" } }, { name: "asc" }],
  });
}

export async function getStandingsForSeason(
  seasonId: string,
  divisionId?: string,
) {
  const points = await getSeasonPointsConfig(seasonId);

  const fixtures = await prisma.fixture.findMany({
    where: {
      status: FixtureStatus.CLOSED,
      round: divisionId
        ? { divisionId }
        : { division: { competition: { seasonId } } },
    },
  });

  const clubIds = new Set(
    fixtures.flatMap((f) => [f.homeClubId, f.awayClubId]),
  );

  const clubs = await prisma.club.findMany({
    where: divisionId
      ? { id: { in: Array.from(clubIds) } }
      : { seasonClubs: { some: { seasonId } } },
  });

  const names = new Map(clubs.map((c) => [c.id, c.name]));
  return { standings: computeStandings(fixtures, names, points), points };
}

export type CardStatRow = {
  playerName: string;
  clubName: string;
  yellow: number;
  red: number;
};

export async function getCardStatsForSeason(
  seasonId: string,
  divisionId?: string,
  limit = 20,
): Promise<CardStatRow[]> {
  const events = await prisma.matchEvent.findMany({
    where: {
      type: { in: ["YELLOW", "SECOND_YELLOW", "RED"] },
      registrationId: { not: null },
      fixture: {
        status: FixtureStatus.CLOSED,
        round: divisionId
          ? { divisionId }
          : { division: { competition: { seasonId } } },
      },
    },
    include: {
      registration: { include: { player: true, club: true } },
    },
  });

  const map = new Map<
    string,
    { playerName: string; clubName: string; yellow: number; red: number }
  >();

  for (const e of events) {
    if (!e.registration) continue;
    const key = e.registration.id;
    const cur = map.get(key) ?? {
      playerName: `${e.registration.player.firstName} ${e.registration.player.lastName}`,
      clubName: e.registration.club.shortName,
      yellow: 0,
      red: 0,
    };
    if (e.type === "RED") cur.red++;
    else cur.yellow++;
    map.set(key, cur);
  }

  return Array.from(map.values())
    .sort((a, b) => b.yellow + b.red * 2 - (a.yellow + a.red * 2))
    .slice(0, limit);
}

export async function getTopScorers(seasonId: string, limit = 5) {
  const events = await prisma.matchEvent.findMany({
    where: {
      type: { in: ["GOAL", "PENALTY_SCORED"] },
      fixture: {
        round: { division: { competition: { seasonId } } },
      },
      registrationId: { not: null },
    },
    include: {
      registration: { include: { player: true, club: true } },
    },
  });

  const map = new Map<string, { name: string; club: string; goals: number }>();
  for (const e of events) {
    if (!e.registration) continue;
    const key = e.registration.id;
    const cur = map.get(key) ?? {
      name: `${e.registration.player.firstName} ${e.registration.player.lastName}`,
      club: e.registration.club.shortName,
      goals: 0,
    };
    cur.goals++;
    map.set(key, cur);
  }

  return Array.from(map.values())
    .sort((a, b) => b.goals - a.goals)
    .slice(0, limit);
}

export async function getFixtureDetail(fixtureId: string) {
  return prisma.fixture.findUnique({
    where: { id: fixtureId },
    include: {
      homeClub: true,
      awayClub: true,
      round: { include: { division: { include: { competition: { include: { season: true } } } } } },
      squads: {
        include: {
          lines: { include: { registration: { include: { player: true } } } },
          club: true,
        },
      },
      events: {
        orderBy: [{ minute: "asc" }, { createdAt: "asc" }],
        include: {
          registration: { include: { player: true } },
          teamClub: true,
        },
      },
      refereeAssignments: {
        include: { user: true },
        orderBy: { slot: "asc" },
      },
      medicalReport: true,
      signatures: { include: { user: true } },
      disputes: { include: { club: true } },
      checklist: true,
    },
  });
}

export async function getUnreadNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId, read: false },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
