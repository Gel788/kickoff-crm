import { Button } from "@/components/kickoff/button";
import { FormCard, inputClass, selectClass } from "@/components/kickoff/ui";
import {
  createFixture,
  createRound,
  generateRoundRobin,
} from "@/lib/actions-season";
import type { Club, Round } from "@prisma/client";

export function CalendarMatchForms({
  seasonId,
  divisionId,
  rounds,
  clubs,
}: {
  seasonId: string;
  divisionId: string;
  rounds: Round[];
  clubs: Club[];
}) {
  const nextRoundNumber =
    rounds.length > 0 ? Math.max(...rounds.map((r) => r.number)) + 1 : 1;

  return (
    <div className="mb-10 grid gap-6 lg:grid-cols-3">
      <form action={createFixture} className="lg:col-span-2">
        <FormCard
          title="Добавить матч"
          description={
            rounds.length === 0
              ? "Сначала создайте тур (форма справа)"
              : "Один матч в выбранный тур"
          }
        >
          {rounds.length === 0 ? (
            <p className="text-sm text-muted">Нет туров — добавьте тур справа.</p>
          ) : clubs.length < 2 ? (
            <p className="text-sm text-muted">
              Нужно минимум 2 клуба в сезоне (
              <a href="/league/clubs" className="text-accent underline">
                Клубы
              </a>
              ).
            </p>
          ) : (
            <>
              <select name="roundId" required className={selectClass}>
                {rounds.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name ?? `Тур ${r.number}`}
                  </option>
                ))}
              </select>
              <div className="grid gap-3 sm:grid-cols-2">
                <select name="homeClubId" required className={selectClass}>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (дом)
                    </option>
                  ))}
                </select>
                <select name="awayClubId" required className={selectClass}>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (гости)
                    </option>
                  ))}
                </select>
              </div>
              <input
                name="scheduledAt"
                type="datetime-local"
                required
                className={inputClass}
              />
              <input
                name="venue"
                placeholder="Стадион (необязательно)"
                className={inputClass}
              />
              <Button type="submit" size="sm">
                Создать матч
              </Button>
            </>
          )}
        </FormCard>
      </form>

      <div className="space-y-6">
        <form action={createRound}>
          <FormCard title="Новый тур">
            <input type="hidden" name="divisionId" value={divisionId} />
            <input
              name="number"
              type="number"
              defaultValue={nextRoundNumber}
              required
              className={inputClass}
              placeholder="Номер тура"
            />
            <input
              name="name"
              className={inputClass}
              placeholder="Название (опционально)"
            />
            <Button type="submit" size="sm" variant="outline">
              Добавить тур
            </Button>
          </FormCard>
        </form>

        <form action={generateRoundRobin}>
          <FormCard
            title="Весь тур сразу"
            description="Все пары клубов круга на выбранную дату"
          >
            <input type="hidden" name="divisionId" value={divisionId} />
            <input type="hidden" name="seasonId" value={seasonId} />
            <input
              name="roundNumber"
              type="number"
              defaultValue={nextRoundNumber}
              required
              className={inputClass}
              placeholder="Номер тура"
            />
            <input name="startDate" type="date" required className={inputClass} />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={clubs.length < 2}
            >
              Сгенерировать пары
            </Button>
          </FormCard>
        </form>
      </div>
    </div>
  );
}
