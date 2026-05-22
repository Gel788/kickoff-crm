import { PageHeader } from "@/components/kickoff/page-header";
import { LeaderboardTable } from "@/components/league/leaderboard-table";
import { getSeasonLeaderboard } from "@/lib/player-stats";
import { getOrgContext } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function LeaderboardPage() {
  const ctx = await getOrgContext();
  if (!ctx?.season) redirect("/league/settings");

  const rows = await getSeasonLeaderboard(ctx.season.id, 100);

  return (
    <>
      <PageHeader
        label="Статистика"
        title="Лидерборд сезона"
        description="Голы, карточки, матчи — идея из MatchDay / open projects"
      />

      {rows.length === 0 ? (
        <p className="rounded-xl border border-border bg-elevated py-8 text-center text-muted">
          Нет статистики. В терминале: npm run db:demo (или npm run db:setup)
        </p>
      ) : (
        <LeaderboardTable
          rows={rows.map((r, i) => ({
            rank: i + 1,
            registrationId: r.registrationId,
            name: r.name,
            club: r.club,
            goals: r.goals,
            yellow: r.yellow,
            red: r.red,
            appearances: r.appearances,
          }))}
        />
      )}
    </>
  );
}
