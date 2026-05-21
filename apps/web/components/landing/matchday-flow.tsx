import { MatchdayJourney } from "@/components/kickoff/matchday-journey";

export function MatchdayFlow() {
  return (
    <section className="relative overflow-hidden border-y border-white/[0.04] bg-[#080b0e] py-28">
      <div className="pointer-events-none absolute inset-0 landing-aurora opacity-60" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-accent">
              Один матч
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">
              От заявки до финального свистка
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted md:text-right">
            Пять шагов. Три роли. Одна версия правды — без таблиц в мессенджерах.
          </p>
        </div>
        <div className="mt-14">
          <MatchdayJourney />
        </div>
      </div>
    </section>
  );
}
