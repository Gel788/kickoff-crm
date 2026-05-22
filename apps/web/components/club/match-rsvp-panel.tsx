"use client";

import { setMatchRsvp } from "@/lib/actions-rsvp";
import { MatchRsvpStatus } from "@prisma/client";
import { useTransition } from "react";

const LABELS: Record<MatchRsvpStatus, string> = {
  GOING: "Будет",
  MAYBE: "Может",
  NOT_GOING: "Нет",
};

const STYLES: Record<MatchRsvpStatus, string> = {
  GOING: "bg-accent/20 text-accent border-accent/40",
  MAYBE: "bg-warning/15 text-warning border-warning/40",
  NOT_GOING: "bg-danger/15 text-danger border-danger/40",
};

type PlayerRow = {
  registrationId: string;
  name: string;
  number: number | null;
  status: MatchRsvpStatus | null;
};

export function MatchRsvpPanel({
  fixtureId,
  players,
}: {
  fixtureId: string;
  players: PlayerRow[];
}) {
  const [pending, startTransition] = useTransition();

  const counts = players.reduce(
    (acc, p) => {
      if (p.status === "GOING") acc.going++;
      else if (p.status === "MAYBE") acc.maybe++;
      else if (p.status === "NOT_GOING") acc.no++;
      else acc.unknown++;
      return acc;
    },
    { going: 0, maybe: 0, no: 0, unknown: 0 },
  );

  return (
    <div className="mb-6 rounded-xl border border-accent/25 bg-accent-dim/15 p-4">
      <h3 className="mb-1 font-display text-sm font-bold">
        Готовность к матчу (RSVP)
      </h3>
      <p className="mb-3 text-xs text-muted">
        Как в OpenLeague: отметьте, кто планирует играть, до подачи официальной заявки.
        {" "}
        <span className="font-mono text-foreground">
          {counts.going} да · {counts.maybe} может · {counts.no} нет
          {counts.unknown > 0 ? ` · ${counts.unknown} не отмечено` : ""}
        </span>
      </p>
      <ul className="max-h-48 space-y-2 overflow-y-auto">
        {players.map((p) => (
          <li
            key={p.registrationId}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-base px-3 py-2 text-sm"
          >
            <span>
              {p.number != null && (
                <span className="mr-2 font-mono text-muted">{p.number}</span>
              )}
              {p.name}
            </span>
            <div className="flex gap-1">
              {(["GOING", "MAYBE", "NOT_GOING"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(() =>
                      setMatchRsvp(fixtureId, p.registrationId, status),
                    )
                  }
                  className={`rounded border px-2 py-0.5 text-xs font-medium transition-colors ${
                    p.status === status
                      ? STYLES[status]
                      : "border-border text-muted hover:border-border/80"
                  }`}
                >
                  {LABELS[status]}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
