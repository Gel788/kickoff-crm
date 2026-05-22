import { prisma } from "@/lib/db";
import { FixtureStatus } from "@prisma/client";

export async function getHeadToHead(
  seasonId: string,
  clubAId: string,
  clubBId: string,
) {
  const fixtures = await prisma.fixture.findMany({
    where: {
      status: FixtureStatus.CLOSED,
      round: { division: { competition: { seasonId } } },
      OR: [
        { homeClubId: clubAId, awayClubId: clubBId },
        { homeClubId: clubBId, awayClubId: clubAId },
      ],
    },
    include: { homeClub: true, awayClub: true },
    orderBy: { scheduledAt: "desc" },
  });

  let winsA = 0;
  let winsB = 0;
  let draws = 0;
  let goalsA = 0;
  let goalsB = 0;

  for (const f of fixtures) {
    const aHome = f.homeClubId === clubAId;
    const scoreA = aHome ? f.homeScore : f.awayScore;
    const scoreB = aHome ? f.awayScore : f.homeScore;
    goalsA += scoreA;
    goalsB += scoreB;
    if (scoreA > scoreB) winsA++;
    else if (scoreA < scoreB) winsB++;
    else draws++;
  }

  return {
    fixtures,
    summary: { winsA, winsB, draws, goalsA, goalsB, played: fixtures.length },
  };
}
