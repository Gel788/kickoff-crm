import Link from "next/link";

export type BracketTeam = {
  clubId: string;
  name: string;
  seed: number;
};

export function KnockoutBracket({ teams }: { teams: BracketTeam[] }) {
  if (teams.length < 4) {
    return (
      <p className="text-sm text-muted">
        Нужно минимум 4 команды в таблице для сетки плей-офф (топ-8 по очкам).
      </p>
    );
  }

  const t8 = teams.slice(0, 8);
  while (t8.length < 8) {
    t8.push({ clubId: `bye-${t8.length}`, name: "—", seed: t8.length + 1 });
  }

  const qf = [
    { home: t8[0], away: t8[7], label: "QF1" },
    { home: t8[3], away: t8[4], label: "QF2" },
    { home: t8[1], away: t8[6], label: "QF3" },
    { home: t8[2], away: t8[5], label: "QF4" },
  ];

  const sf = [
    { label: "Полуфинал 1", hint: "Победитель QF1 vs QF2" },
    { label: "Полуфинал 2", hint: "Победитель QF3 vs QF4" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Посев 1/4 из таблицы (1 vs 8, 4 vs 5…). Создайте пары в календаре и ведите
        счёт на карточках матчей.
      </p>

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-[720px] items-stretch gap-4">
          <BracketRound title="1/4 финала">
            {qf.map((m) => (
              <MatchCard
                key={m.label}
                label={m.label}
                home={m.home}
                away={m.away}
              />
            ))}
          </BracketRound>

          <div className="flex w-8 shrink-0 flex-col justify-around py-8">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-px w-full bg-border/80" />
            ))}
          </div>

          <BracketRound title="1/2 финала">
            {sf.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-dashed border-accent/25 bg-accent-dim/5 p-4"
              >
                <p className="font-mono text-xs text-muted">{m.label}</p>
                <p className="mt-2 text-sm text-muted">{m.hint}</p>
                <p className="mt-3 font-medium text-white/80">TBD — TBD</p>
              </div>
            ))}
          </BracketRound>

          <div className="flex w-8 shrink-0 items-center">
            <div className="h-px w-full bg-border/80" />
          </div>

          <BracketRound title="Финал">
            <div className="rounded-xl border-2 border-accent/40 bg-accent-dim/15 p-5 text-center">
              <p className="font-mono text-xs text-accent">Финал кубка</p>
              <p className="mt-3 font-display text-xl font-bold">TBD</p>
              <p className="text-muted">—</p>
              <p className="mt-1 font-display text-xl font-bold">TBD</p>
              <Link
                href="/league/calendar"
                className="mt-4 inline-block text-xs font-medium text-accent hover:text-white"
              >
                + матч в календаре
              </Link>
            </div>
          </BracketRound>
        </div>
      </div>
    </div>
  );
}

function BracketRound({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <p className="font-mono text-xs uppercase tracking-wider text-muted">{title}</p>
      <div className="flex flex-1 flex-col justify-around gap-3">{children}</div>
    </div>
  );
}

function MatchCard({
  label,
  home,
  away,
}: {
  label: string;
  home: BracketTeam;
  away: BracketTeam;
}) {
  return (
    <div className="rounded-xl border border-border bg-elevated p-3">
      <p className="mb-2 font-mono text-[10px] text-muted">{label}</p>
      <BracketSlot team={home} />
      <p className="my-1 text-center text-[10px] text-muted">vs</p>
      <BracketSlot team={away} />
    </div>
  );
}

function BracketSlot({ team }: { team: BracketTeam }) {
  const isBye = team.clubId.startsWith("bye-");
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-base px-3 py-2">
      <span className="font-mono text-xs text-muted">#{team.seed}</span>
      {isBye ? (
        <span className="text-muted">{team.name}</span>
      ) : (
        <Link
          href={`/league/clubs/${team.clubId}`}
          className="font-medium hover:text-accent"
        >
          {team.name}
        </Link>
      )}
    </div>
  );
}
