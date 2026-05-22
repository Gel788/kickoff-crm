"use client";

import { Button } from "@/components/kickoff/button";
import { Card } from "@/components/kickoff/ui";
import {
  balanceTeams,
  parseBalancerLines,
  type BalancerPlayer,
} from "@/lib/team-balancer";
import { useMemo, useState } from "react";

const EXAMPLE = `Алексей, 8
Дмитрий, 7
Максим, 6
Никита, 9
Артём, 5
Илья, 7
Кирилл, 4
Егор, 6`;

export function TeamBalancerPanel() {
  const [text, setText] = useState(EXAMPLE);

  const result = useMemo(() => {
    const players = parseBalancerLines(text);
    if (players.length < 2) return null;
    return balanceTeams(players);
  }, [text]);

  function TeamList({
    title,
    list,
    total,
  }: {
    title: string;
    list: BalancerPlayer[];
    total: number;
  }) {
    return (
      <Card className="!p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display font-bold">{title}</h3>
          <span className="font-mono text-sm text-accent">Σ {total}</span>
        </div>
        <ul className="space-y-1.5 text-sm">
          {list.map((p) => (
            <li key={p.id} className="flex justify-between gap-2">
              <span>{p.name}</span>
              <span className="font-mono text-muted">{p.skill}</span>
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-medium text-muted">
          Игроки — имя и сила 1–10 (как в pickup / Sunday League)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          className="w-full rounded-xl border border-border bg-base/50 px-4 py-3 font-mono text-sm outline-none focus:border-accent/50"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => setText(EXAMPLE)}
        >
          Пример
        </Button>
      </div>

      {result ? (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Разница рейтинга:{" "}
            <span className="font-mono text-accent">
              {Math.abs(result.totalA - result.totalB)}
            </span>
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TeamList title="Команда A" list={result.teamA} total={result.totalA} />
            <TeamList title="Команда B" list={result.teamB} total={result.totalB} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">Минимум 2 игрока</p>
      )}
    </div>
  );
}
