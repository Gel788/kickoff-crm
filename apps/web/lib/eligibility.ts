import { prisma } from "@/lib/db";
import { getActiveBan } from "@/lib/discipline";
import { EligibilityStatus } from "@prisma/client";

export async function getIneligibilityReason(
  registrationId: string,
  seasonId: string,
  clubId: string,
): Promise<string | null> {
  const reg = await prisma.playerRegistration.findUnique({
    where: { id: registrationId },
    include: {
      player: { include: { documents: true } },
    },
  });
  if (!reg || reg.clubId !== clubId || reg.seasonId !== seasonId) {
    return "Не в клубе сезона";
  }

  if (reg.eligibility === EligibilityStatus.SUSPENDED) {
    return "Отстранён лигой";
  }
  if (reg.eligibility === EligibilityStatus.PENDING) {
    return "Допуск на проверке";
  }

  const ban = await getActiveBan(registrationId);
  if (ban) {
    return `Дисциплина: ${ban.reason}`;
  }

  const rosterCount = await prisma.seasonRosterEntry.count({
    where: { seasonId, clubId },
  });
  if (rosterCount > 0) {
    const onRoster = await prisma.seasonRosterEntry.findUnique({
      where: {
        seasonId_clubId_registrationId: {
          seasonId,
          clubId,
          registrationId,
        },
      },
    });
    if (!onRoster) return "Не в заявочном листе сезона";
  }

  const docs = reg.player.documents.filter((d) => d.verified);
  if (docs.length === 0) return "Нет действующих документов";
  const expired = docs.some(
    (d) => d.expiresAt && d.expiresAt < new Date(),
  );
  if (expired) return "Истёк документ";

  return null;
}

export async function getRegistrationBlocks(
  registrationIds: string[],
  seasonId: string,
  clubId: string,
) {
  const blocks = new Map<string, string>();
  for (const id of registrationIds) {
    const reason = await getIneligibilityReason(id, seasonId, clubId);
    if (reason) blocks.set(id, reason);
  }
  return blocks;
}
