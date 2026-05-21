"use server";

import { prisma } from "@/lib/db";
import { canManageLeague, requireSession } from "@/lib/auth";
import { MedicalStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function setMedicalClearance(
  registrationId: string,
  fixtureId: string,
  status: MedicalStatus,
  notes?: string,
) {
  await requireSession();

  await prisma.medicalClearance.create({
    data: {
      registrationId,
      fixtureId,
      status,
      notes,
      clearedUntil:
        status === "CLEARED"
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          : null,
    },
  });

  if (status === "NOT_CLEARED") {
    await prisma.playerRegistration.update({
      where: { id: registrationId },
      data: { eligibility: "SUSPENDED" },
    });
  }

  revalidatePath(`/league/fixtures/${fixtureId}`);
}

export async function updateMedicalReport(fixtureId: string, formData: FormData) {
  const session = await requireSession();
  if (
    !canManageLeague(session.role) &&
    session.role !== "MEDICAL_LEAGUE" &&
    session.role !== "MEDICAL_CLUB"
  ) {
    throw new Error("FORBIDDEN");
  }

  const summary = String(formData.get("summary") ?? "");
  const injuries = String(formData.get("injuries") ?? "");

  await prisma.medicalReport.upsert({
    where: { fixtureId },
    create: { fixtureId, summary, injuries },
    update: { summary, injuries },
  });

  revalidatePath(`/league/fixtures/${fixtureId}`);
}
