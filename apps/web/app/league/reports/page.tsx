import { PageHeader } from "@/components/kickoff/page-header";
import { StatCard } from "@/components/kickoff/stat-card";
import { Card, DataTable } from "@/components/kickoff/ui";
import { getOrgContext, getStandingsForSeason, getTopScorers } from "@/lib/queries";
import { prisma } from "@/lib/db";
import { FileBarChart, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const ctx = await getOrgContext();
  if (!ctx?.season) redirect("/league/seasons");

  const [{ standings }, scorers, closed] = await Promise.all([
    getStandingsForSeason(ctx.season.id),
    getTopScorers(ctx.season.id, 10),
    prisma.fixture.count({
      where: {
        status: "CLOSED",
        round: { division: { competition: { seasonId: ctx.season.id } } },
      },
    }),
  ]);

  return (
    <>
      <PageHeader
        label="Отчёты"
        title="Сезон в цифрах"
        description={ctx.season.name}
      />

      <div className="mb-10 grid gap-5 sm:grid-cols-3">
        <StatCard label="Матчей закрыто" value={closed} icon={Trophy} accent />
        <StatCard label="Команд" value={standings.length} icon={Users} />
        <StatCard
          label="API"
          value="JSON"
          hint="Публичный экспорт"
          icon={FileBarChart}
        />
      </div>

      <Card className="mb-8 !p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href={`/api/v1/${ctx.org!.slug}/standings`}
            target="_blank"
            className="text-accent hover:underline"
          >
            API таблицы →
          </Link>
          <Link
            href={`/api/v1/${ctx.org!.slug}/fixtures`}
            target="_blank"
            className="text-accent hover:underline"
          >
            API матчей →
          </Link>
          <Link
            href={`/api/v1/${ctx.org!.slug}/players`}
            target="_blank"
            className="text-accent hover:underline"
          >
            API игроков →
          </Link>
          <Link
            href={`/api/v1/${ctx.org!.slug}/scorers`}
            target="_blank"
            className="text-accent hover:underline"
          >
            Бомбардиры API →
          </Link>
          <Link
            href={`/live/${ctx.org!.slug}`}
            target="_blank"
            className="text-accent hover:underline"
          >
            Live-табло →
          </Link>
          <Link
            href={`/api/league/export-fifa?seasonId=${ctx.season.id}`}
            className="text-accent hover:underline"
          >
            FIFA CSV →
          </Link>
        </div>
      </Card>

      <section className="mb-10">
        <h2 className="kickoff-section-title mb-4">Турнирная таблица</h2>
        <DataTable>
          <thead>
            <tr>
              <th>#</th>
              <th>Клуб</th>
              <th>О</th>
              <th>И</th>
              <th>В-Н-П</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => (
              <tr key={row.clubId}>
                <td className="font-mono text-muted">{i + 1}</td>
                <td>{row.clubName}</td>
                <td className="font-mono text-accent">{row.points}</td>
                <td className="font-mono">{row.played}</td>
                <td className="text-muted text-xs">
                  {row.won}-{row.drawn}-{row.lost}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>

      <section>
        <h2 className="kickoff-section-title mb-4">Бомбардиры</h2>
        <Card>
          <ul className="space-y-3">
            {scorers.length === 0 ? (
              <li className="text-muted">Голов пока нет</li>
            ) : (
              scorers.map((s, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>
                    <span className="font-mono text-muted">{i + 1}.</span> {s.name}{" "}
                    <span className="text-muted">({s.club})</span>
                  </span>
                  <span className="font-mono font-bold text-accent">{s.goals}</span>
                </li>
              ))
            )}
          </ul>
        </Card>
      </section>
    </>
  );
}
