import { apiRateLimited, resolveOrgBySlug } from "@/lib/api-helpers";
import { getTopScorers } from "@/lib/queries";
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

  const scorers = await getTopScorers(org.seasons[0].id, 20);

  return NextResponse.json({
    organization: org.name,
    scorers,
  });
}
