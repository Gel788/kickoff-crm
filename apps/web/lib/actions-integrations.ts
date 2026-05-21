"use server";

import { hashApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { canManageLeague, requireSession } from "@/lib/auth";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createApiKey(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const name = String(formData.get("name") ?? "API").trim();
  const raw = `ko_${randomBytes(24).toString("hex")}`;
  const prefix = raw.slice(0, 12);

  await prisma.apiKey.create({
    data: {
      organizationId: session.organizationId,
      name,
      keyHash: hashApiKey(raw),
      keyPrefix: prefix,
    },
  });

  redirect(`/league/settings?api_key=${encodeURIComponent(raw)}`);
}

export async function revokeApiKey(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  await prisma.apiKey.update({
    where: {
      id: String(formData.get("id") ?? ""),
      organizationId: session.organizationId,
    },
    data: { active: false },
  });

  revalidatePath("/league/settings");
}

export async function createWebhook(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const url = String(formData.get("url") ?? "").trim();
  const events = String(formData.get("events") ?? "fixture.closed")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.webhookEndpoint.create({
    data: {
      organizationId: session.organizationId,
      url,
      events,
      secret: randomBytes(16).toString("hex"),
    },
  });

  revalidatePath("/league/settings");
}

export async function deleteWebhook(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  await prisma.webhookEndpoint.delete({
    where: {
      id: String(formData.get("id") ?? ""),
      organizationId: session.organizationId,
    },
  });

  revalidatePath("/league/settings");
}
