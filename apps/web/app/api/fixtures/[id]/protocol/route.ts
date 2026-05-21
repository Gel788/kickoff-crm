import { prisma } from "@/lib/db";
import { drawPdfHeader, getLeagueBrandingForFixture } from "@/lib/pdf-branding";
import { REFEREE_SLOT_LABELS, REFEREE_SLOT_ORDER } from "@/lib/referee-slots";
import { createPdfDrawer, pdfToResponse } from "@/lib/pdf-builder";
import { NextResponse } from "next/server";

const EVENT_RU: Record<string, string> = {
  GOAL: "Гол",
  OWN_GOAL: "Автогол",
  PENALTY_SCORED: "Пенальти",
  PENALTY_MISSED: "Пенальти не забит",
  YELLOW: "ЖК",
  SECOND_YELLOW: "2ЖК",
  RED: "КК",
  SUBSTITUTION: "Замена",
  INJURY: "Травма",
  VAR_DECISION: "VAR",
  OTHER: "Прочее",
};

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const fixture = await prisma.fixture.findUnique({
    where: { id: params.id },
    include: {
      homeClub: true,
      awayClub: true,
      events: {
        orderBy: { minute: "asc" },
        include: { registration: { include: { player: true } } },
      },
      refereeAssignments: { include: { user: true }, orderBy: { slot: "asc" } },
      signatures: { include: { user: true } },
      round: true,
    },
  });

  if (!fixture) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { pdf, drawer } = await createPdfDrawer();
  const branding = await getLeagueBrandingForFixture(params.id);
  if (branding) drawPdfHeader(drawer, branding);

  drawer.draw("Судейский протокол", 14);
  drawer.draw(`${fixture.homeClub.name} — ${fixture.awayClub.name}`, 14);
  drawer.draw(
    `Дата: ${fixture.scheduledAt.toLocaleString("ru-RU")}`,
    10,
  );
  if (fixture.venue) drawer.draw(`Стадион: ${fixture.venue}`, 10);
  drawer.draw(`Счёт: ${fixture.homeScore} : ${fixture.awayScore}`, 14);
  for (const slot of REFEREE_SLOT_ORDER) {
    const a = fixture.refereeAssignments.find((x) => x.slot === slot);
    if (a) drawer.draw(`${REFEREE_SLOT_LABELS[slot]}: ${a.user.name}`, 10);
  }
  drawer.y -= 10;
  drawer.draw("События:", 12);

  for (const e of fixture.events) {
    const player = e.registration
      ? `${e.registration.player.firstName} ${e.registration.player.lastName}`
      : "—";
    drawer.draw(`${e.minute}' ${EVENT_RU[e.type] ?? e.type} — ${player}`, 10);
  }

  drawer.y -= 10;
  drawer.draw("Подписи:", 12);
  for (const s of fixture.signatures) {
    drawer.draw(
      `${s.role}: ${s.refused ? `Отказ (${s.refuseReason ?? ""})` : s.user.name}`,
      10,
    );
  }

  return pdfToResponse(pdf, `protocol-${params.id}.pdf`);
}
