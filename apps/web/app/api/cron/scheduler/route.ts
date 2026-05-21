import { runDocumentExpiryReminders } from "@/lib/document-reminders";
import { runMatchdayScheduler } from "@/lib/scheduler";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const seasons = await prisma.season.findMany({
    where: { isActive: true },
    include: { organization: true },
  });
  const results = [];
  for (const s of seasons) {
    const r = await runMatchdayScheduler(s.id);
    const docs = await runDocumentExpiryReminders(s.organizationId);
    results.push({ seasonId: s.id, ...r, documentReminders: docs });
  }

  return NextResponse.json({ ok: true, results });
}
