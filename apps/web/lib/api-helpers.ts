import { resolveOrgByApiKey } from "@/lib/api-auth";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function resolveOrgBySlug(slug: string) {
  return prisma.organization.findUnique({
    where: { slug },
    include: { seasons: { where: { isActive: true }, take: 1 } },
  });
}

export function apiRateLimited(req: Request) {
  const ip = clientIp(req);
  if (!checkRateLimit(`api:${ip}`, 180, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  return null;
}

export async function requireApiKey(req: Request) {
  const org = await resolveOrgByApiKey(req.headers.get("authorization"));
  if (!org) {
    return {
      error: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }
  return { org };
}
