import { Button } from "@/components/kickoff/button";
import { PageHeader } from "@/components/kickoff/page-header";
import { updateSeasonRegulation } from "@/lib/actions-season";
import { prisma } from "@/lib/db";
import { pointsFromRegulationRules } from "@/lib/season-rules";
import { getOrgContext } from "@/lib/queries";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function RegulationsPage() {
  const ctx = await getOrgContext();
  if (!ctx?.season) redirect("/league/seasons");

  const season = await prisma.season.findUnique({
    where: { id: ctx.season.id },
    include: { regulation: true },
  });
  if (!season) redirect("/league/seasons");

  const pointsRules = season.regulation
    ? pointsFromRegulationRules(season.regulation.rules)
    : { win: 3, draw: 1, loss: 0 };

  return (
    <>
      <PageHeader
        label="Регламент"
        title="Правила сезона"
        description={season.name}
      />

      <form
        action={updateSeasonRegulation}
        className="max-w-xl space-y-4 rounded-xl border border-border bg-elevated p-6"
      >
        <input type="hidden" name="seasonId" value={season.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-muted">
            Дедлайн заявки (ч до матча)
            <input name="squadDeadlineHours" type="number" defaultValue={season.squadDeadlineHours} className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2" />
          </label>
          <label className="text-xs text-muted">
            Макс. игроков в клубе
            <input name="maxSquadSize" type="number" defaultValue={season.maxSquadSize} className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2" />
          </label>
          <label className="text-xs text-muted">
            Запасных
            <input name="maxBench" type="number" defaultValue={season.maxBench} className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2" />
          </label>
          <label className="text-xs text-muted">
            Мин. в старте
            <input name="minStarters" type="number" defaultValue={season.minStarters} className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2" />
          </label>
          <label className="text-xs text-muted">
            Жёлтых до бана
            <input name="yellowBanThreshold" type="number" defaultValue={season.yellowBanThreshold} className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2" />
          </label>
          <label className="text-xs text-muted">
            Матчей бана (жёлтые)
            <input name="yellowBanMatches" type="number" defaultValue={season.yellowBanMatches} className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2" />
          </label>
          <label className="text-xs text-muted">
            Матчей бана (красная)
            <input name="redBanMatches" type="number" defaultValue={season.redBanMatches} className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2" />
          </label>
          <label className="text-xs text-muted">
            Очки: победа
            <input name="pointsWin" type="number" defaultValue={pointsRules.win} className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2" />
          </label>
          <label className="text-xs text-muted">
            Очки: ничья
            <input name="pointsDraw" type="number" defaultValue={pointsRules.draw} className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2" />
          </label>
          <label className="text-xs text-muted">
            Очки: поражение
            <input name="pointsLoss" type="number" defaultValue={pointsRules.loss} className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2" />
          </label>
        </div>
        <Button type="submit" size="sm">Сохранить регламент</Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Календарь и матчи — в{" "}
        <Link href="/league/settings" className="text-accent hover:underline">
          настройках
        </Link>
        .
      </p>
    </>
  );
}
