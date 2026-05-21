import { sendEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

const COACH_ROLES: Role[] = ["CLUB_COACH", "CLUB_ADMIN", "CLUB_DELEGATE"];

export async function notifyUser(
  userId: string,
  title: string,
  body: string,
  link?: string,
  email?: string,
) {
  await createNotification(userId, title, body, link);
  if (email) {
    await sendEmail({
      to: email,
      subject: `[Kickoff] ${title}`,
      text: `${body}${link ? `\n\n${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${link}` : ""}`,
    });
  }
}

export async function notifyClubStaff(
  clubId: string,
  organizationId: string,
  title: string,
  body: string,
  link?: string,
) {
  const members = await prisma.membership.findMany({
    where: {
      clubId,
      organizationId,
      role: { in: COACH_ROLES },
    },
    include: { user: true },
  });
  for (const m of members) {
    await notifyUser(m.userId, title, body, link, m.user.email);
  }
}

export async function notifyLeague(
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
    include: { user: true },
  });
  for (const m of members) {
    await notifyUser(m.userId, title, body, link, m.user.email);
  }
  const { notifyOrgTelegram } = await import("@/lib/telegram");
  await notifyOrgTelegram(organizationId, `${title}: ${body}`);
}
