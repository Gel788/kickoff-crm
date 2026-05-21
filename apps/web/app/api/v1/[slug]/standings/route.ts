import { apiRateLimited, resolveOrgBySlug } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { getSeasonPointsConfig } from "@/lib/season-rules";
import { computeStandings } from "@/lib/standings";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const divisionId =
    new URL(req.url).searchParams.get("division") ?? undefined;
  const limited = apiRateLimited(req);
  if (limited) return limited;
  const org = await resolveOrgBySlug(params.slug);

  if (!org?.seasons[0]) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const seasonId = org.seasons[0].id;
  const points = await getSeasonPointsConfig(seasonId);

  const fixtures = await prisma.fixture.findMany({
    where: {
      status: "CLOSED",
      round: divisionId
        ? { divisionId }
        : { division: { competition: { seasonId } } },
    },
  });

  const clubIds = new Set(
    fixtures.flatMap((f) => [f.homeClubId, f.awayClubId]),
  );

  const clubs = await prisma.club.findMany({
    where: divisionId
      ? { id: { in: Array.from(clubIds) } }
      : { seasonClubs: { some: { seasonId } } },
  });

  const names = new Map(clubs.map((c) => [c.id, c.name]));
  const standings = computeStandings(fixtures, names, points);

  return NextResponse.json({
    organization: org.name,
    season: org.seasons[0].name,
    divisionId: divisionId ?? null,
    points,
    standings,
  });
}
