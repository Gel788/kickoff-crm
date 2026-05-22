import { getSession, canManageLeague } from "@/lib/auth";
import { rowsToCsv } from "@/lib/csv-export";
import { buildFixturesIcal } from "@/lib/ical-feed";
import { FIXTURE_STATUS_LABELS } from "@/lib/fixture-status";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !canManageLeague(session.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "csv";
  const clubId = url.searchParams.get("club") ?? undefined;
  const roundNumber = url.searchParams.get("round");
  const season = await prisma.season.findFirst({
    where: { organizationId: session.organizationId, isActive: true },
    include: { organization: true },
  });
  if (!season) {
    return NextResponse.json({ error: "no_season" }, { status: 404 });
  }

  const fixtures = await prisma.fixture.findMany({
    where: {
      round: {
        ...(roundNumber ? { number: Number(roundNumber) } : {}),
        division: { competition: { seasonId: season.id } },
      },
      ...(clubId
        ? { OR: [{ homeClubId: clubId }, { awayClubId: clubId }] }
        : {}),
    },
    include: { homeClub: true, awayClub: true, round: true },
    orderBy: { scheduledAt: "asc" },
  });

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (format === "ics") {
    const body = buildFixturesIcal(
      fixtures.map((f) => ({
        id: f.id,
        scheduledAt: f.scheduledAt,
        homeName: f.homeClub.name,
        awayName: f.awayClub.name,
        venue: f.venue,
        status: FIXTURE_STATUS_LABELS[f.status] ?? f.status,
      })),
      `${season.organization.name} — ${season.name}`,
      appUrl,
    );
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="kickoff-calendar.ics"`,
      },
    });
  }

  const csv = rowsToCsv(
    fixtures.map((f) => ({
      tour: f.round.name ?? `Тур ${f.round.number}`,
      date: f.scheduledAt.toISOString(),
      home: f.homeClub.name,
      away: f.awayClub.name,
      venue: f.venue ?? "",
      status: FIXTURE_STATUS_LABELS[f.status] ?? f.status,
      score:
        f.status === "CLOSED" || f.status === "LIVE"
          ? `${f.homeScore}:${f.awayScore}`
          : "",
    })),
    [
      { key: "tour", label: "Тур" },
      { key: "date", label: "Дата" },
      { key: "home", label: "Дом" },
      { key: "away", label: "Гости" },
      { key: "venue", label: "Стадион" },
      { key: "status", label: "Статус" },
      { key: "score", label: "Счёт" },
    ],
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kickoff-fixtures.csv"`,
    },
  });
}
