"use server";

import { createSession, requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Secret, TOTP } from "otpauth";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "kickoff-dev-secret-change-in-production-32",
);

function makeTotp(email: string, secretBase32: string) {
  return new TOTP({
    issuer: "Kickoff",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  });
}

export async function beginTwoFactorSetup() {
  const session = await requireSession();
  const secretBase32 = new Secret().base32;

  await prisma.user.update({
    where: { id: session.userId },
    data: { totpSecret: secretBase32, twoFactorEnabled: false },
  });

  redirect("/settings/account?setup=1");
}

export async function confirmTwoFactorSetup(formData: FormData) {
  const session = await requireSession();
  const code = String(formData.get("code") ?? "").trim();
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.totpSecret) throw new Error("NO_SETUP");

  const totp = makeTotp(session.email, user.totpSecret);
  if (totp.validate({ token: code, window: 1 }) === null) {
    throw new Error("INVALID_CODE");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: true },
  });

  redirect("/settings/account?flash=2fa_on");
}

export async function disableTwoFactor(formData: FormData) {
  const session = await requireSession();
  const code = String(formData.get("code") ?? "").trim();
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.totpSecret || !user.twoFactorEnabled) throw new Error("NOT_ENABLED");

  const totp = makeTotp(session.email, user.totpSecret);
  if (totp.validate({ token: code, window: 1 }) === null) {
    throw new Error("INVALID_CODE");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: false, totpSecret: null },
  });

  redirect("/settings/account?flash=2fa_off");
}

export async function verifyTwoFactorLogin(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const code = String(formData.get("code") ?? "").trim();

  const { payload } = await jwtVerify(token, secret);
  if (payload.purpose !== "2fa" || typeof payload.sub !== "string") {
    throw new Error("INVALID");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      memberships: { include: { organization: true, club: true } },
    },
  });
  if (!user?.totpSecret) throw new Error("INVALID");

  const totp = makeTotp(user.email, user.totpSecret);
  if (totp.validate({ token: code, window: 1 }) === null) {
    redirect(`/login/2fa?token=${encodeURIComponent(token)}&error=1`);
  }

  const m =
    user.memberships.find((x) => x.role === "PLATFORM_ADMIN") ??
    user.memberships[0];
  if (!m) redirect("/login?error=1");

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    organizationId: m.organizationId,
    orgSlug: m.organization.slug,
    orgName: m.organization.name,
    role: m.role,
    clubId: m.clubId,
  });

  if (m.role === "PLATFORM_ADMIN") redirect("/platform");
  if (m.role === "REFEREE_CHIEF" || m.role === "REFEREE_ASSISTANT") {
    redirect("/referee");
  }
  if (m.role === "GUARDIAN") redirect("/guardian");
  if (m.clubId) redirect("/club");
  redirect("/league/dashboard");
}
