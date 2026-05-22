"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { MatchRsvpStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function setMatchRsvp(
  fixtureId: string,
  registrationId: string,
  status: MatchRsvpStatus,
) {
  const session = await getSession();
  if (!session?.clubId) throw new Error("FORBIDDEN");

  const reg = await prisma.playerRegistration.findFirst({
    where: {
      id: registrationId,
      clubId: session.clubId,
    },
  });
  if (!reg) throw new Error("NOT_FOUND");

  const fixture = await prisma.fixture.findFirst({
    where: {
      id: fixtureId,
      OR: [{ homeClubId: session.clubId }, { awayClubId: session.clubId }],
      status: { in: ["SCHEDULED", "SQUADS_OPEN"] },
    },
  });
  if (!fixture) throw new Error("FIXTURE_CLOSED");

  await prisma.matchRsvp.upsert({
    where: {
      fixtureId_registrationId: { fixtureId, registrationId },
    },
    create: { fixtureId, registrationId, status },
    update: { status },
  });

  revalidatePath("/club");
}
