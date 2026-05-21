import { Button } from "@/components/kickoff/button";
import { postponeFixture, rejectSquad, reopenMatch } from "@/lib/actions-fixtures";

export function FixtureOps({
  fixtureId,
  homeClubId,
  awayClubId,
  scheduledAt,
  status,
  canReopen,
}: {
  fixtureId: string;
  homeClubId: string;
  awayClubId: string;
  scheduledAt: string;
  status: string;
  canReopen: boolean;
}) {
  const dt = scheduledAt.slice(0, 16);

  return (
    <div className="mb-8 grid gap-4 rounded-xl border border-border bg-elevated p-6 lg:grid-cols-2">
      <form action={postponeFixture} className="space-y-2">
        <h3 className="text-sm font-bold">Перенос матча</h3>
        <input type="hidden" name="fixtureId" value={fixtureId} />
        <input
          name="scheduledAt"
          type="datetime-local"
          defaultValue={dt}
          className="w-full rounded-lg border border-border bg-base px-3 py-2 text-sm"
        />
        <input
          name="reason"
          placeholder="Причина переноса"
          className="w-full rounded-lg border border-border bg-base px-3 py-2 text-sm"
        />
        <Button type="submit" size="sm" variant="outline">
          Перенести
        </Button>
      </form>

      {["SQUADS_SUBMITTED", "SQUADS_OPEN", "SQUADS_APPROVED"].includes(status) && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold">Отклонить заявку</h3>
          <form action={rejectSquad} className="flex gap-2">
            <input type="hidden" name="fixtureId" value={fixtureId} />
            <input type="hidden" name="clubId" value={homeClubId} />
            <input
              name="reason"
              placeholder="Комментарий хозяевам"
              className="flex-1 rounded-lg border border-border bg-base px-3 py-2 text-sm"
            />
            <Button type="submit" size="sm" variant="danger">
              Хозяева
            </Button>
          </form>
          <form action={rejectSquad} className="flex gap-2">
            <input type="hidden" name="fixtureId" value={fixtureId} />
            <input type="hidden" name="clubId" value={awayClubId} />
            <input
              name="reason"
              placeholder="Комментарий гостям"
              className="flex-1 rounded-lg border border-border bg-base px-3 py-2 text-sm"
            />
            <Button type="submit" size="sm" variant="danger">
              Гости
            </Button>
          </form>
        </div>
      )}

      {canReopen && status === "CLOSED" && (
        <form action={reopenMatch} className="space-y-2 lg:col-span-2">
          <h3 className="text-sm font-bold">Переоткрыть матч</h3>
          <input type="hidden" name="fixtureId" value={fixtureId} />
          <input
            name="reason"
            required
            placeholder="Причина (аудит)"
            className="w-full rounded-lg border border-border bg-base px-3 py-2 text-sm"
          />
          <Button type="submit" size="sm" variant="ghost">
            Вернуть на проверку протокола
          </Button>
        </form>
      )}
    </div>
  );
}
