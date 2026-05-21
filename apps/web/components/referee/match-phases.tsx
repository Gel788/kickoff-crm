"use client";

import { Button } from "@/components/kickoff/button";
import { setMatchPhase } from "@/lib/actions-match";
import { MatchPhase } from "@prisma/client";
import { useRouter } from "next/navigation";

const PHASE_LABELS: Record<MatchPhase, string> = {
  PRE_MATCH: "До матча",
  FIRST_HALF: "1-й тайм",
  HALFTIME: "Перерыв",
  SECOND_HALF: "2-й тайм",
  FULL_TIME: "Финальный свисток",
};

export function MatchPhases({
  fixtureId,
  phase,
  kickoffAt,
  halftimeAt,
  secondHalfAt,
  fullTimeAt,
}: {
  fixtureId: string;
  phase: MatchPhase;
  kickoffAt?: Date | null;
  halftimeAt?: Date | null;
  secondHalfAt?: Date | null;
  fullTimeAt?: Date | null;
}) {
  const router = useRouter();

  const next: Partial<Record<MatchPhase, MatchPhase>> = {
    FIRST_HALF: "HALFTIME",
    HALFTIME: "SECOND_HALF",
    SECOND_HALF: "FULL_TIME",
  };

  const times = [
    kickoffAt && `Старт: ${kickoffAt.toLocaleTimeString("ru-RU")}`,
    halftimeAt && `Перерыв: ${halftimeAt.toLocaleTimeString("ru-RU")}`,
    secondHalfAt && `2-й тайм: ${secondHalfAt.toLocaleTimeString("ru-RU")}`,
    fullTimeAt && `Конец: ${fullTimeAt.toLocaleTimeString("ru-RU")}`,
  ].filter(Boolean);

  return (
    <div className="rounded-xl border border-accent/30 bg-accent-dim/20 p-4">
      <p className="font-mono text-xs uppercase text-accent">Фаза матча</p>
      <p className="mt-1 font-display text-lg font-bold">{PHASE_LABELS[phase]}</p>
      {times.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-muted">
          {times.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
      {next[phase] && (
        <Button
          type="button"
          size="sm"
          className="mt-3 w-full"
          onClick={async () => {
            await setMatchPhase(fixtureId, next[phase]!);
            router.refresh();
          }}
        >
          {phase === "FIRST_HALF" && "Перерыв"}
          {phase === "HALFTIME" && "Начать 2-й тайм"}
          {phase === "SECOND_HALF" && "Финальный свисток"}
        </Button>
      )}
    </div>
  );
}
