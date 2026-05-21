"use server";

import { prisma } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/actions-platform";
import { revalidatePath } from "next/cache";

const PLANS: Record<string, { maxClubs: number; maxPlayers: number; maxMatches: number }> = {
  pilot: { maxClubs: 32, maxPlayers: 2000, maxMatches: 500 },
  pro: { maxClubs: 64, maxPlayers: 5000, maxMatches: 2000 },
  enterprise: { maxClubs: 500, maxPlayers: 50000, maxMatches: 20000 },
};

export async function updateOrganizationPlan(formData: FormData) {
  await requirePlatformAdmin();

  const orgId = String(formData.get("organizationId") ?? "");
  const plan = String(formData.get("plan") ?? "pilot");
  const limits = PLANS[plan] ?? PLANS.pilot;

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      plan,
      maxClubs: limits.maxClubs,
      maxPlayers: limits.maxPlayers,
      maxMatchesPerSeason: limits.maxMatches,
      subscriptionEnd: new Date(Date.now() + 365 * 86400000),
    },
  });

  revalidatePath("/platform");
}
