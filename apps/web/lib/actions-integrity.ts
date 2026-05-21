"use server";

import { prisma } from "@/lib/db";
import { canManageLeague, requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function signProtocol(
  fixtureId: string,
  role: "REFEREE" | "DELEGATE_HOME" | "DELEGATE_AWAY",
) {
  const session = await requireSession();

  await prisma.matchSignature.upsert({
    where: {
      fixtureId_role: { fixtureId, role },
    },
    create: {
      fixtureId,
      role,
      userId: session.userId,
      refused: false,
    },
    update: {
      userId: session.userId,
      signedAt: new Date(),
      refused: false,
      refuseReason: null,
    },
  });

  revalidatePath(`/league/fixtures/${fixtureId}`);
}

export async function refuseSignature(
  fixtureId: string,
  role: "DELEGATE_HOME" | "DELEGATE_AWAY",
  reason: string,
) {
  const session = await requireSession();

  await prisma.matchSignature.upsert({
    where: {
      fixtureId_role: { fixtureId, role },
    },
    create: {
      fixtureId,
      role,
      userId: session.userId,
      refused: true,
      refuseReason: reason,
    },
    update: {
      refused: true,
      refuseReason: reason,
      signedAt: new Date(),
    },
  });

  revalidatePath(`/league/fixtures/${fixtureId}`);
}

export async function openDispute(fixtureId: string, clubId: string, reason: string) {
  const session = await requireSession();

  await prisma.dispute.create({
    data: { fixtureId, clubId, reason },
  });

  await prisma.fixture.update({
    where: { id: fixtureId },
    data: { status: "DISPUTED" },
  });

  const orgId = session.organizationId;
  const ops = await prisma.membership.findMany({
    where: {
      organizationId: orgId,
      role: { in: ["LEAGUE_OPERATOR", "LEAGUE_OWNER", "DISCIPLINARY"] },
    },
  });
  for (const m of ops) {
    await prisma.notification.create({
      data: {
        userId: m.userId,
        title: "Спор по матчу",
        body: reason.slice(0, 120),
        link: `/league/fixtures/${fixtureId}`,
      },
    });
  }

  revalidatePath(`/league/fixtures/${fixtureId}`);
}

export async function resolveDispute(
  disputeId: string,
  resolution: string,
  accept: boolean,
) {
  const session = await requireSession();
  if (!canManageLeague(session.role) && session.role !== "DISCIPLINARY") {
    throw new Error("FORBIDDEN");
  }

  const dispute = await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      resolution,
      status: accept ? "RESOLVED" : "REJECTED",
    },
  });

  if (accept) {
    await prisma.fixture.update({
      where: { id: dispute.fixtureId },
      data: { status: "PROTOCOL_REVIEW" },
    });
  } else {
    await prisma.fixture.update({
      where: { id: dispute.fixtureId },
      data: { status: "CLOSED" },
    });
  }

  revalidatePath(`/league/fixtures/${dispute.fixtureId}`);
  revalidatePath("/league/disciplinary");
}

export async function serveBan(recordId: string) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const record = await prisma.disciplinaryRecord.update({
    where: { id: recordId },
    data: { matchesServed: { increment: 1 } },
  });

  if (record.matchesServed + 1 >= record.matchesBanned) {
    await prisma.disciplinaryRecord.update({
      where: { id: recordId },
      data: { active: false },
    });
    await prisma.playerRegistration.update({
      where: { id: record.registrationId },
      data: { eligibility: "ELIGIBLE" },
    });
  }

  revalidatePath("/league/disciplinary");
  revalidatePath("/league/players");
}

export async function appealDisciplinaryCase(formData: FormData) {
  await requireSession();
  const caseId = String(formData.get("caseId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  await prisma.disciplinaryCase.update({
    where: { id: caseId },
    data: {
      status: "APPEALED",
      appealReason: reason,
      sourceType: "APPEAL",
    },
  });

  revalidatePath("/league/disciplinary");
}

export async function resolveDisciplinaryCase(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role) && session.role !== "DISCIPLINARY") {
    throw new Error("FORBIDDEN");
  }

  const caseId = String(formData.get("caseId") ?? "");
  const decision = String(formData.get("decision") ?? "").trim();
  const accept = formData.get("accept") === "on";

  const c = await prisma.disciplinaryCase.update({
    where: { id: caseId },
    data: {
      status: accept ? "RESOLVED" : "REJECTED",
      appealDecision: decision,
      committeeNotes: decision,
      resolvedAt: new Date(),
    },
  });

  if (accept) {
    await prisma.disciplinaryRecord.updateMany({
      where: { registrationId: c.registrationId, active: true },
      data: { active: false },
    });
    await prisma.playerRegistration.update({
      where: { id: c.registrationId },
      data: { eligibility: "ELIGIBLE" },
    });
  }

  revalidatePath("/league/disciplinary");
}
