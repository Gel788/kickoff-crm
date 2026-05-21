import { prisma } from "@/lib/db";
import { notifyClubStaff } from "@/lib/notify-hub";
import { FixtureStatus, SquadStatus } from "@prisma/client";

/** Авто-открытие заявок и блокировка по регламенту сезона */
export async function runMatchdayScheduler(seasonId: string) {
  const season = await prisma.season.findUnique({
    where: { id: seasonId },
    include: { organization: true },
  });
  if (!season?.isActive) return { opened: 0, locked: 0 };

  const now = new Date();
  const openBefore = new Date(
    now.getTime() + season.squadDeadlineHours * 60 * 60 * 1000,
  );

  let opened = 0;
  let locked = 0;

  const toOpen = await prisma.fixture.findMany({
    where: {
      status: FixtureStatus.SCHEDULED,
      scheduledAt: { lte: openBefore, gte: now },
      round: { division: { competition: { seasonId } } },
    },
    include: { homeClub: true, awayClub: true },
  });

  for (const fixture of toOpen) {
    await prisma.fixture.update({
      where: { id: fixture.id },
      data: { status: FixtureStatus.SQUADS_OPEN },
    });
    for (const clubId of [fixture.homeClubId, fixture.awayClubId]) {
      await prisma.squadSubmission.upsert({
        where: { fixtureId_clubId: { fixtureId: fixture.id, clubId } },
        create: { fixtureId: fixture.id, clubId, status: SquadStatus.DRAFT },
        update: {},
      });
      await notifyClubStaff(
        clubId,
        season.organizationId,
        "Заявка открыта автоматически",
        `${fixture.homeClub.shortName} — ${fixture.awayClub.shortName}. Дедлайн за ${season.squadDeadlineHours} ч.`,
        "/club",
      );
    }
    opened++;
  }

  const toLock = await prisma.fixture.findMany({
    where: {
      status: {
        in: [
          FixtureStatus.SQUADS_OPEN,
          FixtureStatus.SQUADS_SUBMITTED,
          FixtureStatus.SQUADS_APPROVED,
        ],
      },
      scheduledAt: { lte: now },
      round: { division: { competition: { seasonId } } },
    },
  });

  for (const fixture of toLock) {
    const squads = await prisma.squadSubmission.findMany({
      where: { fixtureId: fixture.id },
    });
    const bothReady = squads.length >= 2 && squads.every(
      (s) => s.status === SquadStatus.SUBMITTED || s.status === SquadStatus.APPROVED || s.status === SquadStatus.LOCKED,
    );
    if (!bothReady) continue;

    await prisma.squadSubmission.updateMany({
      where: { fixtureId: fixture.id },
      data: { status: SquadStatus.LOCKED },
    });
    await prisma.fixture.update({
      where: { id: fixture.id },
      data: { status: FixtureStatus.SQUADS_LOCKED },
    });
    locked++;
  }

  return { opened, locked };
}
