import { PageHeader } from "@/components/kickoff/page-header";
import { KnockoutBracket } from "@/components/league/knockout-bracket";
import { getOrgContext, getStandingsForSeason } from "@/lib/queries";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CupPage() {
  const ctx = await getOrgContext();
  if (!ctx?.season) redirect("/league/settings");

  const { standings } = await getStandingsForSeason(ctx.season.id);
  const teams = standings.slice(0, 8).map((row, i) => ({
    clubId: row.clubId,
    name: row.clubName,
    seed: i + 1,
  }));

  return (
    <>
      <PageHeader
        label="Кубок"
        title="Плей-офф сетка"
        description="Посев из топ-8 таблицы · создайте матчи кубка в календаре"
      >
        <Link href="/league/calendar">
          <span className="text-sm text-accent hover:underline">Календарь →</span>
        </Link>
      </PageHeader>

      <KnockoutBracket teams={teams} />
    </>
  );
}
