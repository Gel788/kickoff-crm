import { apiRateLimited, resolveOrgBySlug } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { slug: string; id: string } },
) {
  const limited = apiRateLimited(req);
  if (limited) return limited;

  const org = await resolveOrgBySlug(params.slug);
  if (!org?.seasons[0]) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const fixture = await prisma.fixture.findFirst({
    where: {
      id: params.id,
      round: {
        division: { competition: { seasonId: org.seasons[0].id } },
      },
    },
    include: {
      homeClub: true,
      awayClub: true,
      events: {
        orderBy: [{ minute: "asc" }],
        include: {
          registration: { include: { player: true } },
        },
      },
    },
  });

  if (!fixture) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    id: fixture.id,
    home: fixture.homeClub.name,
    away: fixture.awayClub.name,
    status: fixture.status,
    score: `${fixture.homeScore}:${fixture.awayScore}`,
    phase: fixture.matchPhase,
    scheduledAt: fixture.scheduledAt,
    events: fixture.events.map((e) => ({
      type: e.type,
      minute: e.minute,
      player: e.registration
        ? `${e.registration.player.firstName} ${e.registration.player.lastName}`
        : null,
    })),
  });
}
