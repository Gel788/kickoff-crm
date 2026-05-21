/**
 * Генерирует 10+ матчей для UAT. Запуск: npx tsx scripts/seed-uat-matches.ts
 */
import { FixtureStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findUnique({ where: { slug: "demo" } });
  if (!org) throw new Error("Run db:seed first");

  const season = await prisma.season.findFirst({
    where: { organizationId: org.id, isActive: true },
    include: {
      competitions: {
        include: { divisions: { include: { rounds: true } } },
      },
    },
  });
  if (!season) throw new Error("No active season");

  const round =
    season.competitions[0]?.divisions[0]?.rounds[0] ??
    (await prisma.round.create({
      data: {
        divisionId: season.competitions[0].divisions[0].id,
        number: 99,
        name: "UAT",
      },
    }));

  const clubs = await prisma.club.findMany({
    where: { seasonClubs: { some: { seasonId: season.id } } },
    take: 6,
  });
  if (clubs.length < 2) throw new Error("Need clubs");

  const base = new Date();
  let created = 0;

  for (let i = 0; i < 12; i++) {
    const home = clubs[i % clubs.length];
    const away = clubs[(i + 1) % clubs.length];
    if (home.id === away.id) continue;

    const exists = await prisma.fixture.findFirst({
      where: {
        roundId: round.id,
        homeClubId: home.id,
        awayClubId: away.id,
        scheduledAt: {
          gte: new Date(base.getFullYear(), base.getMonth(), base.getDate() + i),
          lt: new Date(base.getFullYear(), base.getMonth(), base.getDate() + i + 1),
        },
      },
    });
    if (exists) continue;

    await prisma.fixture.create({
      data: {
        roundId: round.id,
        homeClubId: home.id,
        awayClubId: away.id,
        scheduledAt: new Date(
          base.getFullYear(),
          base.getMonth(),
          base.getDate() + i,
          10 + (i % 8),
          0,
        ),
        status:
          i < 2
            ? FixtureStatus.SCHEDULED
            : i < 5
              ? FixtureStatus.SQUADS_OPEN
              : FixtureStatus.CLOSED,
        homeScore: i >= 5 ? Math.floor(Math.random() * 3) : 0,
        awayScore: i >= 5 ? Math.floor(Math.random() * 3) : 0,
      },
    });
    created++;
  }

  console.log(`UAT: создано ${created} матчей в туре ${round.name ?? round.number}`);
}

main()
  .finally(() => prisma.$disconnect());
