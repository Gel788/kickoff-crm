import { exportFifaRegistrationsCsv } from "@/lib/actions-fifa";
import { getSession } from "@/lib/auth";
import { canManageLeague } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !canManageLeague(session.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const seasonId = new URL(req.url).searchParams.get("seasonId");
  if (!seasonId) {
    return NextResponse.json({ error: "seasonId required" }, { status: 400 });
  }

  const csv = await exportFifaRegistrationsCsv(seasonId);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kickoff-fifa-${seasonId}.csv"`,
    },
  });
}
