"use server";

import { prisma } from "@/lib/db";
import { canManageLeague, requireSession } from "@/lib/auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

export async function updateOrganization(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const name = String(formData.get("name") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "Europe/Moscow").trim();
  const locale = String(formData.get("locale") ?? "ru").trim();

  await prisma.organization.update({
    where: { id: session.organizationId },
    data: { name, timezone, locale },
  });

  revalidatePath("/league/settings");
}

export async function uploadOrganizationLogo(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const file = formData.get("logo");
  if (!file || !(file instanceof File) || file.size === 0) {
    throw new Error("NO_FILE");
  }

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
  });
  if (!org) throw new Error("NOT_FOUND");

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const safeExt = ["png", "jpg", "jpeg", "webp", "svg"].includes(ext) ? ext : "png";
  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads", "orgs");
  await mkdir(dir, { recursive: true });
  const filename = `${org.slug}.${safeExt}`;
  const rel = `/uploads/orgs/${filename}`;
  await writeFile(path.join(process.cwd(), "public", rel), bytes);

  await prisma.organization.update({
    where: { id: org.id },
    data: { logoUrl: rel },
  });

  revalidatePath("/league/settings");
}

export async function updateTelegramChat(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const telegramChatId = String(formData.get("telegramChatId") ?? "").trim() || null;

  await prisma.organization.update({
    where: { id: session.organizationId },
    data: { telegramChatId },
  });

  revalidatePath("/league/settings");
}
