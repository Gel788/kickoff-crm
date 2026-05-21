import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export async function runDocumentExpiryReminders(organizationId: string) {
  const now = new Date();
  const in14 = new Date(now.getTime() + 14 * 86400000);

  const docs = await prisma.playerDocument.findMany({
    where: {
      expiresAt: { not: null, lte: in14, gte: now },
      player: { organizationId },
    },
    include: {
      player: {
        include: {
          registrations: {
            where: { season: { organizationId, isActive: true } },
            include: { club: true },
          },
        },
      },
    },
  });

  let sent = 0;
  for (const doc of docs) {
    if (!doc.expiresAt) continue;
    const days = Math.ceil(
      (doc.expiresAt.getTime() - now.getTime()) / 86400000,
    );
    if (![14, 7, 1].some((d) => days <= d && days >= d - 1)) continue;

    for (const reg of doc.player.registrations) {
      const staff = await prisma.membership.findMany({
        where: {
          organizationId,
          clubId: reg.clubId,
          role: { in: ["CLUB_ADMIN", "CLUB_COACH"] },
        },
      });
      for (const m of staff) {
        await createNotification(
          m.userId,
          "Документ истекает",
          `${doc.player.firstName} ${doc.player.lastName}: ${doc.docType} через ${days} дн.`,
          "/league/players",
        );
        sent++;
      }
    }
  }
  return { sent };
}
