"use server";

import { prisma } from "@/lib/db";
import { canManageLeague, requireSession } from "@/lib/auth";
import { REFEREE_SLOT_LABELS } from "@/lib/referee-slots";
import { storeUpload } from "@/lib/storage";
import { RefereeSlot } from "@prisma/client";
import { findSimilarPlayers } from "@/lib/player-duplicate";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createClub(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const name = String(formData.get("name") ?? "").trim();
  const shortName = String(formData.get("shortName") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim() || null;

  const season = await prisma.season.findFirst({
    where: { organizationId: session.organizationId, isActive: true },
  });
  if (!season) throw new Error("NO_SEASON");

  const club = await prisma.club.create({
    data: {
      organizationId: session.organizationId,
      name,
      shortName,
      venue,
    },
  });

  await prisma.seasonClub.create({
    data: { seasonId: season.id, clubId: club.id },
  });

  revalidatePath("/league/clubs");
}

export async function createPlayer(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const clubId = String(formData.get("clubId") ?? "");
  const shirtNumber = Number(formData.get("shirtNumber") ?? 0);
  const position = String(formData.get("position") ?? "MF");
  const dob = String(formData.get("dateOfBirth") ?? "");
  const isMinor = formData.get("isMinor") === "on";
  const ageCategory = String(formData.get("ageCategory") ?? "").trim() || null;

  const season = await prisma.season.findFirst({
    where: { organizationId: session.organizationId, isActive: true },
  });
  if (!season) throw new Error("NO_SEASON");

  const dobDate = new Date(dob);
  const duplicate = await prisma.player.findFirst({
    where: {
      organizationId: session.organizationId,
      lastName,
      firstName,
      dateOfBirth: dobDate,
    },
  });
  if (duplicate) redirect("/league/players?error=duplicate_exact");

  const similar = await findSimilarPlayers(
    session.organizationId,
    firstName,
    lastName,
    dobDate,
  );
  if (similar.length > 0 && formData.get("confirmSimilar") !== "on") {
    const label = similar
      .map((p) => `${p.firstName} ${p.lastName} (${p.clubLabel})`)
      .join("; ");
    redirect(
      `/league/players?warn=similar&hint=${encodeURIComponent(label)}`,
    );
  }

  const squadCount = await prisma.playerRegistration.count({
    where: { clubId, seasonId: season.id },
  });
  if (squadCount >= season.maxSquadSize) redirect("/league/players?error=squad_limit");

  const player = await prisma.player.create({
    data: {
      organizationId: session.organizationId,
      firstName,
      lastName,
      dateOfBirth: dobDate,
      isMinor,
    },
  });

  await prisma.playerRegistration.create({
    data: {
      playerId: player.id,
      clubId,
      seasonId: season.id,
      shirtNumber: shirtNumber || null,
      position,
      ageCategory,
      eligibility: "PENDING",
    },
  });

  revalidatePath("/league/players");
}

export async function addPlayerDocument(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const playerId = String(formData.get("playerId") ?? "");
  const docType = String(formData.get("docType") ?? "medical");
  const expiresAt = String(formData.get("expiresAt") ?? "");
  const file = formData.get("file");

  let fileName: string | null = null;
  let filePath: string | null = null;

  if (file && file instanceof File && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    fileName = safeName;
    const stored = await storeUpload(
      `${playerId}/${Date.now()}-${safeName}`,
      bytes,
      file.type || "application/octet-stream",
    );
    filePath = stored.url;
  }

  await prisma.playerDocument.create({
    data: {
      playerId,
      docType,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      verified: true,
      fileName,
      filePath,
    },
  });

  const reg = await prisma.playerRegistration.findFirst({
    where: { playerId },
  });
  if (reg) {
    const docs = await prisma.playerDocument.findMany({
      where: { playerId, verified: true },
    });
    const valid = docs.every(
      (d) => !d.expiresAt || d.expiresAt > new Date(),
    );
    if (valid && docs.length > 0) {
      await prisma.playerRegistration.update({
        where: { id: reg.id },
        data: { eligibility: "ELIGIBLE" },
      });
    }
  }

  revalidatePath("/league/players");
}

export async function assignRefereeSlot(
  fixtureId: string,
  userId: string,
  slot: RefereeSlot,
) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  await prisma.refereeAssignment.upsert({
    where: { fixtureId_slot: { fixtureId, slot } },
    create: { fixtureId, userId, slot },
    update: { userId },
  });

  const fixture = await prisma.fixture.findUnique({
    where: { id: fixtureId },
    include: { homeClub: true, awayClub: true },
  });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user && fixture) {
    const { notifyUser } = await import("@/lib/notify-hub");
    await notifyUser(
      userId,
      "Назначение на матч",
      `${REFEREE_SLOT_LABELS[slot]}: ${fixture.homeClub.shortName} — ${fixture.awayClub.shortName}`,
      `/referee/match/${fixtureId}`,
      user.email,
    );
  }

  revalidatePath(`/league/fixtures/${fixtureId}`);
  revalidatePath("/league/referees");
}

export async function assignReferee(fixtureId: string, userId: string) {
  return assignRefereeSlot(fixtureId, userId, "CHIEF");
}

export async function uploadPlayerPhoto(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const playerId = String(formData.get("playerId") ?? "");
  const file = formData.get("photo");
  if (!file || !(file instanceof File) || file.size === 0) throw new Error("NO_FILE");

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ["png", "jpg", "jpeg", "webp"].includes(ext) ? ext : "jpg";
  const bytes = Buffer.from(await file.arrayBuffer());
  const stored = await storeUpload(
    `players/${playerId}.${safeExt}`,
    bytes,
    file.type || "image/jpeg",
  );

  await prisma.player.update({
    where: { id: playerId, organizationId: session.organizationId },
    data: { photoUrl: stored.url },
  });

  revalidatePath("/league/players");
  revalidatePath(`/league/players/${playerId}`);
}
