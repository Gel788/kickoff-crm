"use server";

import { prisma } from "@/lib/db";
import { canManageLeague, requireSession } from "@/lib/auth";
import { notifyClubStaff } from "@/lib/notify-hub";
import { FixtureStatus, SquadStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function postponeFixture(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const fixtureId = String(formData.get("fixtureId") ?? "");
  const newDate = String(formData.get("scheduledAt") ?? "");
  const reason = String(formData.get("reason") ?? "Перенос").trim();

  const fixture = await prisma.fixture.findUnique({
    where: { id: fixtureId },
    include: { homeClub: true, awayClub: true },
  });
  if (!fixture) throw new Error("NOT_FOUND");

  await prisma.fixture.update({
    where: { id: fixtureId },
    data: {
      scheduledAt: new Date(newDate),
      status:
        fixture.status === FixtureStatus.LIVE
          ? fixture.status
          : FixtureStatus.SCHEDULED,
    },
  });

  await prisma.squadSubmission.updateMany({
    where: { fixtureId, status: { not: SquadStatus.LOCKED } },
    data: {
      status: SquadStatus.DRAFT,
      submittedAt: null,
      rejectReason: null,
      rejectedAt: null,
    },
  });

  await prisma.auditLog.create({
    data: {
      fixtureId,
      organizationId: session.organizationId,
      action: "FIXTURE_POSTPONED",
      details: `${reason} → ${newDate}`,
      userId: session.userId,
    },
  });

  const link = `/league/fixtures/${fixtureId}`;
  const title = "Матч перенесён";
  const body = `${fixture.homeClub.name} — ${fixture.awayClub.name}. ${reason}. Новое время: ${new Date(newDate).toLocaleString("ru-RU")}`;

  await notifyClubStaff(fixture.homeClubId, session.organizationId, title, body, link);
  await notifyClubStaff(fixture.awayClubId, session.organizationId, title, body, link);

  const assignments = await prisma.refereeAssignment.findMany({
    where: { fixtureId },
    include: { user: true },
  });
  if (assignments.length > 0) {
    const { notifyUser } = await import("@/lib/notify-hub");
    for (const assignment of assignments) {
      await notifyUser(
        assignment.userId,
        title,
        body,
        `/referee/match/${fixtureId}`,
        assignment.user.email,
      );
    }
  }

  revalidatePath(`/league/fixtures/${fixtureId}`);
  revalidatePath("/league/calendar");
  revalidatePath("/league/dashboard");
}

export async function rejectSquad(formData: FormData) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const fixtureId = String(formData.get("fixtureId") ?? "");
  const clubId = String(formData.get("clubId") ?? "");
  const reason = String(formData.get("reason") ?? "Отклонено лигой").trim();

  const fixture = await prisma.fixture.findUnique({
    where: { id: fixtureId },
    include: { homeClub: true, awayClub: true },
  });
  if (!fixture) throw new Error("NOT_FOUND");

  await prisma.squadSubmission.update({
    where: { fixtureId_clubId: { fixtureId, clubId } },
    data: {
      status: SquadStatus.DRAFT,
      submittedAt: null,
      rejectReason: reason,
      rejectedAt: new Date(),
    },
  });

  await prisma.fixture.update({
    where: { id: fixtureId },
    data: { status: FixtureStatus.SQUADS_OPEN },
  });

  await prisma.auditLog.create({
    data: {
      fixtureId,
      organizationId: session.organizationId,
      action: "SQUAD_REJECTED",
      details: reason,
      userId: session.userId,
    },
  });

  await notifyClubStaff(
    clubId,
    session.organizationId,
    "Заявка отклонена",
    reason,
    `/club`,
  );

  revalidatePath(`/league/fixtures/${fixtureId}`);
  revalidatePath("/club");
}

export async function reopenMatch(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "LEAGUE_OWNER" && session.role !== "PLATFORM_ADMIN") {
    throw new Error("FORBIDDEN");
  }

  const fixtureId = String(formData.get("fixtureId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim() || "без комментария";

  await prisma.fixture.update({
    where: { id: fixtureId },
    data: { status: FixtureStatus.PROTOCOL_REVIEW },
  });

  await prisma.auditLog.create({
    data: {
      fixtureId,
      organizationId: session.organizationId,
      action: "MATCH_REOPENED",
      details: `${session.email}: ${reason}`,
      userId: session.userId,
    },
  });

  revalidatePath(`/league/fixtures/${fixtureId}`);
  revalidatePath("/league/standings");
}

export async function sendSquadDeadlineReminders(seasonId: string) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const season = await prisma.season.findUnique({ where: { id: seasonId } });
  if (!season) throw new Error("NO_SEASON");

  const now = new Date();
  const fixtures = await prisma.fixture.findMany({
    where: {
      status: FixtureStatus.SQUADS_OPEN,
      round: { division: { competition: { seasonId } } },
    },
    include: { homeClub: true, awayClub: true, squads: true },
  });

  let sent = 0;
  for (const f of fixtures) {
    const hoursLeft =
      (f.scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursLeft > season.squadDeadlineHours || hoursLeft < 0) continue;

    for (const clubId of [f.homeClubId, f.awayClubId]) {
      const squad = f.squads.find((s) => s.clubId === clubId);
      if (squad?.status === SquadStatus.SUBMITTED) continue;
      await notifyClubStaff(
        clubId,
        session.organizationId,
        "Дедлайн заявки",
        `До матча ${f.homeClub.shortName}—${f.awayClub.shortName} осталось ${Math.round(hoursLeft)} ч. Подайте заявку.`,
        "/club",
      );
      sent++;
    }
  }

  revalidatePath("/league/dashboard");
  return sent;
}
