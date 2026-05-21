import { prisma } from "@/lib/db";

export async function createNotification(
  userId: string,
  title: string,
  body: string,
  link?: string,
) {
  return prisma.notification.create({
    data: { userId, title, body, link },
  });
}

export async function notifyLeagueOperators(
  organizationId: string,
  title: string,
  body: string,
  link?: string,
) {
  const members = await prisma.membership.findMany({
    where: {
      organizationId,
      role: { in: ["LEAGUE_OWNER", "LEAGUE_OPERATOR"] },
    },
  });
  for (const m of members) {
    await createNotification(m.userId, title, body, link);
  }
}
