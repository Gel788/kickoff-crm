"use server";

import { prisma } from "@/lib/db";
import { canManageLeague, requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function toggleSeasonRoster(
  seasonId: string,
  clubId: string,
  registrationId: string,
) {
  const session = await requireSession();

  const reg = await prisma.playerRegistration.findFirst({
    where: { id: registrationId, clubId, seasonId },
  });
  if (!reg) throw new Error("NOT_FOUND");

  const existing = await prisma.seasonRosterEntry.findUnique({
    where: {
      seasonId_clubId_registrationId: {
        seasonId,
        clubId,
        registrationId,
      },
    },
  });

  const season = await prisma.season.findUnique({ where: { id: seasonId } });
  if (!season) throw new Error("NO_SEASON");

  if (existing) {
    await prisma.seasonRosterEntry.delete({ where: { id: existing.id } });
  } else {
    const count = await prisma.seasonRosterEntry.count({
      where: { seasonId, clubId },
    });
    if (count >= season.maxSquadSize) {
      const path = session.clubId === clubId ? "/club/roster" : `/league/clubs/${clubId}`;
      redirect(`${path}?error=roster_limit`);
    }

    await prisma.seasonRosterEntry.create({
      data: { seasonId, clubId, registrationId },
    });
  }

  const path = session.clubId === clubId ? "/club/roster" : `/league/clubs/${clubId}`;
  revalidatePath(path);
  revalidatePath("/club");
  revalidatePath("/league/players");
}

export async function fillSeasonRosterFromEligible(
  seasonId: string,
  clubId: string,
) {
  const session = await requireSession();
  const season = await prisma.season.findUnique({ where: { id: seasonId } });
  if (!season) throw new Error("NO_SEASON");

  const eligible = await prisma.playerRegistration.findMany({
    where: { seasonId, clubId, eligibility: "ELIGIBLE" },
    take: season.maxSquadSize,
  });

  await prisma.seasonRosterEntry.deleteMany({ where: { seasonId, clubId } });
  for (const r of eligible) {
    await prisma.seasonRosterEntry.create({
      data: { seasonId, clubId, registrationId: r.id },
    });
  }

  revalidatePath(session.clubId === clubId ? "/club/roster" : `/league/clubs/${clubId}`);
  revalidatePath("/club");
}

export async function clearSeasonRoster(formData: FormData) {
  const session = await requireSession();
  const seasonId = String(formData.get("seasonId") ?? "");
  const clubId = String(formData.get("clubId") ?? "");

  const allowed =
    session.clubId === clubId || canManageLeague(session.role);
  if (!allowed) throw new Error("FORBIDDEN");

  await prisma.seasonRosterEntry.deleteMany({ where: { seasonId, clubId } });

  const path = session.clubId === clubId ? "/club/roster" : `/league/clubs/${clubId}`;
  revalidatePath(path);
  revalidatePath("/club");
}

export async function toggleSeasonRosterAction(formData: FormData) {
  await toggleSeasonRoster(
    String(formData.get("seasonId") ?? ""),
    String(formData.get("clubId") ?? ""),
    String(formData.get("registrationId") ?? ""),
  );
}

export async function fillSeasonRosterAction(formData: FormData) {
  await fillSeasonRosterFromEligible(
    String(formData.get("seasonId") ?? ""),
    String(formData.get("clubId") ?? ""),
  );
}
