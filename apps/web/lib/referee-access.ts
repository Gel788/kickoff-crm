import { prisma } from "@/lib/db";
import { canManageLeague, type SessionPayload } from "@/lib/auth";

export async function userAssignedToFixture(
  fixtureId: string,
  userId: string,
) {
  return prisma.refereeAssignment.findFirst({
    where: { fixtureId, userId },
  });
}

export async function requireFixtureRefereeOrLeague(
  fixtureId: string,
  session: SessionPayload,
) {
  if (canManageLeague(session.role)) return;
  const assignment = await userAssignedToFixture(fixtureId, session.userId);
  if (!assignment) throw new Error("FORBIDDEN");
}
