import { prisma } from "@/lib/db";
import { FixtureStatus } from "@prisma/client";

export type FormResult = "W" | "D" | "L";

type FixtureRow = {
  homeClubId: string;
  awayClubId: string;
  homeScore: number;
  awayScore: number;
  status: FixtureStatus;
  scheduledAt: Date;
};

function pushForm(map: Map<string, FormResult[]>, clubId: string, r: FormResult) {
  const arr = map.get(clubId) ?? [];
  arr.push(r);
  map.set(clubId, arr);
}

/** Последние N результатов по хронологии (идея из OpenLeague / FlashScore). */
export function buildFormMap(
  fixtures: FixtureRow[],
  limit = 5,
): Map<string, FormResult[]> {
  const history = new Map<string, FormResult[]>();
  const closed = fixtures
    .filter((f) => f.status === FixtureStatus.CLOSED)
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

  for (const f of closed) {
    const hs = f.homeScore;
    const as = f.awayScore;
    const homeR: FormResult = hs > as ? "W" : hs < as ? "L" : "D";
    const awayR: FormResult = hs > as ? "L" : hs < as ? "W" : "D";
    pushForm(history, f.homeClubId, homeR);
    pushForm(history, f.awayClubId, awayR);
  }

  return new Map(
    Array.from(history.entries()).map(([id, rows]) => [id, rows.slice(-limit)]),
  );
}

export async function getClubFormMap(
  seasonId: string,
  divisionId?: string,
  limit = 5,
) {
  const fixtures = await prisma.fixture.findMany({
    where: {
      round: divisionId
        ? { divisionId }
        : { division: { competition: { seasonId } } },
    },
    select: {
      homeClubId: true,
      awayClubId: true,
      homeScore: true,
      awayScore: true,
      status: true,
      scheduledAt: true,
    },
    orderBy: { scheduledAt: "asc" },
  });

  return buildFormMap(fixtures, limit);
}
