"use server";

import { prisma } from "@/lib/db";
import { canManageLeague, requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updatePlayerFifaId(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const playerId = String(formData.get("playerId") ?? "");
  const externalFifaId = String(formData.get("externalFifaId") ?? "").trim() || null;

  await prisma.player.update({
    where: { id: playerId, organizationId: session.organizationId },
    data: { externalFifaId },
  });

  revalidatePath(`/league/players`);
}

export async function exportFifaRegistrationsCsv(seasonId: string) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const regs = await prisma.playerRegistration.findMany({
    where: { seasonId, season: { organizationId: session.organizationId } },
    include: { player: true, club: true },
  });

  const header = "fifa_id,first_name,last_name,dob,club,shirt,position,age_category\n";
  const rows = regs
    .map((r) => {
      const dob = r.player.dateOfBirth.toISOString().slice(0, 10);
      return [
        r.player.externalFifaId ?? "",
        r.player.firstName,
        r.player.lastName,
        dob,
        r.club.shortName,
        r.shirtNumber ?? "",
        r.position ?? "",
        r.ageCategory ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    })
    .join("\n");

  return header + rows;
}
