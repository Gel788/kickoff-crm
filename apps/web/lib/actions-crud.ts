"use server";

import { prisma } from "@/lib/db";
import { canManageLeague, requireSession } from "@/lib/auth";
import { FixtureStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function revalidateLeague() {
  revalidatePath("/league/clubs");
  revalidatePath("/league/players");
  revalidatePath("/league/calendar");
  revalidatePath("/league/dashboard");
  revalidatePath("/league/disciplinary");
  revalidatePath("/league/seasons");
}

export async function updateClub(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const shortName = String(formData.get("shortName") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim() || null;
  const primaryColor = String(formData.get("primaryColor") ?? "#00e676").trim();

  await prisma.club.update({
    where: { id, organizationId: session.organizationId },
    data: { name, shortName, venue, primaryColor },
  });

  revalidatePath(`/league/clubs/${id}`);
  revalidateLeague();
}

export async function removeClubFromSeason(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const clubId = String(formData.get("clubId") ?? "");
  const season = await prisma.season.findFirst({
    where: { organizationId: session.organizationId, isActive: true },
  });
  if (!season) throw new Error("NO_SEASON");

  const fixtures = await prisma.fixture.count({
    where: {
      OR: [{ homeClubId: clubId }, { awayClubId: clubId }],
      round: { division: { competition: { seasonId: season.id } } },
    },
  });
  if (fixtures > 0) redirect("/league/clubs?error=has_fixtures");

  await prisma.seasonRosterEntry.deleteMany({
    where: { clubId, seasonId: season.id },
  });
  await prisma.playerRegistration.deleteMany({
    where: { clubId, seasonId: season.id },
  });
  await prisma.seasonClub.delete({
    where: { seasonId_clubId: { seasonId: season.id, clubId } },
  });

  revalidateLeague();
  redirect("/league/clubs");
}

export async function deleteClub(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const clubId = String(formData.get("clubId") ?? "");

  const club = await prisma.club.findFirst({
    where: { id: clubId, organizationId: session.organizationId },
    include: {
      _count: {
        select: { homeFixtures: true, awayFixtures: true, registrations: true },
      },
    },
  });
  if (!club) throw new Error("NOT_FOUND");

  if (club._count.homeFixtures + club._count.awayFixtures > 0) {
    redirect("/league/clubs?error=has_fixtures");
  }

  await prisma.club.delete({ where: { id: clubId } });
  revalidateLeague();
  redirect("/league/clubs");
}

export async function updatePlayerRegistration(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const id = String(formData.get("id") ?? "");
  const shirtNumber = Number(formData.get("shirtNumber") ?? 0) || null;
  const position = String(formData.get("position") ?? "MF").trim();
  const ageCategory = String(formData.get("ageCategory") ?? "").trim() || null;
  const externalFifaId = String(formData.get("externalFifaId") ?? "").trim() || null;
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "");

  const reg = await prisma.playerRegistration.findFirst({
    where: {
      id,
      season: { organizationId: session.organizationId },
    },
    include: { player: true },
  });
  if (!reg) throw new Error("NOT_FOUND");

  await prisma.player.update({
    where: { id: reg.playerId },
    data: {
      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
      externalFifaId,
    },
  });

  await prisma.playerRegistration.update({
    where: { id },
    data: { shirtNumber, position, ageCategory },
  });

  revalidatePath(`/league/players/${id}`);
  revalidateLeague();
}

export async function deletePlayerRegistration(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const id = String(formData.get("registrationId") ?? "");

  const reg = await prisma.playerRegistration.findFirst({
    where: {
      id,
      season: { organizationId: session.organizationId },
    },
  });
  if (!reg) throw new Error("NOT_FOUND");

  const inSquad = await prisma.squadLineup.count({
    where: { registrationId: id },
  });
  if (inSquad > 0) redirect("/league/players?error=in_squad");

  await prisma.seasonRosterEntry.deleteMany({ where: { registrationId: id } });
  await prisma.disciplinaryRecord.deleteMany({ where: { registrationId: id } });
  await prisma.disciplinaryCase.deleteMany({ where: { registrationId: id } });
  await prisma.medicalClearance.deleteMany({ where: { registrationId: id } });
  await prisma.playerRegistration.delete({ where: { id } });

  const otherRegs = await prisma.playerRegistration.count({
    where: { playerId: reg.playerId },
  });
  if (otherRegs === 0) {
    await prisma.playerDocument.deleteMany({ where: { playerId: reg.playerId } });
    await prisma.guardianLink.deleteMany({ where: { playerId: reg.playerId } });
    await prisma.player.delete({ where: { id: reg.playerId } });
  }

  revalidateLeague();
  redirect("/league/players");
}

export async function deletePlayerDocument(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const docId = String(formData.get("documentId") ?? "");
  const registrationId = String(formData.get("registrationId") ?? "");

  const doc = await prisma.playerDocument.findFirst({
    where: {
      id: docId,
      player: { organizationId: session.organizationId },
    },
  });
  if (!doc) throw new Error("NOT_FOUND");

  await prisma.playerDocument.delete({ where: { id: docId } });

  revalidatePath(`/league/players/${registrationId}`);
  revalidatePath("/league/players");
}

export async function deleteFixture(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const fixtureId = String(formData.get("fixtureId") ?? "");

  const fixture = await prisma.fixture.findFirst({
    where: {
      id: fixtureId,
      round: {
        division: {
          competition: { season: { organizationId: session.organizationId } },
        },
      },
    },
  });
  if (!fixture) throw new Error("NOT_FOUND");

  if (
    fixture.status !== FixtureStatus.SCHEDULED &&
    fixture.status !== FixtureStatus.SQUADS_OPEN
  ) {
    redirect(`/league/calendar?error=fixture_started`);
  }

  await prisma.fixture.delete({ where: { id: fixtureId } });
  revalidateLeague();
  redirect("/league/calendar");
}

export async function createManualDisciplinary(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const registrationId = String(formData.get("registrationId") ?? "");
  const matchesBanned = Number(formData.get("matchesBanned") ?? 1);
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) throw new Error("NO_REASON");

  await prisma.disciplinaryRecord.create({
    data: {
      registrationId,
      matchesBanned,
      reason,
      active: true,
    },
  });

  await prisma.disciplinaryCase.create({
    data: {
      registrationId,
      sourceType: "MANUAL",
      status: "RESOLVED",
      matchesBanned,
      committeeNotes: reason,
      resolvedAt: new Date(),
    },
  });

  await prisma.playerRegistration.update({
    where: { id: registrationId },
    data: { eligibility: "SUSPENDED" },
  });

  revalidatePath("/league/disciplinary");
  revalidatePath("/league/players");
}

export async function deleteDisciplinaryRecord(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const id = String(formData.get("recordId") ?? "");
  const record = await prisma.disciplinaryRecord.findFirst({
    where: {
      id,
      registration: { season: { organizationId: session.organizationId } },
    },
  });
  if (!record) throw new Error("NOT_FOUND");

  await prisma.disciplinaryRecord.delete({ where: { id } });
  await prisma.playerRegistration.update({
    where: { id: record.registrationId },
    data: { eligibility: "ELIGIBLE" },
  });

  revalidatePath("/league/disciplinary");
}

export async function activateSeason(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const seasonId = String(formData.get("seasonId") ?? "");

  await prisma.season.updateMany({
    where: { organizationId: session.organizationId },
    data: { isActive: false },
  });
  await prisma.season.update({
    where: { id: seasonId, organizationId: session.organizationId },
    data: { isActive: true },
  });

  revalidatePath("/league/seasons");
  revalidatePath("/league/dashboard");
  redirect("/league/dashboard");
}
