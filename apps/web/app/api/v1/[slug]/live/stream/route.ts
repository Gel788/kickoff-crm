import { resolveOrgBySlug } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const org = await resolveOrgBySlug(params.slug);
  if (!org?.seasons[0]) {
    return new Response("not_found", { status: 404 });
  }

  const seasonId = org.seasons[0].id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        const live = await prisma.fixture.findMany({
          where: {
            status: "LIVE",
            round: { division: { competition: { seasonId } } },
          },
          include: { homeClub: true, awayClub: true },
        });
        const payload = JSON.stringify({
          ts: Date.now(),
          live: live.map((f) => ({
            id: f.id,
            home: f.homeClub.shortName,
            away: f.awayClub.shortName,
            score: `${f.homeScore}:${f.awayScore}`,
            phase: f.matchPhase,
          })),
        });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      await send();
      setInterval(send, 3000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
