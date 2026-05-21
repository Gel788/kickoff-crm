"use client";

import { Button } from "@/components/kickoff/button";
import { updateLeagueChecklist } from "@/lib/actions-match";
import { closeMatch } from "@/lib/actions";
import { useRouter } from "next/navigation";

export function LeagueCloseChecklist({
  fixtureId,
  eventsOk,
  signaturesOk,
  leagueReady,
}: {
  fixtureId: string;
  eventsOk: boolean;
  signaturesOk: boolean;
  leagueReady: boolean;
}) {
  const router = useRouter();
  const items = [
    { key: "eventsOk" as const, label: "События протокола проверены" },
    { key: "signaturesOk" as const, label: "Подписи делегатов / судьи" },
    { key: "leagueReady" as const, label: "Готов закрыть матч (таблица обновится)" },
  ];

  const allOk = eventsOk && signaturesOk && leagueReady;

  return (
    <div className="rounded-xl border border-warning/30 bg-warning/5 p-6">
      <h3 className="font-display font-bold text-warning">Проверка перед закрытием</h3>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.key}>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={
                  item.key === "eventsOk"
                    ? eventsOk
                    : item.key === "signaturesOk"
                      ? signaturesOk
                      : leagueReady
                }
                onChange={async (e) => {
                  await updateLeagueChecklist(
                    fixtureId,
                    item.key,
                    e.target.checked,
                  );
                  router.refresh();
                }}
              />
              {item.label}
            </label>
          </li>
        ))}
      </ul>
      <form action={closeMatch.bind(null, fixtureId)} className="mt-4">
        <Button type="submit" size="sm" disabled={!allOk}>
          Закрыть матч
        </Button>
      </form>
      {!allOk && (
        <p className="mt-2 text-xs text-muted">
          Отметьте все пункты, чтобы закрыть матч.
        </p>
      )}
    </div>
  );
}
