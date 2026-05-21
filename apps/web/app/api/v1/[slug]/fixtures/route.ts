import { apiRateLimited, resolveOrgBySlug } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const limited = apiRateLimited(req);
  if (limited) return limited;

  const org = await resolveOrgBySlug(params.slug);

  if (!org?.seasons[0]) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const fixtures = await prisma.fixture.findMany({
    where: {
      round: {
        division: { competition: { seasonId: org.seasons[0].id } },
      },
    },
    include: { homeClub: true, awayClub: true },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({
    organization: org.name,
    fixtures: fixtures.map((f) => ({
      id: f.id,
      home: f.homeClub.name,
      away: f.awayClub.name,
      scheduledAt: f.scheduledAt,
      status: f.status,
      score: `${f.homeScore}:${f.awayScore}`,
    })),
  });
}
