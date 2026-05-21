"use client";

import { Button } from "@/components/kickoff/button";
import { saveSquad, submitSquad } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Reg = {
  id: string;
  name: string;
  number: number | null;
  eligibility: string;
  blockReason?: string | null;
};

export function SquadPicker({
  fixtureId,
  clubId,
  clubName,
  registrations,
  existingIds,
  captainId: initialCaptain,
  status,
  rejectReason,
}: {
  fixtureId: string;
  clubId: string;
  clubName: string;
  registrations: Reg[];
  existingIds: string[];
  captainId?: string;
  status: string;
  rejectReason?: string | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(existingIds);
  const [captain, setCaptain] = useState(initialCaptain ?? "");
  const locked = status === "LOCKED" || status === "APPROVED";

  function toggle(id: string) {
    if (locked) return;
    const reg = registrations.find((r) => r.id === id);
    if (reg?.eligibility !== "ELIGIBLE") return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div className="rounded-xl border border-border bg-elevated p-6">
      <h3 className="font-display text-lg font-bold">{clubName}</h3>
      <p className="text-xs text-muted">Статус заявки: {status}</p>
      {rejectReason && (
        <p className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
          Отклонено: {rejectReason}
        </p>
      )}

      <ul className="mt-4 max-h-64 space-y-1 overflow-y-auto">
        {registrations.map((r) => {
          const disabled = Boolean(r.blockReason) || r.eligibility !== "ELIGIBLE";
          const on = selected.includes(r.id);
          return (
            <li key={r.id}>
              <button
                type="button"
                disabled={disabled || locked}
                onClick={() => toggle(r.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  on ? "bg-accent-dim text-accent" : "hover:bg-hover"
                } ${disabled ? "opacity-40" : ""}`}
              >
                <span>
                  {r.number != null && (
                    <span className="mr-2 font-mono text-muted">{r.number}</span>
                  )}
                  {r.name}
                </span>
                {disabled && (
                  <span className="text-xs text-danger">
                    {r.blockReason ?? "не допущен"}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {!locked && (
        <>
          <label className="mt-4 block text-xs text-muted">
            Капитан
            <select
              value={captain}
              onChange={(e) => setCaptain(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2"
            >
              <option value="">—</option>
              {selected.map((id) => {
                const r = registrations.find((x) => x.id === id);
                return r ? (
                  <option key={id} value={id}>
                    {r.name}
                  </option>
                ) : null;
              })}
            </select>
          </label>

          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={selected.length < 7 || !captain}
              onClick={async () => {
                await saveSquad(fixtureId, clubId, selected, captain);
                router.refresh();
              }}
            >
              Сохранить
            </Button>
            <Button
              type="button"
              disabled={selected.length < 7 || !captain}
              onClick={async () => {
                await saveSquad(fixtureId, clubId, selected, captain);
                await submitSquad(fixtureId, clubId);
                router.refresh();
              }}
            >
              Подать заявку
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
