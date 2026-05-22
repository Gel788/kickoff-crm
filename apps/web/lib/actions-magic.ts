"use server";

import { sendEmail } from "@/lib/email";
import { magicLinkEmail } from "@/lib/emails/templates";
import { prisma } from "@/lib/db";
import { SignJWT } from "jose";
import { redirect } from "next/navigation";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "kickoff-dev-secret-change-in-production-32",
);

export async function requestMagicLinkAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) redirect("/login?magic=invalid");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    redirect("/login?magic=sent");
  }

  const token = await new SignJWT({ userId: user.id, purpose: "magic" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(secret);

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${base}/api/auth/magic?token=${encodeURIComponent(token)}`;
  const mail = magicLinkEmail({ name: user.name, link });

  await sendEmail({
    to: email,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });

  redirect("/login?magic=sent");
}
