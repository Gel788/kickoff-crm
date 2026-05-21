import { prisma } from "@/lib/db";
import { drawPdfHeader, getLeagueBrandingForFixture } from "@/lib/pdf-branding";
import { createPdfDrawer, pdfToResponse } from "@/lib/pdf-builder";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const clubId = request.nextUrl.searchParams.get("clubId");
  if (!clubId) {
    return NextResponse.json({ error: "clubId required" }, { status: 400 });
  }

  const fixture = await prisma.fixture.findUnique({
    where: { id: params.id },
    include: {
      homeClub: true,
      awayClub: true,
      squads: {
        where: { clubId },
        include: {
          club: true,
          lines: {
            orderBy: { sortOrder: "asc" },
            include: {
              registration: { include: { player: true } },
            },
          },
        },
      },
    },
  });

  if (!fixture) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const squad = fixture.squads[0];
  if (!squad) {
    return NextResponse.json({ error: "no_squad" }, { status: 404 });
  }

  const { pdf, drawer } = await createPdfDrawer();
  const branding = await getLeagueBrandingForFixture(params.id);
  if (branding) drawPdfHeader(drawer, branding);

  drawer.draw("Заявка на матч", 14);
  drawer.draw(`${fixture.homeClub.name} — ${fixture.awayClub.name}`, 13);
  drawer.draw(
    `Дата: ${fixture.scheduledAt.toLocaleString("ru-RU")}`,
    10,
  );
  drawer.draw(`Клуб: ${squad.club.name}`, 12);
  drawer.draw(`Статус: ${squad.status}`, 10);
  if (squad.submittedAt) {
    drawer.draw(
      `Подана: ${squad.submittedAt.toLocaleString("ru-RU")}`,
      10,
    );
  }
  drawer.y -= 8;
  drawer.draw("Состав:", 12);

  const starters = squad.lines.filter((l) => l.isStarter);
  const bench = squad.lines.filter((l) => !l.isStarter);

  drawer.draw("Основа:", 11);
  for (const line of starters) {
    const p = line.registration.player;
    const cap = line.isCaptain ? " (C)" : "";
    const num = line.registration.shirtNumber ?? "—";
    drawer.draw(`  ${num} — ${p.firstName} ${p.lastName}${cap}`, 10);
  }

  if (bench.length > 0) {
    drawer.y -= 4;
    drawer.draw("Запас:", 11);
    for (const line of bench) {
      const p = line.registration.player;
      const num = line.registration.shirtNumber ?? "—";
      drawer.draw(`  ${num} — ${p.firstName} ${p.lastName}`, 10);
    }
  }

  return pdfToResponse(
    pdf,
    `squad-${fixture.homeClub.shortName}-${fixture.awayClub.shortName}.pdf`,
  );
}
