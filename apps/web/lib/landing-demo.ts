import { prisma } from "@/lib/db";
import { getStandingsForSeason, getTopScorers } from "@/lib/queries";
import { FixtureStatus } from "@prisma/client";

const DEMO_SLUG = "demo";

export async function getLandingDemoData() {
  try {
    const org = await prisma.organization.findUnique({
      where: { slug: DEMO_SLUG },
      include: { seasons: { where: { isActive: true }, take: 1 } },
    });
    if (!org?.seasons[0]) return null;

    const seasonId = org.seasons[0].id;
    const seasonName = org.seasons[0].name;

    const [{ standings }, scorers, liveCount, nextFixture, closedCount] =
      await Promise.all([
        getStandingsForSeason(seasonId),
        getTopScorers(seasonId, 5),
        prisma.fixture.count({
          where: {
            status: FixtureStatus.LIVE,
            round: { division: { competition: { seasonId } } },
          },
        }),
        prisma.fixture.findFirst({
          where: {
            status: { in: [FixtureStatus.SCHEDULED, FixtureStatus.SQUADS_OPEN] },
            scheduledAt: { gte: new Date() },
            round: { division: { competition: { seasonId } } },
          },
          orderBy: { scheduledAt: "asc" },
          include: { homeClub: true, awayClub: true },
        }),
        prisma.fixture.count({
          where: {
            status: FixtureStatus.CLOSED,
            round: { division: { competition: { seasonId } } },
          },
        }),
      ]);

    return {
      orgName: org.name,
      orgSlug: org.slug,
      seasonName,
      standings: standings.slice(0, 6),
      scorers,
      liveCount,
      closedCount,
      nextFixture: nextFixture
        ? {
            id: nextFixture.id,
            label: `${nextFixture.homeClub.shortName} — ${nextFixture.awayClub.shortName}`,
            at: nextFixture.scheduledAt,
            status: nextFixture.status,
          }
        : null,
    };
  } catch {
    return null;
  }
}
