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
      status: { in: ["SQUADS_LOCKED", "LIVE", "PROTOCOL_REVIEW", "CLOSED"] },
    },
    include: {
      squads: {
        include: {
          club: true,
          lines: {
            include: {
              registration: { include: { player: true } },
            },
          },
        },
      },
    },
  });

  if (!fixture) {
    return NextResponse.json(
      { error: "not_found_or_not_locked" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    fixtureId: fixture.id,
    squads: fixture.squads.map((s) => ({
      club: s.club.shortName,
      status: s.status,
      players: s.lines.map((l) => ({
        name: `${l.registration.player.firstName} ${l.registration.player.lastName}`,
        number: l.registration.shirtNumber,
        starter: l.isStarter,
        captain: l.isCaptain,
      })),
    })),
  });
}
