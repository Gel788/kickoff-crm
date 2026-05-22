/**
 * Наполняет демо-лигу закрытыми матчами, голами, карточками и заявками.
 * Запуск: npx tsx scripts/seed-demo-stats.ts
 * (автоматически вызывается из prisma/seed.ts)
 */
import {
  FixtureStatus,
  MatchEventType,
  PrismaClient,
  SquadStatus,
} from "@prisma/client";

const DEMO_SLUG = "demo";
const TARGET_CLOSED = 18;
const MIN_EVENTS = 45;

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

async function populateClosedFixture(
  prisma: PrismaClient,
  fixtureId: string,
  homeClubId: string,
  awayClubId: string,
  homeScore: number,
  awayScore: number,
  createdById: string,
  seasonId: string,
) {
  const existingEvents = await prisma.matchEvent.count({
    where: { fixtureId },
  });
  if (existingEvents > 0) return;

  await prisma.fixture.update({
    where: { id: fixtureId },
    data: {
      status: FixtureStatus.CLOSED,
      homeScore,
      awayScore,
    },
  });

  const homeRegs = await prisma.playerRegistration.findMany({
    where: { clubId: homeClubId, seasonId, eligibility: "ELIGIBLE" },
    take: 11,
  });
  const awayRegs = await prisma.playerRegistration.findMany({
    where: { clubId: awayClubId, seasonId, eligibility: "ELIGIBLE" },
    take: 11,
  });

  let homeSquad = await prisma.squadSubmission.findFirst({
    where: { fixtureId, clubId: homeClubId },
  });
  if (!homeSquad) {
    homeSquad = await prisma.squadSubmission.create({
      data: {
        fixtureId,
        clubId: homeClubId,
        status: SquadStatus.LOCKED,
        submittedAt: new Date(),
      },
    });
    for (let i = 0; i < homeRegs.length; i++) {
      await prisma.squadLineup.create({
        data: {
          submissionId: homeSquad.id,
          registrationId: homeRegs[i].id,
          isStarter: i < 11,
          isCaptain: i === 0,
          sortOrder: i,
        },
      });
    }
  }

  let awaySquad = await prisma.squadSubmission.findFirst({
    where: { fixtureId, clubId: awayClubId },
  });
  if (!awaySquad) {
    awaySquad = await prisma.squadSubmission.create({
      data: {
        fixtureId,
        clubId: awayClubId,
        status: SquadStatus.LOCKED,
        submittedAt: new Date(),
      },
    });
    for (let i = 0; i < awayRegs.length; i++) {
      await prisma.squadLineup.create({
        data: {
          submissionId: awaySquad.id,
          registrationId: awayRegs[i].id,
          isStarter: i < 11,
          isCaptain: i === 0,
          sortOrder: i,
        },
      });
    }
  }

  const events: {
    type: MatchEventType;
    minute: number;
    teamClubId: string;
    registrationId: string;
  }[] = [];

  let minute = 8;
  for (let g = 0; g < homeScore; g++) {
    const reg = homeRegs[randInt(1, Math.max(1, homeRegs.length - 1))];
    if (reg)
      events.push({
        type: "GOAL",
        minute: (minute += randInt(4, 14)),
        teamClubId: homeClubId,
        registrationId: reg.id,
      });
  }
  for (let g = 0; g < awayScore; g++) {
    const reg = awayRegs[randInt(1, Math.max(1, awayRegs.length - 1))];
    if (reg)
      events.push({
        type: "GOAL",
        minute: (minute += randInt(4, 14)),
        teamClubId: awayClubId,
        registrationId: reg.id,
      });
  }

  if (Math.random() > 0.5 && awayRegs[3]) {
    events.push({
      type: "YELLOW",
      minute: randInt(20, 75),
      teamClubId: awayClubId,
      registrationId: awayRegs[3].id,
    });
  }
  if (Math.random() > 0.85 && homeRegs[2]) {
    events.push({
      type: "RED",
      minute: randInt(60, 88),
      teamClubId: homeClubId,
      registrationId: homeRegs[2].id,
    });
  }

  if (events.length > 0) {
    await prisma.matchEvent.createMany({
      data: events.map((e) => ({
        fixtureId,
        type: e.type,
        minute: e.minute,
        teamClubId: e.teamClubId,
        registrationId: e.registrationId,
        createdById,
      })),
    });
  }
}

export async function seedDemoStats(prisma: PrismaClient) {
  const org = await prisma.organization.findUnique({ where: { slug: DEMO_SLUG } });
  if (!org) {
    console.warn("seed-demo-stats: org demo не найдена, пропуск");
    return;
  }

  const season = await prisma.season.findFirst({
    where: { organizationId: org.id, isActive: true },
    include: {
      competitions: {
        include: { divisions: { include: { rounds: { orderBy: { number: "asc" } } } } },
      },
    },
  });
  if (!season) {
    console.warn("seed-demo-stats: нет активного сезона");
    return;
  }

  const division = season.competitions[0]?.divisions[0];
  if (!division) {
    console.warn("seed-demo-stats: нет дивизиона");
    return;
  }

  const eventsOnClosed = await prisma.matchEvent.count({
    where: {
      fixture: {
        status: FixtureStatus.CLOSED,
        round: { division: { competition: { seasonId: season.id } } },
      },
    },
  });
  if (eventsOnClosed >= MIN_EVENTS) {
    console.log(`seed-demo-stats: уже ${eventsOnClosed} событий, пропуск`);
    return;
  }

  const referee = await prisma.user.findFirst({
    where: {
      memberships: {
        some: { organizationId: org.id, role: { in: ["REFEREE_CHIEF", "REFEREE_ASSISTANT"] } },
      },
    },
  });
  const operator = await prisma.user.findFirst({
    where: {
      memberships: { some: { organizationId: org.id, role: "LEAGUE_OPERATOR" } },
    },
  });
  const createdById = referee?.id ?? operator?.id;
  if (!createdById) {
    console.warn("seed-demo-stats: нет пользователя для событий");
    return;
  }

  const clubs = await prisma.club.findMany({
    where: { seasonClubs: { some: { seasonId: season.id } } },
    orderBy: { shortName: "asc" },
  });
  if (clubs.length < 4) {
    console.warn("seed-demo-stats: мало клубов");
    return;
  }

  let round = division.rounds.find((r) => r.number === 1);
  if (!round) {
    round = await prisma.round.create({
      data: { divisionId: division.id, number: 1, name: "Тур 1" },
    });
  }

  const closedCount = await prisma.fixture.count({
    where: {
      status: FixtureStatus.CLOSED,
      round: { divisionId: division.id },
    },
  });

  const base = new Date();
  let created = 0;
  const pairs: [number, number][] = [];

  for (let i = 0; i < clubs.length; i++) {
    for (let j = i + 1; j < clubs.length; j++) {
      pairs.push([i, j]);
      pairs.push([j, i]);
    }
  }

  for (let n = 0; n < pairs.length && closedCount + created < TARGET_CLOSED; n++) {
    const [hi, ai] = pairs[n];
    const home = clubs[hi];
    const away = clubs[ai];
    const dayOffset = -90 + Math.floor((n / pairs.length) * 85);
    const scheduledAt = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate() + dayOffset,
      10 + (n % 7),
      30,
    );

    const dup = await prisma.fixture.findFirst({
      where: {
        roundId: round.id,
        homeClubId: home.id,
        awayClubId: away.id,
        scheduledAt: {
          gte: new Date(scheduledAt.getFullYear(), scheduledAt.getMonth(), scheduledAt.getDate()),
          lt: new Date(
            scheduledAt.getFullYear(),
            scheduledAt.getMonth(),
            scheduledAt.getDate() + 1,
          ),
        },
      },
    });

    let fixtureId = dup?.id;
    const homeScore = randInt(0, 4);
    const awayScore = randInt(0, 3);

    if (!dup) {
      const f = await prisma.fixture.create({
        data: {
          roundId: round.id,
          homeClubId: home.id,
          awayClubId: away.id,
          scheduledAt,
          venue: home.venue ?? "Стадион",
          status: FixtureStatus.CLOSED,
          homeScore,
          awayScore,
        },
      });
      fixtureId = f.id;
      created++;
    }

    if (fixtureId) {
      await populateClosedFixture(
        prisma,
        fixtureId,
        home.id,
        away.id,
        homeScore,
        awayScore,
        createdById,
        season.id,
      );
    }
  }

  const bareClosed = await prisma.fixture.findMany({
    where: {
      status: FixtureStatus.CLOSED,
      round: { divisionId: division.id },
      events: { none: {} },
    },
    take: 20,
  });
  for (const f of bareClosed) {
    await populateClosedFixture(
      prisma,
      f.id,
      f.homeClubId,
      f.awayClubId,
      f.homeScore ?? randInt(1, 3),
      f.awayScore ?? randInt(0, 2),
      createdById,
      season.id,
    );
  }

  const totalEvents = await prisma.matchEvent.count({
    where: {
      fixture: {
        status: FixtureStatus.CLOSED,
        round: { division: { competition: { seasonId: season.id } } },
      },
    },
  });

  console.log(
    `seed-demo-stats: +${created} матчей, событий на закрытых: ${totalEvents}`,
  );
}

async function main() {
  const prisma = new PrismaClient();
  await seedDemoStats(prisma);
  await prisma.$disconnect();
}

if (process.argv[1]?.includes("seed-demo-stats")) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
