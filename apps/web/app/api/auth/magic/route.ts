import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "kickoff-dev-secret-change-in-production-32",
);

function portalRedirect(role: Role, clubId: string | null) {
  if (role === "PLATFORM_ADMIN") return "/platform";
  if (role === "REFEREE_CHIEF" || role === "REFEREE_ASSISTANT") return "/referee";
  if (role === "GUARDIAN") return "/guardian";
  if (role === "CLUB_DELEGATE") return "/club/delegate";
  if (clubId) return "/club";
  return "/league/dashboard";
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?magic=invalid", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.purpose !== "magic" || typeof payload.userId !== "string") {
      throw new Error("bad token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        memberships: { include: { organization: true, club: true } },
      },
    });
    if (!user || user.memberships.length === 0) {
      return NextResponse.redirect(new URL("/login?magic=invalid", req.url));
    }

    const m = user.memberships[0];
    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      organizationId: m.organizationId,
      orgSlug: m.organization.slug,
      orgName: m.organization.name,
      role: m.role,
      clubId: m.clubId,
    });

    const dest = portalRedirect(m.role, m.clubId);
    return NextResponse.redirect(new URL(dest, req.url));
  } catch {
    return NextResponse.redirect(new URL("/login?magic=invalid", req.url));
  }
}
