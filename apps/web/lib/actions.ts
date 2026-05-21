"use server";

import { prisma } from "@/lib/db";
import {
  canManageLeague,
  destroySession,
  loginUser,
  requireSession,
} from "@/lib/auth";
import {
  EligibilityStatus,
  FixtureStatus,
  MatchEventType,
  SquadStatus,
} from "@prisma/client";
import { processCardDiscipline } from "@/lib/discipline";
import { getIneligibilityReason } from "@/lib/eligibility";
import { ensureFixtureChecklist } from "@/lib/actions-match";
import { notifyClubStaff, notifyLeague } from "@/lib/notify-hub";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const result = await loginUser(email, password);
  if (!result) redirect("/login?error=1");
  if ("needs2fa" in result) {
    redirect(`/login/2fa?token=${encodeURIComponent(result.token)}`);
  }
  if (result.role === "PLATFORM_ADMIN") redirect("/platform");
  if (result.role === "REFEREE_CHIEF" || result.role === "REFEREE_ASSISTANT") {
    redirect("/referee");
  }
  if (result.role === "GUARDIAN") redirect("/guardian");
  if (result.role === "CLUB_DELEGATE") redirect("/club/delegate");
  if (result.clubId) redirect("/club");
  redirect("/league/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

async function recalcScore(fixtureId: string) {
  const events = await prisma.matchEvent.findMany({
    where: {
      fixtureId,
      type: { in: ["GOAL", "OWN_GOAL", "PENALTY_SCORED"] },
    },
    include: { fixture: true },
  });

  let home = 0;
  let away = 0;
  const f = await prisma.fixture.findUnique({ where: { id: fixtureId } });
  if (!f) return;

  for (const e of events) {
    const isHome = e.teamClubId === f.homeClubId;
    if (e.type === "OWN_GOAL") {
      if (isHome) away++;
      else home++;
    } else if (isHome) home++;
    else away++;
  }

  await prisma.fixture.update({
    where: { id: fixtureId },
    data: { homeScore: home, awayScore: away },
  });
}

export async function updatePlayerEligibility(
  registrationId: string,
  status: EligibilityStatus,
) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  await prisma.playerRegistration.update({
    where: { id: registrationId },
    data: { eligibility: status },
  });
  revalidatePath("/league/players");
}

export async function openSquads(fixtureId: string) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const fixture = await prisma.fixture.findUnique({
    where: { id: fixtureId },
    include: { homeClub: true, awayClub: true },
  });
  if (!fixture) throw new Error("NOT_FOUND");

  await prisma.fixture.update({
    where: { id: fixtureId },
    data: { status: FixtureStatus.SQUADS_OPEN },
  });

  await ensureFixtureChecklist(fixtureId);

  for (const clubId of [fixture.homeClubId, fixture.awayClubId]) {
    await prisma.squadSubmission.upsert({
      where: { fixtureId_clubId: { fixtureId, clubId } },
      create: { fixtureId, clubId, status: SquadStatus.DRAFT },
      update: {},
    });
    await notifyClubStaff(
      clubId,
      session.organizationId,
      "Окно заявки открыто",
      `${fixture.homeClub.name} — ${fixture.awayClub.name}. Подайте состав до дедлайна.`,
      "/club",
    );
  }

  revalidatePath(`/league/fixtures/${fixtureId}`);
  revalidatePath("/league/calendar");
}

export async function saveSquad(
  fixtureId: string,
  clubId: string,
  registrationIds: string[],
  captainId: string,
) {
  await requireSession();
  const fixture = await prisma.fixture.findUnique({ where: { id: fixtureId } });
  if (!fixture || fixture.status === FixtureStatus.SQUADS_LOCKED) {
    throw new Error("LOCKED");
  }

  const submission = await prisma.squadSubmission.upsert({
    where: { fixtureId_clubId: { fixtureId, clubId } },
    create: { fixtureId, clubId, status: SquadStatus.DRAFT },
    update: {},
  });

  await prisma.squadLineup.deleteMany({ where: { submissionId: submission.id } });

  for (let i = 0; i < registrationIds.length; i++) {
    const regId = registrationIds[i];
    const reg = await prisma.playerRegistration.findUnique({ where: { id: regId } });
    if (!reg || reg.clubId !== clubId) {
      throw new Error(`Игрок недопущен: ${regId}`);
    }
    const reason = await getIneligibilityReason(
      regId,
      reg.seasonId,
      clubId,
    );
    if (reason) {
      throw new Error(`${reason}`);
    }
    await prisma.squadLineup.create({
      data: {
        submissionId: submission.id,
        registrationId: regId,
        isStarter: i < 11,
        isCaptain: regId === captainId,
        sortOrder: i,
      },
    });
  }

  revalidatePath(`/league/fixtures/${fixtureId}`);
  revalidatePath("/club");
}

export async function submitSquad(fixtureId: string, clubId: string) {
  const session = await requireSession();

  await prisma.squadSubmission.update({
    where: { fixtureId_clubId: { fixtureId, clubId } },
    data: { status: SquadStatus.SUBMITTED, submittedAt: new Date() },
  });

  const squads = await prisma.squadSubmission.findMany({ where: { fixtureId } });
  if (squads.every((s) => s.status === SquadStatus.SUBMITTED)) {
    await prisma.fixture.update({
      where: { id: fixtureId },
      data: { status: FixtureStatus.SQUADS_SUBMITTED },
    });
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: { homeClub: true, awayClub: true },
    });
    if (fixture) {
      await notifyLeague(
        session.organizationId,
        "Заявки поданы",
        `${fixture.homeClub.shortName} — ${fixture.awayClub.shortName}: обе заявки на проверке`,
        `/league/fixtures/${fixtureId}`,
      );
    }
  }
  revalidatePath(`/league/fixtures/${fixtureId}`);
  revalidatePath("/club");
}

export async function approveSquads(fixtureId: string) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  await prisma.squadSubmission.updateMany({
    where: { fixtureId },
    data: { status: SquadStatus.APPROVED },
  });
  await prisma.fixture.update({
    where: { id: fixtureId },
    data: { status: FixtureStatus.SQUADS_APPROVED },
  });
  revalidatePath(`/league/fixtures/${fixtureId}`);
}

export async function lockSquads(fixtureId: string) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  await prisma.squadSubmission.updateMany({
    where: { fixtureId },
    data: { status: SquadStatus.LOCKED },
  });
  await prisma.fixture.update({
    where: { id: fixtureId },
    data: { status: FixtureStatus.SQUADS_LOCKED },
  });
  revalidatePath(`/league/fixtures/${fixtureId}`);
}

export async function startMatch(fixtureId: string) {
  const session = await requireSession();
  const { requireFixtureRefereeOrLeague } = await import("@/lib/referee-access");
  await requireFixtureRefereeOrLeague(fixtureId, session);

  await ensureFixtureChecklist(fixtureId);
  const checklist = await prisma.fixtureChecklist.findUnique({
    where: { fixtureId },
  });
  if (!checklist?.squadsOk || !checklist?.captainsOk) {
    throw new Error("CHECKLIST_INCOMPLETE");
  }

  await prisma.fixture.update({
    where: { id: fixtureId },
    data: {
      status: FixtureStatus.LIVE,
      matchPhase: "FIRST_HALF",
      kickoffAt: new Date(),
    },
  });
  revalidatePath(`/referee/match/${fixtureId}`);
  revalidatePath(`/league/fixtures/${fixtureId}`);
}

export async function addMatchEvent(
  fixtureId: string,
  data: {
    type: MatchEventType;
    minute: number;
    teamClubId: string;
    registrationId?: string;
    secondaryRegId?: string;
    notes?: string;
  },
) {
  const session = await requireSession();

  const event = await prisma.matchEvent.create({
    data: {
      fixtureId,
      type: data.type,
      minute: data.minute,
      teamClubId: data.teamClubId,
      registrationId: data.registrationId,
      secondaryRegId: data.secondaryRegId,
      notes: data.notes,
      createdById: session.userId,
    },
  });

  if (["YELLOW", "SECOND_YELLOW", "RED"].includes(data.type)) {
    await processCardDiscipline(fixtureId, data.registrationId, data.type);
  }

  if (data.type === "INJURY" && data.registrationId) {
    await prisma.medicalClearance.create({
      data: {
        registrationId: data.registrationId,
        fixtureId,
        status: "RESTRICTED",
        notes: data.notes ?? "Травма в матче",
      },
    });
  }

  void event;
  await recalcScore(fixtureId);
  revalidatePath(`/referee/match/${fixtureId}`);
  revalidatePath(`/league/fixtures/${fixtureId}`);
}

export async function finishMatch(fixtureId: string) {
  const session = await requireSession();
  const { requireFixtureRefereeOrLeague } = await import("@/lib/referee-access");
  await requireFixtureRefereeOrLeague(fixtureId, session);

  const fixture = await prisma.fixture.findUnique({
    where: { id: fixtureId },
    include: { homeClub: true, awayClub: true },
  });

  await prisma.fixture.update({
    where: { id: fixtureId },
    data: {
      status: FixtureStatus.PROTOCOL_REVIEW,
      matchPhase: "FULL_TIME",
      fullTimeAt: new Date(),
    },
  });

  if (fixture) {
    await notifyClubStaff(
      fixture.homeClubId,
      session.organizationId,
      "Протокол на подпись",
      `${fixture.homeClub.shortName} — ${fixture.awayClub.shortName}: подпишите протокол`,
      "/club/delegate",
    );
    await notifyClubStaff(
      fixture.awayClubId,
      session.organizationId,
      "Протокол на подпись",
      `${fixture.homeClub.shortName} — ${fixture.awayClub.shortName}: подпишите протокол`,
      "/club/delegate",
    );
  }

  revalidatePath(`/referee/match/${fixtureId}`);
  revalidatePath(`/league/fixtures/${fixtureId}`);
  revalidatePath("/league/dashboard");
}

export async function closeMatch(fixtureId: string) {
  const session = await requireSession();
  if (!canManageLeague(session.role)) throw new Error("FORBIDDEN");

  const checklist = await prisma.fixtureChecklist.findUnique({
    where: { fixtureId },
  });
  if (
    !checklist?.eventsOk ||
    !checklist?.signaturesOk ||
    !checklist?.leagueReady
  ) {
    throw new Error("LEAGUE_CHECKLIST_INCOMPLETE");
  }

  const closedFixture = await prisma.fixture.update({
    where: { id: fixtureId },
    data: { status: FixtureStatus.CLOSED },
  });

  const squads = await prisma.squadLineup.findMany({
    where: { submission: { fixtureId } },
    select: { registrationId: true },
  });
  for (const line of squads) {
    const active = await prisma.disciplinaryRecord.findFirst({
      where: { registrationId: line.registrationId, active: true },
    });
    if (active) {
      const served = active.matchesServed + 1;
      await prisma.disciplinaryRecord.update({
        where: { id: active.id },
        data: {
          matchesServed: served,
          active: served < active.matchesBanned,
        },
      });
      if (served >= active.matchesBanned) {
        await prisma.playerRegistration.update({
          where: { id: line.registrationId },
          data: { eligibility: EligibilityStatus.ELIGIBLE },
        });
      }
    }
  }

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      fixtureId,
      action: "MATCH_CLOSED",
      details: `Closed by ${session.email}`,
      userId: session.userId,
    },
  });

  const { dispatchWebhooks } = await import("@/lib/webhooks");
  await dispatchWebhooks(session.organizationId, "fixture.closed", {
    fixtureId,
    homeScore: closedFixture.homeScore,
    awayScore: closedFixture.awayScore,
  });

  revalidatePath("/league/dashboard");
  revalidatePath("/league/standings");
  revalidatePath(`/league/fixtures/${fixtureId}`);
}
