"use server";

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function recordGuardianConsent(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "GUARDIAN") throw new Error("FORBIDDEN");

  const linkId = String(formData.get("linkId") ?? "");
  const agreed = formData.get("agreed") === "on";
  if (!agreed) throw new Error("CONSENT_REQUIRED");

  await prisma.guardianLink.updateMany({
    where: { id: linkId, userId: session.userId, revokedAt: null },
    data: { consentAt: new Date() },
  });

  revalidatePath("/guardian");
}
