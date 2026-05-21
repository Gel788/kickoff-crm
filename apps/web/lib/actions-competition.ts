"use server";

import { prisma } from "@/lib/db";
import { canManageLeague, requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function revalidateCompetition() {
  revalidatePath("/league/competitions");
  revalidatePath("/league/calendar");
  revalidatePath("/league/settings");
}

export async function createCompetition(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const seasonId = String(formData.get("seasonId") ?? "");
  const name = String(formData.get("name") ?? "").trim() || "Чемпионат";

  const comp = await prisma.competition.create({
    data: {
      seasonId,
      name,
      divisions: { create: { name: "Основной дивизион" } },
    },
  });

  void comp;
  revalidateCompetition();
}

export async function updateCompetition(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  await prisma.competition.updateMany({
    where: {
      id,
      season: { organizationId: session.organizationId },
    },
    data: { name },
  });

  revalidateCompetition();
}

export async function createDivision(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const competitionId = String(formData.get("competitionId") ?? "");
  const name = String(formData.get("name") ?? "").trim() || "Дивизион";

  await prisma.division.create({
    data: { competitionId, name },
  });

  revalidateCompetition();
}

export async function deleteDivision(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const id = String(formData.get("divisionId") ?? "");

  const fixtures = await prisma.fixture.count({
    where: { round: { divisionId: id } },
  });
  if (fixtures > 0) redirect("/league/competitions?error=has_fixtures");

  await prisma.division.delete({ where: { id } });
  revalidateCompetition();
}

export async function deleteRound(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const id = String(formData.get("roundId") ?? "");

  const fixtures = await prisma.fixture.count({ where: { roundId: id } });
  if (fixtures > 0) redirect("/league/competitions?error=has_fixtures");

  await prisma.round.delete({ where: { id } });
  revalidateCompetition();
}
