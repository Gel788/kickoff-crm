import { Button } from "@/components/kickoff/button";
import {
  setMedicalClearance,
  updateMedicalReport,
} from "@/lib/actions-medical";
import { MedicalStatus } from "@prisma/client";

export function MedicalPanel({
  fixtureId,
  registrations,
  report,
}: {
  fixtureId: string;
  registrations: {
    id: string;
    name: string;
    club: string;
    latest?: MedicalStatus | null;
  }[];
  report: { summary: string | null; injuries: string | null } | null;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-elevated p-6">
        <h3 className="font-display font-bold">Допуск на матч</h3>
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {registrations.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-hover px-3 py-2 text-sm"
            >
              <span>
                {r.name} <span className="text-muted">({r.club})</span>
              </span>
              <div className="flex gap-1">
                {(["CLEARED", "RESTRICTED", "NOT_CLEARED"] as MedicalStatus[]).map(
                  (st) => (
                    <form
                      key={st}
                      action={async () => {
                        "use server";
                        await setMedicalClearance(r.id, fixtureId, st);
                      }}
                    >
                      <Button type="submit" size="sm" variant="ghost">
                        {st === "CLEARED"
                          ? "OK"
                          : st === "RESTRICTED"
                            ? "Огр."
                            : "Нет"}
                      </Button>
                    </form>
                  ),
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <form
        action={updateMedicalReport.bind(null, fixtureId)}
        className="rounded-xl border border-border bg-elevated p-6 space-y-4"
      >
        <h3 className="font-display font-bold">Медпротокол матча</h3>
        <textarea
          name="summary"
          defaultValue={report?.summary ?? ""}
          placeholder="Итог медслужбы"
          className="w-full rounded-lg border border-border bg-base px-3 py-2 text-sm"
          rows={3}
        />
        <textarea
          name="injuries"
          defaultValue={report?.injuries ?? ""}
          placeholder="Травмы (минута, игрок)"
          className="w-full rounded-lg border border-border bg-base px-3 py-2 text-sm"
          rows={3}
        />
        <Button type="submit" size="sm">
          Сохранить медпротокол
        </Button>
      </form>
    </div>
  );
}
