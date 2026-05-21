import { prisma } from "@/lib/db";
import { EligibilityStatus, MatchEventType } from "@prisma/client";
import { createNotification } from "@/lib/notifications";

export async function processCardDiscipline(
  fixtureId: string,
  registrationId: string | null | undefined,
  eventType: MatchEventType,
) {
  if (!registrationId) return;

  const reg = await prisma.playerRegistration.findUnique({
    where: { id: registrationId },
    include: { season: true, player: true, club: true },
  });
  if (!reg) return;

  const season = reg.season;
  let matchesBanned = 0;
  let reason = "";

  if (eventType === "RED" || eventType === "SECOND_YELLOW") {
    matchesBanned = season.redBanMatches;
    reason =
      eventType === "RED"
        ? "Красная карточка"
        : "Вторая жёлтая карточка";
  } else if (eventType === "YELLOW") {
    const yellows = await prisma.matchEvent.count({
      where: {
        registrationId,
        type: "YELLOW",
        fixture: {
          round: { division: { competition: { seasonId: season.id } } },
        },
      },
    });
    if (yellows < season.yellowBanThreshold) return;
    matchesBanned = season.yellowBanMatches;
    reason = `Накопление жёлтых (${yellows})`;
  } else {
    return;
  }

  const record = await prisma.disciplinaryRecord.create({
    data: {
      registrationId,
      matchesBanned,
      reason,
      active: true,
    },
  });

  await prisma.disciplinaryCase.create({
    data: {
      registrationId,
      sourceType: "AUTO",
      status: "RESOLVED",
      matchesBanned,
      matchesServed: 0,
      committeeNotes: reason,
      resolvedAt: new Date(),
    },
  });

  void record;

  await prisma.playerRegistration.update({
    where: { id: registrationId },
    data: { eligibility: EligibilityStatus.SUSPENDED },
  });

  const clubMembers = await prisma.membership.findMany({
    where: {
      clubId: reg.clubId,
      role: { in: ["CLUB_ADMIN", "CLUB_COACH"] },
    },
  });

  for (const m of clubMembers) {
    await createNotification(
      m.userId,
      "Дисквалификация",
      `${reg.player.firstName} ${reg.player.lastName}: ${reason}. Бан ${matchesBanned} матч(ей).`,
      "/league/players",
    );
  }
}

export async function getActiveBan(registrationId: string) {
  const record = await prisma.disciplinaryRecord.findFirst({
    where: {
      registrationId,
      active: true,
    },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return null;
  const remaining = record.matchesBanned - record.matchesServed;
  if (remaining <= 0) {
    await prisma.disciplinaryRecord.update({
      where: { id: record.id },
      data: { active: false },
    });
    await prisma.playerRegistration.update({
      where: { id: registrationId },
      data: { eligibility: EligibilityStatus.ELIGIBLE },
    });
    return null;
  }
  return { ...record, remaining };
}
