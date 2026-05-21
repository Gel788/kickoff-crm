"use server";

import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canManageLeague, requireSession } from "@/lib/auth";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function inviteUser(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "CLUB_COACH") as Role;
  const clubId = String(formData.get("clubId") ?? "") || null;

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        passwordHash: await hashPassword("demo123"),
      },
    });
  }

  const existing = await prisma.membership.findFirst({
    where: {
      userId: user.id,
      organizationId: session.organizationId,
      role,
      clubId,
    },
  });
  if (existing) {
    await prisma.membership.update({
      where: { id: existing.id },
      data: { clubId },
    });
  } else {
    await prisma.membership.create({
      data: {
        userId: user.id,
        organizationId: session.organizationId,
        role,
        clubId,
      },
    });
  }

  if (role === "REFEREE_CHIEF" || role === "REFEREE_ASSISTANT") {
    await prisma.refereeProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        organizationId: session.organizationId,
        active: true,
      },
      update: { organizationId: session.organizationId, active: true },
    });
  }

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      action: "USER_INVITED",
      details: `${email} → ${role}`,
      userId: session.userId,
    },
  });

  revalidatePath("/league/users");
  redirect("/league/users?flash=invited");
}

export async function removeMembership(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const membershipId = String(formData.get("membershipId") ?? "");

  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, organizationId: session.organizationId },
    include: { user: true },
  });
  if (!membership) throw new Error("NOT_FOUND");

  if (membership.userId === session.userId) {
    redirect("/league/users?error=self");
  }

  await prisma.membership.delete({ where: { id: membershipId } });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      action: "USER_REMOVED",
      details: membership.user.email,
      userId: session.userId,
    },
  });

  revalidatePath("/league/users");
}

export async function updateMembershipRole(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const membershipId = String(formData.get("membershipId") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  const clubId = String(formData.get("clubId") ?? "") || null;

  await prisma.membership.update({
    where: {
      id: membershipId,
      organizationId: session.organizationId,
    },
    data: { role, clubId },
  });

  revalidatePath("/league/users");
}
