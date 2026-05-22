import { PageHeader } from "@/components/kickoff/page-header";
import { Button } from "@/components/kickoff/button";
import { Card, DataTable } from "@/components/kickoff/ui";
import { ExportStandingsPng } from "@/components/league/export-standings-png";
import { FormBadges } from "@/components/league/form-badges";
import { CopyShareButton } from "@/components/kickoff/copy-share-button";
import { getClubFormMap } from "@/lib/form-guide";
import {
  getCardStatsForSeason,
  getOrgContext,
  getSeasonDivisions,
  getStandingsForSeason,
  getTopScorers,
} from "@/lib/queries";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StandingsPage({
  searchParams,
}: {
  searchParams: { division?: string };
}) {
  const ctx = await getOrgContext();
  if (!ctx?.season) redirect("/league/settings");

  const divisionId = searchParams.division || undefined;
  const divisions = await getSeasonDivisions(ctx.season.id);

  const [{ standings, points }, scorers, cards, formMap] = await Promise.all([
    getStandingsForSeason(ctx.season.id, divisionId),
    getTopScorers(ctx.season.id),
    getCardStatsForSeason(ctx.season.id, divisionId),
    getClubFormMap(ctx.season.id, divisionId),
  ]);

  const divisionLabel =
    divisions.find((d) => d.id === divisionId)?.name ?? "Весь сезон";

  return (
    <>
      <PageHeader
        label="Статистика"
        title="Турнирная таблица"
        description={`${divisionLabel} · очки: победа ${points.win}, ничья ${points.draw}, поражение ${points.loss}`}
      >
        <div className="flex flex-wrap gap-2">
          <ExportStandingsPng targetId="standings-export" />
          <CopyShareButton
            url={`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/embed/${ctx.org?.slug ?? "demo"}/standings`}
            title="Таблица Kickoff"
            label="Поделиться"
          />
        </div>
      </PageHeader>

      {divisions.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Link href="/league/standings">
            <Button size="sm" variant={!divisionId ? "primary" : "ghost"}>
              Весь сезон
            </Button>
          </Link>
          {divisions.map((d) => (
            <Link key={d.id} href={`/league/standings?division=${d.id}`}>
              <Button
                size="sm"
                variant={divisionId === d.id ? "primary" : "ghost"}
              >
                {d.competition.name} · {d.name}
              </Button>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2" id="standings-export">
          <DataTable>
            <thead>
              <tr>
                <th>#</th>
                <th>Клуб</th>
                <th className="text-center">И</th>
                <th className="text-center">В</th>
                <th className="text-center">Н</th>
                <th className="text-center">П</th>
                <th className="text-center">Мячи</th>
                <th className="text-center">±</th>
                <th className="text-center">Форма</th>
                <th className="text-center text-accent">О</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, i) => (
                <tr key={row.clubId}>
                  <td className="font-mono text-muted">{i + 1}</td>
                  <td className="font-medium">{row.clubName}</td>
                  <td className="text-center font-mono">{row.played}</td>
                  <td className="text-center font-mono">{row.won}</td>
                  <td className="text-center font-mono">{row.drawn}</td>
                  <td className="text-center font-mono">{row.lost}</td>
                  <td className="text-center font-mono">
                    {row.gf}:{row.ga}
                  </td>
                  <td className="text-center font-mono">{row.gd}</td>
                  <td className="text-center">
                    <FormBadges form={formMap.get(row.clubId) ?? []} />
                  </td>
                  <td className="text-center font-mono font-bold text-accent">
                    {row.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="font-display text-lg font-bold">Бомбардиры</h3>
            <ul className="mt-4 space-y-3">
              {scorers.length === 0 ? (
                <li className="text-sm text-muted">Нет голов в закрытых матчах</li>
              ) : (
                scorers.map((s, i) => (
                  <li
                    key={s.name + s.club}
                    className="flex items-center justify-between"
                  >
                    <span>
                      <span className="font-mono text-muted">{i + 1}.</span>{" "}
                      {s.name}
                      <span className="ml-2 text-xs text-muted">{s.club}</span>
                    </span>
                    <span className="font-mono font-bold text-accent">
                      {s.goals}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </Card>

          <Card>
            <h3 className="font-display text-lg font-bold">Карточки</h3>
            <ul className="mt-4 space-y-3">
              {cards.length === 0 ? (
                <li className="text-sm text-muted">Нет карточек</li>
              ) : (
                cards.map((c) => (
                  <li
                    key={c.playerName + c.clubName}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {c.playerName}
                      <span className="ml-2 text-xs text-muted">
                        {c.clubName}
                      </span>
                    </span>
                    <span className="font-mono">
                      <span className="text-warning">{c.yellow}Ж</span>
                      {c.red > 0 && (
                        <span className="ml-1 text-danger">{c.red}К</span>
                      )}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
