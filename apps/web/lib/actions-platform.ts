"use server";

import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function requirePlatformAdmin() {
  const session = await requireSession();
  if (session.role !== "PLATFORM_ADMIN") throw new Error("FORBIDDEN");
  return session;
}

export async function createOrganization(formData: FormData) {
  await requirePlatformAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  const org = await prisma.organization.create({
    data: { name, slug },
  });

  const season = await prisma.season.create({
    data: {
      organizationId: org.id,
      name: "Сезон 1",
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 86400000),
      isActive: true,
    },
  });

  await prisma.competition.create({
    data: {
      seasonId: season.id,
      name: "Чемпионат",
      divisions: { create: { name: "Основной" } },
    },
  });

  await prisma.seasonRegulation.create({
    data: {
      seasonId: season.id,
      rules: {},
      createdBy: "platform",
    },
  });

  revalidatePath("/platform");
  redirect("/platform");
}

export async function createPlatformLeagueOwner(formData: FormData) {
  await requirePlatformAdmin();

  const orgId = String(formData.get("organizationId") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: name || email,
        passwordHash: await hashPassword("demo123"),
      },
    });
  }

  await prisma.membership.create({
    data: {
      userId: user.id,
      organizationId: orgId,
      role: "LEAGUE_OWNER",
    },
  });

  revalidatePath("/platform");
}
