import { Button } from "@/components/kickoff/button";
import { FormBadges } from "@/components/league/form-badges";
import { getClubFormMap, type FormResult } from "@/lib/form-guide";
import { getLandingDemoData } from "@/lib/landing-demo";
import { prisma } from "@/lib/db";
import { getStandingsForSeason, getTopScorers } from "@/lib/queries";
import { format } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Radio, Rss, TableProperties, Trophy } from "lucide-react";

export default async function OrgPublicHubPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
    include: { seasons: { where: { isActive: true }, take: 1 } },
  });
  if (!org) notFound();

  const season = org.seasons[0];
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";

  let standings: Awaited<ReturnType<typeof getStandingsForSeason>>["standings"] = [];
  let scorers: Awaited<ReturnType<typeof getTopScorers>> = [];
  let formMap = new Map<string, FormResult[]>();
  let hubExtras: Awaited<ReturnType<typeof getLandingDemoData>> = null;

  if (season) {
    const [st, sc, fm] = await Promise.all([
      getStandingsForSeason(season.id),
      getTopScorers(season.id, 10),
      getClubFormMap(season.id),
    ]);
    standings = st.standings;
    scorers = sc;
    formMap = fm;
    if (params.orgSlug === "demo") {
      hubExtras = await getLandingDemoData();
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-base">
      <div className="pointer-events-none fixed inset-0 grid-pitch opacity-40" />
      <div className="pointer-events-none fixed inset-0 landing-aurora" />

      <header className="relative z-10 border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
              Kickoff · публичная лига
            </p>
            <h1 className="font-display text-3xl font-bold md:text-4xl">{org.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {season?.name ?? "Сезон не активен"} · {org.slug}
            </p>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm">
              kickoff.app
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap gap-3">
          <Link href={`/live/${org.slug}`}>
            <Button size="lg" className="gap-2 shadow-glow">
              <Radio className="h-4 w-4" />
              Live-табло
              {hubExtras && hubExtras.liveCount > 0 && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  {hubExtras.liveCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href={`/embed/${org.slug}/standings`} target="_blank">
            <Button size="lg" variant="outline" className="gap-2 border-white/15">
              <TableProperties className="h-4 w-4" />
              Виджет таблицы
            </Button>
          </Link>
          <Link href={`/api/v1/${org.slug}/calendar.ics`} target="_blank">
            <Button size="lg" variant="ghost" className="gap-2">
              <Calendar className="h-4 w-4" />
              iCal
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="ghost">
              Войти в кабинет
            </Button>
          </Link>
        </div>

        {hubExtras?.nextFixture && (
          <div className="mt-8 rounded-2xl border border-info/25 bg-info/5 px-6 py-4">
            <p className="font-mono text-[10px] uppercase text-info">Ближайший матч</p>
            <p className="mt-1 font-display text-xl font-bold">
              {hubExtras.nextFixture.label}
            </p>
            <p className="text-sm text-muted">
              {format.datetime(hubExtras.nextFixture.at)}
            </p>
          </div>
        )}

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
              <Trophy className="h-5 w-5 text-accent" />
              Турнирная таблица
            </h2>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-elevated/80">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Клуб</th>
                    <th className="px-4 py-3 text-center">Форма</th>
                    <th className="px-4 py-3 text-center">О</th>
                    <th className="px-4 py-3 text-center">И</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted">
                        Нет закрытых матчей —{" "}
                        <code className="text-accent">npm run db:demo</code>
                      </td>
                    </tr>
                  ) : (
                    standings.map((row, i) => (
                      <tr key={row.clubId} className="border-b border-white/5">
                        <td className="px-4 py-3 font-mono text-muted">{i + 1}</td>
                        <td className="px-4 py-3 font-medium">{row.clubName}</td>
                        <td className="px-4 py-3 text-center">
                          <FormBadges form={formMap.get(row.clubId) ?? []} />
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-accent">
                          {row.points}
                        </td>
                        <td className="px-4 py-3 text-center font-mono">{row.played}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-display text-xl font-bold">Бомбардиры</h2>
            <ul className="space-y-3 rounded-2xl border border-white/10 bg-elevated/80 p-5">
              {scorers.length === 0 ? (
                <li className="text-sm text-muted">Пока нет голов</li>
              ) : (
                scorers.map((s, i) => (
                  <li key={s.name + s.club} className="flex justify-between text-sm">
                    <span>
                      <span className="font-mono text-muted">{i + 1}.</span> {s.name}
                      <span className="ml-1 text-xs text-muted">({s.club})</span>
                    </span>
                    <span className="font-mono font-bold text-accent">{s.goals}</span>
                  </li>
                ))
              )}
            </ul>

            <div className="mt-6 rounded-2xl border border-white/10 bg-elevated/50 p-5 font-mono text-xs text-muted">
              <p className="mb-2 flex items-center gap-2 text-white">
                <Rss className="h-3.5 w-3.5 text-accent" />
                API
              </p>
              <p>GET {base}/api/v1/{org.slug}/standings</p>
              <p>GET {base}/api/v1/{org.slug}/scorers</p>
              <p>GET {base}/api/v1/{org.slug}/live/stream</p>
              <Link
                href="/api/openapi"
                target="_blank"
                className="mt-3 inline-block text-accent hover:underline"
              >
                OpenAPI →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
