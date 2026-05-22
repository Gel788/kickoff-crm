import { apiRateLimited, resolveOrgBySlug } from "@/lib/api-helpers";
import { buildFixturesIcal } from "@/lib/ical-feed";
import { FIXTURE_STATUS_LABELS } from "@/lib/fixture-status";
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

  const seasonId = org.seasons[0].id;
  const fixtures = await prisma.fixture.findMany({
    where: {
      round: { division: { competition: { seasonId } } },
      scheduledAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    },
    include: { homeClub: true, awayClub: true },
    orderBy: { scheduledAt: "asc" },
  });

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const body = buildFixturesIcal(
    fixtures.map((f) => ({
      id: f.id,
      scheduledAt: f.scheduledAt,
      homeName: f.homeClub.name,
      awayName: f.awayClub.name,
      venue: f.venue,
      status: FIXTURE_STATUS_LABELS[f.status] ?? f.status,
    })),
    `${org.name} — ${org.seasons[0].name}`,
    appUrl,
  );

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
