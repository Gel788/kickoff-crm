import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "kickoff_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "kickoff-dev-secret-change-in-production-32",
);

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  organizationId: string;
  orgSlug: string;
  orgName: string;
  role: Role;
  clubId?: string | null;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  cookies().delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        include: { organization: true, club: true },
      },
    },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return null;
  }

  const m =
    user.memberships.find((x) => x.role === "PLATFORM_ADMIN") ??
    user.memberships[0];
  if (!m) return null;

  if (user.twoFactorEnabled && user.totpSecret) {
    const token = await new SignJWT({ sub: user.id, purpose: "2fa" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("5m")
      .sign(secret);
    return { needs2fa: true as const, token };
  }

  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    organizationId: m.organizationId,
    orgSlug: m.organization.slug,
    orgName: m.organization.name,
    role: m.role,
    clubId: m.clubId,
  };

  await createSession(payload);
  return payload;
}

export function isLeagueRole(role: Role) {
  return [
    "PLATFORM_ADMIN",
    "LEAGUE_OWNER",
    "LEAGUE_OPERATOR",
    "DISCIPLINARY",
    "REFEREE_ASSIGNER",
    "MEDICAL_LEAGUE",
    "STATISTICIAN",
  ].includes(role);
}

export function canManageLeague(role: Role) {
  return ["PLATFORM_ADMIN", "LEAGUE_OWNER", "LEAGUE_OPERATOR"].includes(role);
}
