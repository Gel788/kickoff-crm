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

  const regs = await prisma.playerRegistration.findMany({
    where: { seasonId: org.seasons[0].id },
    include: { player: true, club: true },
    orderBy: [{ club: { name: "asc" } }, { player: { lastName: "asc" } }],
  });

  return NextResponse.json({
    organization: org.name,
    players: regs.map((r) => ({
      registrationId: r.id,
      firstName: r.player.firstName,
      lastName: r.player.lastName,
      club: r.club.shortName,
      shirtNumber: r.shirtNumber,
      position: r.position,
      ageCategory: r.ageCategory,
      eligibility: r.eligibility,
      fifaId: r.player.externalFifaId,
    })),
  });
}
