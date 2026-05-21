import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.slug },
    include: { seasons: { where: { isActive: true }, take: 1 } },
  });
  if (!org?.seasons[0]) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const seasonId = org.seasons[0].id;
  const live = await prisma.fixture.findMany({
    where: {
      status: "LIVE",
      round: { division: { competition: { seasonId } } },
    },
    include: { homeClub: true, awayClub: true },
    orderBy: { scheduledAt: "asc" },
  });

  const today = await prisma.fixture.findMany({
    where: {
      scheduledAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
      round: { division: { competition: { seasonId } } },
    },
    include: { homeClub: true, awayClub: true },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({
    organization: org.name,
    live: live.map((f) => ({
      id: f.id,
      home: f.homeClub.shortName,
      away: f.awayClub.shortName,
      score: `${f.homeScore}:${f.awayScore}`,
      phase: f.matchPhase,
    })),
    today: today.map((f) => ({
      id: f.id,
      home: f.homeClub.shortName,
      away: f.awayClub.shortName,
      status: f.status,
      score:
        f.status === "LIVE" || f.status === "CLOSED"
          ? `${f.homeScore}:${f.awayScore}`
          : null,
      time: f.scheduledAt.toISOString(),
    })),
  });
}
