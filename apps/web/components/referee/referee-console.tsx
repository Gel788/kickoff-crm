"use client";

import { Button } from "@/components/kickoff/button";
import { MatchPhases } from "@/components/referee/match-phases";
import { PreMatchChecklist } from "@/components/referee/pre-match-checklist";
import { addMatchEvent, finishMatch, startMatch } from "@/lib/actions";
import { addRefereeNote } from "@/lib/actions-match";
import { MatchEventType, MatchPhase } from "@prisma/client";
import {
  enqueueRefereeEvent,
  getPendingForFixture,
  removeQueuedEvent,
  type QueuedRefereeEvent,
} from "@/lib/referee-offline-queue";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Player = { id: string; name: string; regId: string };
type Team = { id: string; name: string; players: Player[] };

export function RefereeConsole({
  fixtureId,
  status,
  home,
  away,
  homeScore,
  awayScore,
  matchPhase,
  kickoffAt,
  halftimeAt,
  secondHalfAt,
  fullTimeAt,
  checklist,
  homeSubmitted,
  awaySubmitted,
}: {
  fixtureId: string;
  status: string;
  home: Team;
  away: Team;
  homeScore: number;
  awayScore: number;
  matchPhase: MatchPhase;
  kickoffAt?: Date | null;
  halftimeAt?: Date | null;
  secondHalfAt?: Date | null;
  fullTimeAt?: Date | null;
  checklist?: {
    squadsOk: boolean;
    captainsOk: boolean;
    coinTossOk: boolean;
  } | null;
  homeSubmitted: boolean;
  awaySubmitted: boolean;
}) {
  const router = useRouter();
  const [minute, setMinute] = useState(1);
  const [teamId, setTeamId] = useState(home.id);
  const [playerRegId, setPlayerRegId] = useState("");
  const [playerOutId, setPlayerOutId] = useState("");
  const [playerInId, setPlayerInId] = useState("");
  const [subMode, setSubMode] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [startError, setStartError] = useState("");
  const [pending, setPending] = useState<QueuedRefereeEvent[]>([]);
  const [offlineMsg, setOfflineMsg] = useState("");

  const refreshPending = useCallback(() => {
    setPending(getPendingForFixture(fixtureId));
  }, [fixtureId]);

  useEffect(() => {
    refreshPending();
  }, [refreshPending]);

  async function flushPending() {
    const queue = getPendingForFixture(fixtureId);
    for (const item of queue) {
      await addMatchEvent(fixtureId, {
        type: item.type as MatchEventType,
        minute: item.minute,
        teamClubId: item.teamClubId,
        registrationId: item.registrationId,
        secondaryRegId: item.secondaryRegId,
      });
      removeQueuedEvent(item.id);
    }
    refreshPending();
    if (queue.length > 0) router.refresh();
  }

  useEffect(() => {
    function onOnline() {
      void flushPending();
    }
    window.addEventListener("online", onOnline);
    if (navigator.onLine) void flushPending();
    return () => window.removeEventListener("online", onOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId]);

  const teams = [home, away];
  const selectedTeam = teams.find((t) => t.id === teamId) ?? home;
  const canStart =
    checklist?.squadsOk && checklist?.captainsOk && checklist?.coinTossOk;

  async function run(fn: () => Promise<void>) {
    setLoading(true);
    setStartError("");
    setOfflineMsg("");
    try {
      await fn();
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка";
      if (msg === "CHECKLIST_INCOMPLETE") {
        setStartError("Заполните чек-лист до свистка");
      } else {
        setOfflineMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function recordEvent(payload: {
    type: MatchEventType;
    minute: number;
    teamClubId: string;
    registrationId?: string;
    secondaryRegId?: string;
  }) {
    if (!navigator.onLine) {
      enqueueRefereeEvent(fixtureId, payload);
      refreshPending();
      setOfflineMsg("Событие в очереди — отправится при сети");
      return;
    }
    try {
      await addMatchEvent(fixtureId, payload);
      await flushPending();
      router.refresh();
    } catch {
      enqueueRefereeEvent(fixtureId, payload);
      refreshPending();
      setOfflineMsg("Не удалось отправить — событие в очереди");
    }
  }

  const quickEvents: { type: MatchEventType; label: string; color?: string }[] = [
    { type: "GOAL", label: "Гол" },
    { type: "YELLOW", label: "ЖК", color: "text-warning" },
    { type: "RED", label: "КК", color: "text-danger" },
    { type: "INJURY", label: "Травма" },
    { type: "VAR_DECISION", label: "VAR" },
  ];

  const preLive = ["SQUADS_LOCKED", "SQUADS_APPROVED", "SCHEDULED"].includes(
    status,
  );

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          <p className="font-medium text-warning">
            Очередь офлайн: {pending.length} событий
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2"
            disabled={loading}
            onClick={() => run(() => flushPending())}
          >
            Отправить сейчас
          </Button>
        </div>
      )}
      {offlineMsg && (
        <p className="text-center text-xs text-warning">{offlineMsg}</p>
      )}
      <div className="rounded-2xl border border-border bg-elevated p-8 text-center">
        <p className="font-mono text-xs uppercase text-muted">Счёт</p>
        <p className="mt-2 font-mono text-6xl font-bold tracking-tight">
          <span className="text-accent">{homeScore}</span>
          <span className="mx-4 text-muted">:</span>
          <span className="text-accent">{awayScore}</span>
        </p>
        <p className="mt-2 text-sm text-muted">
          {home.name} — {away.name}
        </p>
      </div>

      {preLive && (
        <PreMatchChecklist
          fixtureId={fixtureId}
          squadsOk={checklist?.squadsOk ?? false}
          captainsOk={checklist?.captainsOk ?? false}
          coinTossOk={checklist?.coinTossOk ?? false}
          homeSubmitted={homeSubmitted}
          awaySubmitted={awaySubmitted}
        />
      )}

      {status === "LIVE" && (
        <MatchPhases
          fixtureId={fixtureId}
          phase={matchPhase}
          kickoffAt={kickoffAt}
          halftimeAt={halftimeAt}
          secondHalfAt={secondHalfAt}
          fullTimeAt={fullTimeAt}
        />
      )}

      {preLive && status !== "LIVE" && (
        <>
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={loading || !canStart}
            onClick={() => run(() => startMatch(fixtureId))}
          >
            Начать матч (свисток)
          </Button>
          {!canStart && (
            <p className="text-center text-xs text-muted">
              Отметьте все пункты чек-листа
            </p>
          )}
          {startError && (
            <p className="text-center text-xs text-danger">{startError}</p>
          )}
        </>
      )}

      {status === "LIVE" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-muted">
              Минута
              <input
                type="number"
                min={1}
                max={120}
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-3 font-mono text-lg"
              />
            </label>
            <label className="text-xs text-muted">
              Команда
              <select
                value={teamId}
                onChange={(e) => {
                  setTeamId(e.target.value);
                  setPlayerRegId("");
                  setPlayerOutId("");
                  setPlayerInId("");
                }}
                className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-3"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!subMode ? (
            <>
              <label className="block text-xs text-muted">
                Игрок
                <select
                  value={playerRegId}
                  onChange={(e) => setPlayerRegId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2"
                >
                  <option value="">—</option>
                  {selectedTeam.players.map((p) => (
                    <option key={p.regId} value={p.regId}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {quickEvents.map((ev) => (
                  <Button
                    key={ev.type}
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={loading || !playerRegId}
                    className={ev.color}
                    onClick={() =>
                      run(async () => {
                        await recordEvent({
                          type: ev.type,
                          minute,
                          teamClubId: teamId,
                          registrationId: playerRegId,
                        });
                      })
                    }
                  >
                    {ev.label}
                  </Button>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setSubMode(true)}
              >
                Замена (вышел / вошёл)
              </Button>
            </>
          ) : (
            <div className="space-y-3 rounded-xl border border-border bg-elevated p-4">
              <p className="text-sm font-bold">Замена</p>
              <label className="block text-xs text-muted">
                Вышел
                <select
                  value={playerOutId}
                  onChange={(e) => setPlayerOutId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2"
                >
                  <option value="">—</option>
                  {selectedTeam.players.map((p) => (
                    <option key={p.regId} value={p.regId}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-muted">
                Вошёл
                <select
                  value={playerInId}
                  onChange={(e) => setPlayerInId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2"
                >
                  <option value="">—</option>
                  {selectedTeam.players.map((p) => (
                    <option key={p.regId} value={p.regId}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="lg"
                  className="flex-1"
                  disabled={loading || !playerOutId || !playerInId}
                  onClick={() =>
                    run(async () => {
                      await recordEvent({
                        type: "SUBSTITUTION",
                        minute,
                        teamClubId: teamId,
                        registrationId: playerInId,
                        secondaryRegId: playerOutId,
                      });
                      setSubMode(false);
                    })
                  }
                >
                  Зафиксировать
                </Button>
                <Button type="button" variant="ghost" onClick={() => setSubMode(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-elevated p-4">
            <p className="text-xs text-muted">Заметка судьи</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-base px-3 py-2 text-sm"
              rows={2}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="mt-2"
              disabled={!note.trim() || loading}
              onClick={() =>
                run(async () => {
                  await addRefereeNote(fixtureId, note.trim());
                  setNote("");
                })
              }
            >
              Добавить в протокол
            </Button>
          </div>

          <Button
            type="button"
            variant="danger"
            size="lg"
            className="w-full"
            disabled={loading}
            onClick={() => run(() => finishMatch(fixtureId))}
          >
            Завершить матч
          </Button>
        </>
      )}

      {status === "PROTOCOL_REVIEW" && (
        <p className="text-center text-muted">
          Матч завершён. Ожидает проверки лиги.
        </p>
      )}
    </div>
  );
}
