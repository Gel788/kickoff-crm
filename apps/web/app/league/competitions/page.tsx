import { Button } from "@/components/kickoff/button";
import { DeleteButton } from "@/components/kickoff/confirm-form";
import { FlashBanner } from "@/components/kickoff/flash-banner";
import { PageHeader } from "@/components/kickoff/page-header";
import { Card, FormCard, inputClass } from "@/components/kickoff/ui";
import {
  createCompetition,
  createDivision,
  deleteDivision,
  deleteRound,
  updateCompetition,
} from "@/lib/actions-competition";
import { createRound } from "@/lib/actions-season";
import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/queries";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const ctx = await getOrgContext();
  if (!ctx?.season) redirect("/league/settings");

  const season = await prisma.season.findUnique({
    where: { id: ctx.season.id },
    include: {
      competitions: {
        include: {
          divisions: {
            include: {
              rounds: {
                orderBy: { number: "asc" },
                include: { _count: { select: { fixtures: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!season) redirect("/league/settings");

  return (
    <>
      <PageHeader
        label="Структура"
        title="Соревнования"
        description={`${season.name} · турниры, дивизионы, туры`}
      />

      <FlashBanner code={searchParams.error} />

      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/league/calendar">
          <Button variant="outline" size="sm">
            + Матч в календаре
          </Button>
        </Link>
        <Link href="/league/calendar">
          <Button variant="ghost" size="sm">
            Календарь →
          </Button>
        </Link>
      </div>

      <form action={createCompetition} className="mb-8">
        <FormCard title="Новое соревнование">
          <input type="hidden" name="seasonId" value={season.id} />
          <input name="name" placeholder="Название (Кубок, Чемпионат…)" className={inputClass} />
          <Button type="submit" size="sm">
            Создать (+ дивизион по умолчанию)
          </Button>
        </FormCard>
      </form>

      {season.competitions.length === 0 ? (
        <p className="text-muted">Соревнований нет — создайте первое выше.</p>
      ) : (
        season.competitions.map((comp) => (
          <Card key={comp.id} className="mb-8 !p-6">
            <form action={updateCompetition} className="mb-6 flex flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={comp.id} />
              <div className="min-w-[200px] flex-1">
                <label className="kickoff-label">Соревнование</label>
                <input name="name" defaultValue={comp.name} className={inputClass} />
              </div>
              <Button type="submit" size="sm" variant="outline">
                Сохранить название
              </Button>
            </form>

            {comp.divisions.map((div) => (
              <div
                key={div.id}
                className="mb-6 rounded-xl border border-border/60 bg-base/30 p-5"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-bold">{div.name}</h3>
                  <DeleteButton
                    action={deleteDivision}
                    confirmMessage={`Удалить дивизион «${div.name}»?`}
                    hidden={{ divisionId: div.id }}
                    label="Удалить дивизион"
                  />
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {div.rounds.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-2 rounded-lg border border-border bg-elevated px-3 py-2"
                    >
                      <span className="font-mono text-sm">
                        {r.name ?? `Тур ${r.number}`}
                      </span>
                      <span className="text-xs text-muted">
                        {r._count.fixtures} матч.
                      </span>
                      {r._count.fixtures === 0 && (
                        <DeleteButton
                          action={deleteRound}
                          confirmMessage="Удалить пустой тур?"
                          hidden={{ roundId: r.id }}
                          label="×"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <form action={createRound} className="flex flex-wrap gap-2">
                  <input type="hidden" name="divisionId" value={div.id} />
                  <input
                    name="number"
                    type="number"
                    placeholder="№ тура"
                    className={`${inputClass} w-24`}
                  />
                  <input
                    name="name"
                    placeholder="Название тура"
                    className={`${inputClass} min-w-[140px] flex-1`}
                  />
                  <Button type="submit" size="sm" variant="outline">
                    + Тур
                  </Button>
                </form>
              </div>
            ))}

            <form action={createDivision} className="flex flex-wrap gap-2 border-t border-border pt-4">
              <input type="hidden" name="competitionId" value={comp.id} />
              <input
                name="name"
                placeholder="Название дивизиона"
                className={`${inputClass} min-w-[200px] flex-1`}
              />
              <Button type="submit" size="sm" variant="ghost">
                + Дивизион
              </Button>
            </form>
          </Card>
        ))
      )}

      <Card>
        <h3 className="font-display font-bold">Регламент (кратко)</h3>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Дедлайн заявки</dt>
            <dd className="font-mono">{season.squadDeadlineHours} ч</dd>
          </div>
          <div>
            <dt className="text-muted">Макс. запасных</dt>
            <dd className="font-mono">{season.maxBench}</dd>
          </div>
          <div>
            <dt className="text-muted">Лист сезона</dt>
            <dd className="font-mono">{season.maxSquadSize} игр.</dd>
          </div>
        </dl>
        <Link href="/league/regulations" className="mt-4 inline-block text-sm text-accent hover:underline">
          Полный регламент →
        </Link>
      </Card>
    </>
  );
}
