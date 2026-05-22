import { prisma } from "@/lib/db";
import { FixtureStatus } from "@prisma/client";

export async function getPlayerSeasonStats(registrationId: string) {
  const reg = await prisma.playerRegistration.findUnique({
    where: { id: registrationId },
    include: { player: true, club: true },
  });
  if (!reg) return null;

  const closedFilter = {
    status: FixtureStatus.CLOSED,
    round: { division: { competition: { seasonId: reg.seasonId } } },
  };

  const events = await prisma.matchEvent.findMany({
    where: {
      registrationId,
      fixture: closedFilter,
    },
    include: { fixture: { include: { homeClub: true, awayClub: true } } },
  });

  const lineupFixtures = await prisma.squadLineup.findMany({
    where: {
      registrationId,
      submission: { fixture: closedFilter },
    },
    select: { isStarter: true, submission: { select: { fixtureId: true } } },
  });

  const fixtureIds = new Set(lineupFixtures.map((l) => l.submission.fixtureId));
  const starts = lineupFixtures.filter((l) => l.isStarter).length;

  let goals = 0;
  let yellow = 0;
  let red = 0;
  for (const e of events) {
    if (e.type === "GOAL" || e.type === "PENALTY_SCORED") goals++;
    if (e.type === "YELLOW" || e.type === "SECOND_YELLOW") yellow++;
    if (e.type === "RED") red++;
  }

  const recent = events
    .filter((e) => ["GOAL", "YELLOW", "RED", "PENALTY_SCORED"].includes(e.type))
    .slice(-8)
    .reverse()
    .map((e) => ({
      type: e.type,
      minute: e.minute,
      fixtureLabel: `${e.fixture.homeClub.shortName} — ${e.fixture.awayClub.shortName}`,
      date: e.fixture.scheduledAt,
    }));

  const goalEvents = events
    .filter((e) => e.type === "GOAL" || e.type === "PENALTY_SCORED")
    .sort((a, b) => a.fixture.scheduledAt.getTime() - b.fixture.scheduledAt.getTime());

  let cumulative = 0;
  const goalTimeline = goalEvents.map((e) => {
    cumulative++;
    return {
      label: e.fixture.scheduledAt.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      }),
      goals: cumulative,
    };
  });

  return {
    registrationId: reg.id,
    playerName: `${reg.player.firstName} ${reg.player.lastName}`,
    clubName: reg.club.name,
    appearances: fixtureIds.size,
    starts,
    goals,
    yellow,
    red,
    recent,
    goalTimeline,
  };
}

export async function getSeasonLeaderboard(seasonId: string, limit = 50) {
  const regs = await prisma.playerRegistration.findMany({
    where: { seasonId },
    include: { player: true, club: true },
  });

  const rows = await Promise.all(
    regs.map(async (reg) => {
      const stats = await getPlayerSeasonStats(reg.id);
      if (!stats) return null;
      return {
        registrationId: reg.id,
        name: stats.playerName,
        club: reg.club.shortName,
        goals: stats.goals,
        yellow: stats.yellow,
        red: stats.red,
        appearances: stats.appearances,
        score: stats.goals * 3 + stats.appearances - stats.red * 2 - stats.yellow * 0.5,
      };
    }),
  );

  return rows
    .filter((r): r is NonNullable<typeof r> => r !== null && (r.goals > 0 || r.appearances > 0))
    .sort((a, b) => b.goals - a.goals || b.appearances - a.appearances)
    .slice(0, limit);
}

export async function getSeasonChartData(seasonId: string) {
  const fixtures = await prisma.fixture.findMany({
    where: {
      status: FixtureStatus.CLOSED,
      round: { division: { competition: { seasonId } } },
    },
    include: {
      events: {
        where: { type: { in: ["GOAL", "PENALTY_SCORED", "YELLOW", "RED"] } },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const byMonth = new Map<string, { goals: number; cards: number; matches: number }>();

  for (const f of fixtures) {
    const key = f.scheduledAt.toLocaleDateString("ru-RU", {
      month: "short",
      year: "2-digit",
    });
    const cur = byMonth.get(key) ?? { goals: 0, cards: 0, matches: 0 };
    cur.matches++;
    for (const e of f.events) {
      if (e.type === "GOAL" || e.type === "PENALTY_SCORED") cur.goals++;
      if (["YELLOW", "RED", "SECOND_YELLOW"].includes(e.type)) cur.cards++;
    }
    byMonth.set(key, cur);
  }

  return Array.from(byMonth.entries()).map(([month, v]) => ({
    month,
    ...v,
  }));
}
