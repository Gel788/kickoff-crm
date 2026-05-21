"use server";

import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SignJWT, jwtVerify } from "jose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "kickoff-dev-secret-change-in-production-32",
);

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = await new SignJWT({ sub: user.id, purpose: "reset" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);
    console.info(`[reset] ${email} → /reset-password?token=${token}`);
  }
  redirect("/login?flash=reset_sent");
}

export async function resetPasswordWithToken(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) throw new Error("WEAK");

  const { payload } = await jwtVerify(token, secret);
  if (payload.purpose !== "reset" || typeof payload.sub !== "string") {
    throw new Error("INVALID");
  }

  await prisma.user.update({
    where: { id: payload.sub },
    data: { passwordHash: await hashPassword(password) },
  });

  redirect("/login?flash=reset_ok");
}

export async function adminResetPassword(formData: FormData) {
  const { requireSession, canManageLeague } = await import("@/lib/auth");
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const userId = String(formData.get("userId") ?? "");
  const password = String(formData.get("password") ?? "demo123");

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(password) },
  });

  revalidatePath("/league/users");
}
