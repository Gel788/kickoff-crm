import { Button } from "@/components/kickoff/button";
import { assignRefereeSlot } from "@/lib/actions-registry";
import {
  REFEREE_SLOT_LABELS,
  REFEREE_SLOT_ORDER,
  chiefAssignment,
  type RefereeAssignmentWithUser,
} from "@/lib/referee-slots";
import Link from "next/link";

type RefereeOption = { id: string; name: string | null };

export function RefereeSlotsPanel({
  fixtureId,
  assignments,
  referees,
  canManage,
}: {
  fixtureId: string;
  assignments: RefereeAssignmentWithUser[];
  referees: RefereeOption[];
  canManage: boolean;
}) {
  const chief = chiefAssignment(assignments);
  const bySlot = new Map(assignments.map((a) => [a.slot, a]));

  return (
    <section className="mb-8 rounded-xl border border-border bg-elevated p-6">
      <h2 className="mb-4 font-display text-lg font-bold">Судейская бригада (4)</h2>
      <div className="space-y-3">
        {REFEREE_SLOT_ORDER.map((slot) => {
          const assigned = bySlot.get(slot);
          return (
            <div
              key={slot}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-base px-4 py-3"
            >
              <span className="text-sm font-medium">{REFEREE_SLOT_LABELS[slot]}</span>
              {assigned ? (
                <span className="text-sm text-muted">
                  {assigned.user.name ?? assigned.user.email}
                </span>
              ) : canManage && referees.length > 0 ? (
                <form
                  className="flex flex-wrap items-center gap-2"
                  action={async (fd) => {
                    "use server";
                    await assignRefereeSlot(
                      fixtureId,
                      String(fd.get("refereeId") ?? ""),
                      slot,
                    );
                  }}
                >
                  <input type="hidden" name="slot" value={slot} />
                  <select
                    name="refereeId"
                    className="rounded-lg border border-border bg-elevated px-2 py-1 text-sm"
                    required
                  >
                    <option value="">Выберите…</option>
                    {referees.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="sm">
                    Назначить
                  </Button>
                </form>
              ) : (
                <span className="text-sm text-muted">не назначен</span>
              )}
            </div>
          );
        })}
      </div>
      {chief && (
        <div className="mt-4">
          <Link href={`/referee/match/${fixtureId}`}>
            <Button size="sm" variant="ghost">
              Экран судьи (главный) →
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}
