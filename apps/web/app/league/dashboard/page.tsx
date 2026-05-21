import { MatchCard } from "@/components/kickoff/match-card";
import { PageHeader } from "@/components/kickoff/page-header";
import { RoleValuePanel } from "@/components/kickoff/role-value-panel";
import { StatCard } from "@/components/kickoff/stat-card";
import {
  AlertPanel,
  EmptyState,
  SectionTitle,
} from "@/components/kickoff/ui";
import { fixtureStatusToBadge } from "@/lib/fixture-status";
import { getOrgContext, getDashboardStats, getStandingsForSeason } from "@/lib/queries";
import Link from "next/link";
import { format } from "@/lib/format";
import {
  AlertTriangle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  FileWarning,
} from "lucide-react";
import { sendSquadDeadlineReminders } from "@/lib/actions-fixtures";
import { redirect } from "next/navigation";

export default async function LeagueDashboardPage() {
  const ctx = await getOrgContext();
  if (!ctx?.season) redirect("/league/settings");

  const [{ standings }, { today, stats, alerts }] = await Promise.all([
    getStandingsForSeason(ctx.season.id),
    getDashboardStats(ctx.session.organizationId, ctx.season.id),
  ]);
  const miniStandings = standings.slice(0, 6);

  return (
    <>
      <PageHeader
        label="Кабинет лиги"
        title="Дашборд"
        description={`${ctx.round?.name ?? "Тур"} · ${format.date(new Date())} · всё, что нужно лиге на матчдень`}
      />

      <RoleValuePanel role="league" guideHref="/league/guide" />

      <div className="mb-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Матчи сегодня"
          value={stats.todayCount}
          hint={stats.liveCount ? `${stats.liveCount} live` : undefined}
          icon={Calendar}
          accent={stats.liveCount > 0}
        />
        <StatCard
          label="Просроченные заявки"
          value={stats.overdueSquads}
          icon={AlertTriangle}
        />
        <StatCard
          label="Протоколы на проверке"
          value={stats.protocolReview}
          icon={FileWarning}
        />
        <StatCard
          label="Матчи закрыты (тур)"
          value={stats.roundClosed}
          icon={CheckCircle2}
        />
        {stats.openDisputes > 0 && (
          <StatCard
            label="Открытые споры"
            value={stats.openDisputes}
            icon={AlertTriangle}
            accent
          />
        )}
      </div>

      <section className="mb-10">
        <SectionTitle>Матчи сегодня</SectionTitle>
        {today.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Сегодня матчей нет"
            description="Когда появятся игры в календаре, они отобразятся здесь"
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {today.map((m) => (
              <MatchCard
                key={m.id}
                home={m.homeClub.name}
                away={m.awayClub.name}
                score={
                  m.status === "LIVE" || m.status === "CLOSED"
                    ? `${m.homeScore} : ${m.awayScore}`
                    : undefined
                }
                time={`Сегодня · ${format.time(m.scheduledAt)}`}
                venue={m.venue ?? undefined}
                status={fixtureStatusToBadge(m.status)}
                href={`/league/fixtures/${m.id}`}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <SectionTitle>Турнирная таблица</SectionTitle>
          <Link
            href="/league/standings"
            className="text-sm font-medium text-accent hover:text-white"
          >
            Полная таблица →
          </Link>
        </div>
        {miniStandings.length === 0 ? (
          <p className="text-sm text-muted">
            Нет закрытых матчей — таблица появится после закрытия игр
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-elevated">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Клуб</th>
                  <th className="px-4 py-3 text-center">И</th>
                  <th className="px-4 py-3 text-center text-accent">О</th>
                </tr>
              </thead>
              <tbody>
                {miniStandings.map((row, i) => (
                  <tr key={row.clubId} className="border-b border-border/50">
                    <td className="px-4 py-2 font-mono text-muted">{i + 1}</td>
                    <td className="px-4 py-2 font-medium">{row.clubName}</td>
                    <td className="px-4 py-2 text-center font-mono">
                      {row.played}
                    </td>
                    <td className="px-4 py-2 text-center font-mono font-bold text-accent">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {alerts.length > 0 && (
        <AlertPanel variant="warning" title="Требует внимания" icon={AlertTriangle}>
          <ul className="list-inside list-disc space-y-1">
            {alerts.map((a, i) => (
              <li key={`${a}-${i}`}>{a}</li>
            ))}
          </ul>
        </AlertPanel>
      )}

      <form
        action={async () => {
          "use server";
          await sendSquadDeadlineReminders(ctx.season!.id);
        }}
        className="mt-8"
      >
        <button
          type="submit"
          className="text-sm font-medium text-accent transition-colors hover:text-white"
        >
          Отправить напоминания о дедлайне заявок →
        </button>
      </form>
    </>
  );
}
