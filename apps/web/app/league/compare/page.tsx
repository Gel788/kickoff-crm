import { PageHeader } from "@/components/kickoff/page-header";
import { H2hClubSelect } from "@/components/league/h2h-club-select";
import { Card, DataTable } from "@/components/kickoff/ui";
import { getHeadToHead } from "@/lib/head-to-head";
import { format } from "@/lib/format";
import { getOrgContext } from "@/lib/queries";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function H2hSelectWrapper({
  clubs,
  clubAId,
  clubBId,
}: {
  clubs: { id: string; name: string }[];
  clubAId?: string;
  clubBId?: string;
}) {
  return (
    <Suspense fallback={null}>
      <H2hClubSelect clubs={clubs} clubAId={clubAId} clubBId={clubBId} />
    </Suspense>
  );
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { a?: string; b?: string };
}) {
  const ctx = await getOrgContext();
  if (!ctx?.season) redirect("/league/settings");

  const clubs = await prisma.club.findMany({
    where: { seasonClubs: { some: { seasonId: ctx.season.id } } },
    orderBy: { name: "asc" },
  });

  const clubAId = searchParams.a;
  const clubBId = searchParams.b;
  const clubA = clubs.find((c) => c.id === clubAId);
  const clubB = clubs.find((c) => c.id === clubBId);

  const h2h =
    clubA && clubB && clubAId !== clubBId
      ? await getHeadToHead(ctx.season.id, clubAId!, clubBId!)
      : null;

  return (
    <>
      <PageHeader
        label="Аналитика"
        title="Очные встречи"
        description="Head-to-head — как в Sports-League / Sofascore"
      />

      <H2hSelectWrapper
        clubs={clubs.map((c) => ({ id: c.id, name: c.name }))}
        clubAId={clubAId}
        clubBId={clubBId}
      />

      {h2h && clubA && clubB ? (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-4">
            <Card className="!p-4 text-center">
              <p className="font-mono text-2xl font-bold text-accent">
                {h2h.summary.winsA}
              </p>
              <p className="text-xs text-muted">{clubA.shortName} — победы</p>
            </Card>
            <Card className="!p-4 text-center">
              <p className="font-mono text-2xl font-bold">{h2h.summary.draws}</p>
              <p className="text-xs text-muted">Ничьи</p>
            </Card>
            <Card className="!p-4 text-center">
              <p className="font-mono text-2xl font-bold text-accent">
                {h2h.summary.winsB}
              </p>
              <p className="text-xs text-muted">{clubB.shortName} — победы</p>
            </Card>
            <Card className="!p-4 text-center">
              <p className="font-mono text-lg font-bold">
                {h2h.summary.goalsA}:{h2h.summary.goalsB}
              </p>
              <p className="text-xs text-muted">Голы</p>
            </Card>
          </div>

          <DataTable>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Матч</th>
                <th className="text-center">Счёт</th>
              </tr>
            </thead>
            <tbody>
              {h2h.fixtures.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-muted">
                    Очных матчей ещё не было
                  </td>
                </tr>
              ) : (
                h2h.fixtures.map((f) => (
                  <tr key={f.id}>
                    <td className="font-mono text-xs text-muted">
                      {format.date(f.scheduledAt)}
                    </td>
                    <td>
                      <Link
                        href={`/league/fixtures/${f.id}`}
                        className="hover:text-accent"
                      >
                        {f.homeClub.shortName} — {f.awayClub.shortName}
                      </Link>
                    </td>
                    <td className="text-center font-mono font-bold">
                      {f.homeScore}:{f.awayScore}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </DataTable>
        </>
      ) : (
        <p className="text-sm text-muted">Выберите два разных клуба</p>
      )}
    </>
  );
}
