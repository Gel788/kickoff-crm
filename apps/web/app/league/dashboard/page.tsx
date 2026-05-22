import {
  TodayMatchesCarousel,
  type TodayMatchItem,
} from "@/components/league/today-matches-carousel";
import { AppDashboardHero } from "@/components/kickoff/app-dashboard-hero";
import { PageHeader } from "@/components/kickoff/page-header";
import { RoleValuePanel } from "@/components/kickoff/role-value-panel";
import { StatCard } from "@/components/kickoff/stat-card";
import {
  AlertPanel,
  DataTable,
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
      <AppDashboardHero
        orgName={ctx.org?.name ?? "Лига"}
        seasonName={ctx.season.name}
        roundLabel={ctx.round?.name ?? undefined}
        liveCount={stats.liveCount}
      />

      <PageHeader
        label="Сводка"
        title="Дашборд матчденя"
        description={`${format.date(new Date())} · заявки, протоколы, алерты`}
      />

      <RoleValuePanel role="league" guideHref="/league/guide" />

      <div className="mb-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Матчи сегодня"
          value={stats.todayCount}
          hint={stats.liveCount ? `${stats.liveCount} live` : undefined}
          icon={Calendar}
          accent={stats.liveCount > 0}
          animate
        />
        <StatCard
          label="Просроченные заявки"
          value={stats.overdueSquads}
          icon={AlertTriangle}
          animate
        />
        <StatCard
          label="Протоколы на проверке"
          value={stats.protocolReview}
          icon={FileWarning}
          animate
        />
        <StatCard
          label="Матчи закрыты (тур)"
          value={stats.roundClosed}
          icon={CheckCircle2}
          animate
        />
        {stats.openDisputes > 0 && (
          <StatCard
            label="Открытые споры"
            value={stats.openDisputes}
            icon={AlertTriangle}
            accent
            animate
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
          <TodayMatchesCarousel
            matches={today.map(
              (m): TodayMatchItem => ({
                id: m.id,
                home: m.homeClub.name,
                away: m.awayClub.name,
                score:
                  m.status === "LIVE" || m.status === "CLOSED"
                    ? `${m.homeScore} : ${m.awayScore}`
                    : undefined,
                time: `Сегодня · ${format.time(m.scheduledAt)}`,
                venue: m.venue ?? undefined,
                status: fixtureStatusToBadge(m.status),
              }),
            )}
          />
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
          <DataTable>
            <thead>
              <tr>
                <th>#</th>
                <th>Клуб</th>
                <th className="text-center">И</th>
                <th className="text-center">О</th>
              </tr>
            </thead>
            <tbody>
              {miniStandings.map((row, i) => (
                <tr key={row.clubId}>
                  <td className="font-mono text-muted">{i + 1}</td>
                  <td className="font-medium">{row.clubName}</td>
                  <td className="text-center font-mono">{row.played}</td>
                  <td className="text-center font-mono font-bold text-accent">
                    {row.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
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
