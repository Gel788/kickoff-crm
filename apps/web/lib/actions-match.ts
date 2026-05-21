"use server";

import { prisma } from "@/lib/db";
import { canManageLeague, requireSession } from "@/lib/auth";
import { MatchPhase } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function ensureFixtureChecklist(fixtureId: string) {
  return prisma.fixtureChecklist.upsert({
    where: { fixtureId },
    create: { fixtureId },
    update: {},
  });
}

export async function updateRefereeChecklist(
  fixtureId: string,
  field: "squadsOk" | "captainsOk" | "coinTossOk",
  value: boolean,
) {
  const session = await requireSession();
  const { requireFixtureRefereeOrLeague } = await import("@/lib/referee-access");
  await requireFixtureRefereeOrLeague(fixtureId, session);

  await ensureFixtureChecklist(fixtureId);
  await prisma.fixtureChecklist.update({
    where: { fixtureId },
    data: { [field]: value },
  });
  revalidatePath(`/referee/match/${fixtureId}`);
  revalidatePath(`/league/fixtures/${fixtureId}`);
}

export async function updateLeagueChecklist(
  fixtureId: string,
  field: "eventsOk" | "signaturesOk" | "leagueReady",
  value: boolean,
) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  await ensureFixtureChecklist(fixtureId);
  await prisma.fixtureChecklist.update({
    where: { fixtureId },
    data: { [field]: value },
  });
  revalidatePath(`/league/fixtures/${fixtureId}`);
}

export async function setMatchPhase(fixtureId: string, phase: MatchPhase) {
  const session = await requireSession();
  const { requireFixtureRefereeOrLeague } = await import("@/lib/referee-access");
  await requireFixtureRefereeOrLeague(fixtureId, session);

  const now = new Date();
  const timeField =
    phase === "FIRST_HALF"
      ? { kickoffAt: now }
      : phase === "HALFTIME"
        ? { halftimeAt: now }
        : phase === "SECOND_HALF"
          ? { secondHalfAt: now }
          : phase === "FULL_TIME"
            ? { fullTimeAt: now }
            : {};

  await prisma.fixture.update({
    where: { id: fixtureId },
    data: { matchPhase: phase, ...timeField },
  });

  revalidatePath(`/referee/match/${fixtureId}`);
  revalidatePath(`/league/fixtures/${fixtureId}`);
}

export async function addRefereeNote(fixtureId: string, notes: string) {
  const session = await requireSession();
  await prisma.matchEvent.create({
    data: {
      fixtureId,
      type: "OTHER",
      minute: 0,
      teamClubId: (await prisma.fixture.findUnique({ where: { id: fixtureId } }))!
        .homeClubId,
      notes,
      createdById: session.userId,
    },
  });
  revalidatePath(`/referee/match/${fixtureId}`);
}
