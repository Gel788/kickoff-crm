"use server";

import { prisma } from "@/lib/db";
import { canManageLeague, requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSeason(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const name = String(formData.get("name") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");

  await prisma.season.updateMany({
    where: { organizationId: session.organizationId, isActive: true },
    data: { isActive: false },
  });

  const season = await prisma.season.create({
    data: {
      organizationId: session.organizationId,
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: true,
    },
  });

  await prisma.competition.create({
    data: {
      seasonId: season.id,
      name: "Чемпионат",
      divisions: { create: { name: "Основной дивизион" } },
    },
  });

  await prisma.seasonRegulation.create({
    data: {
      seasonId: season.id,
      rules: {
        squadDeadlineHours: 48,
        maxBench: 7,
        minStarters: 7,
        yellowBanThreshold: 3,
        yellowBanMatches: 1,
        redBanMatches: 1,
        maxSquadSize: 25,
        pointsWin: 3,
        pointsDraw: 1,
        pointsLoss: 0,
      },
      createdBy: session.userId,
    },
  });

  revalidatePath("/league/seasons");
  revalidatePath("/league/settings");
}

export async function updateSeasonRegulation(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const seasonId = String(formData.get("seasonId") ?? "");
  const rules = {
    squadDeadlineHours: Number(formData.get("squadDeadlineHours") ?? 48),
    maxBench: Number(formData.get("maxBench") ?? 7),
    minStarters: Number(formData.get("minStarters") ?? 7),
    yellowBanThreshold: Number(formData.get("yellowBanThreshold") ?? 3),
    yellowBanMatches: Number(formData.get("yellowBanMatches") ?? 1),
    redBanMatches: Number(formData.get("redBanMatches") ?? 1),
    maxSquadSize: Number(formData.get("maxSquadSize") ?? 25),
    pointsWin: Number(formData.get("pointsWin") ?? 3),
    pointsDraw: Number(formData.get("pointsDraw") ?? 1),
    pointsLoss: Number(formData.get("pointsLoss") ?? 0),
  };

  await prisma.season.update({
    where: { id: seasonId },
    data: {
      squadDeadlineHours: rules.squadDeadlineHours,
      maxBench: rules.maxBench,
      minStarters: rules.minStarters,
      yellowBanThreshold: rules.yellowBanThreshold,
      yellowBanMatches: rules.yellowBanMatches,
      redBanMatches: rules.redBanMatches,
      maxSquadSize: rules.maxSquadSize,
    },
  });

  const existing = await prisma.seasonRegulation.findUnique({
    where: { seasonId },
  });
  if (existing) {
    await prisma.seasonRegulation.update({
      where: { seasonId },
      data: {
        version: existing.version + 1,
        rules,
        createdBy: session.userId,
      },
    });
  } else {
    await prisma.seasonRegulation.create({
      data: {
        seasonId,
        rules,
        createdBy: session.userId,
      },
    });
  }

  revalidatePath("/league/regulations");
  revalidatePath("/league/settings");
}

export async function createFixture(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const roundId = String(formData.get("roundId") ?? "");
  const homeClubId = String(formData.get("homeClubId") ?? "");
  const awayClubId = String(formData.get("awayClubId") ?? "");
  const scheduledAt = String(formData.get("scheduledAt") ?? "");
  const venue = String(formData.get("venue") ?? "") || null;

  if (homeClubId === awayClubId) redirect("/league/calendar?error=same_club");

  await prisma.fixture.create({
    data: {
      roundId,
      homeClubId,
      awayClubId,
      scheduledAt: new Date(scheduledAt),
      venue,
      status: "SCHEDULED",
    },
  });

  revalidatePath("/league/calendar");
  revalidatePath("/league/settings");
  redirect("/league/calendar?flash=match_created");
}

export async function createRound(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const divisionId = String(formData.get("divisionId") ?? "");
  const number = Number(formData.get("number") ?? 1);
  const name = String(formData.get("name") ?? "") || `Тур ${number}`;

  await prisma.round.create({
    data: { divisionId, number, name },
  });

  revalidatePath("/league/settings");
  revalidatePath("/league/competitions");
  revalidatePath("/league/calendar");
  redirect("/league/calendar?flash=round_created");
}

export async function generateRoundRobin(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const divisionId = String(formData.get("divisionId") ?? "");
  const seasonId = String(formData.get("seasonId") ?? "");
  const roundNumber = Number(formData.get("roundNumber") ?? 1);
  const startDate = new Date(String(formData.get("startDate") ?? ""));

  const seasonClubs = await prisma.seasonClub.findMany({
    where: { seasonId },
    include: { club: true },
  });

  const clubs = seasonClubs.map((s) => s.club);
  if (clubs.length < 2) redirect("/league/calendar?error=need_clubs");

  const round = await prisma.round.create({
    data: { divisionId, number: roundNumber, name: `Тур ${roundNumber}` },
  });

  let day = 0;
  for (let i = 0; i < clubs.length; i++) {
    for (let j = i + 1; j < clubs.length; j++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + day);
      d.setHours(15, 0, 0, 0);
      await prisma.fixture.create({
        data: {
          roundId: round.id,
          homeClubId: clubs[i].id,
          awayClubId: clubs[j].id,
          scheduledAt: d,
          venue: clubs[i].venue,
          status: "SCHEDULED",
        },
      });
      day++;
    }
  }

  revalidatePath("/league/calendar");
  revalidatePath("/league/settings");
  redirect("/league/calendar?flash=tour_generated");
}
