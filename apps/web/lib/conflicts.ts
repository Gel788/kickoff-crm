import { prisma } from "@/lib/db";

export async function getScheduleConflicts(seasonId: string) {
  const fixtures = await prisma.fixture.findMany({
    where: {
      round: { division: { competition: { seasonId } } },
      status: { notIn: ["CLOSED"] },
    },
    include: { homeClub: true, awayClub: true },
    orderBy: { scheduledAt: "asc" },
  });

  const alerts: string[] = [];

  for (let i = 0; i < fixtures.length; i++) {
    for (let j = i + 1; j < fixtures.length; j++) {
      const a = fixtures[i];
      const b = fixtures[j];
      const diff = Math.abs(a.scheduledAt.getTime() - b.scheduledAt.getTime());
      if (diff > 3 * 60 * 60 * 1000) continue;

      const clubsOverlap =
        a.homeClubId === b.homeClubId ||
        a.homeClubId === b.awayClubId ||
        a.awayClubId === b.homeClubId ||
        a.awayClubId === b.awayClubId;

      if (clubsOverlap) {
        alerts.push(
          `Конфликт клуба: ${a.homeClub.shortName}—${a.awayClub.shortName} и ${b.homeClub.shortName}—${b.awayClub.shortName} слишком близко по времени`,
        );
      }

      if (a.venue && b.venue && a.venue === b.venue) {
        alerts.push(`Конфликт арены «${a.venue}»: два матча в один слот`);
      }
    }
  }

  return alerts.slice(0, 8);
}
