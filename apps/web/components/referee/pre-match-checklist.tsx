"use client";

import { updateRefereeChecklist } from "@/lib/actions-match";
import { useRouter } from "next/navigation";

export function PreMatchChecklist({
  fixtureId,
  squadsOk,
  captainsOk,
  coinTossOk,
  homeSubmitted,
  awaySubmitted,
}: {
  fixtureId: string;
  squadsOk: boolean;
  captainsOk: boolean;
  coinTossOk: boolean;
  homeSubmitted: boolean;
  awaySubmitted: boolean;
}) {
  const router = useRouter();

  const items = [
    {
      key: "squadsOk" as const,
      label: "Заявки обеих команд проверены",
      done: squadsOk,
      hint: homeSubmitted && awaySubmitted ? "Поданы" : "Не все поданы",
    },
    {
      key: "captainsOk" as const,
      label: "Капитаны отмечены в заявках",
      done: captainsOk,
    },
    {
      key: "coinTossOk" as const,
      label: "Жребий / выбор стороны",
      done: coinTossOk,
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-elevated p-4">
      <h3 className="font-display text-sm font-bold">Чек-лист до свистка</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.key}>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={item.done}
                onChange={async (e) => {
                  await updateRefereeChecklist(
                    fixtureId,
                    item.key,
                    e.target.checked,
                  );
                  router.refresh();
                }}
                className="mt-1"
              />
              <span>
                {item.label}
                {item.hint && (
                  <span className="block text-xs text-muted">{item.hint}</span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
