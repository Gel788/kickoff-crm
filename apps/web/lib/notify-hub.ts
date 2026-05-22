import { sendEmail } from "@/lib/email";
import { notifyEmail } from "@/lib/emails/templates";
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const mail = notifyEmail({ title, body, link, appUrl });
    await sendEmail({
      to: email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
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
