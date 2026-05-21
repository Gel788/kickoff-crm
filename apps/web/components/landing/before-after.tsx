import { X, Check } from "lucide-react";

const without = [
  "10 Google-таблиц на сезон",
  "WhatsApp: «кто в заявке?»",
  "Счёт в Excel после матча",
  "Протокол в Word в полночь",
  "Споры «он не был в заявке»",
];

const withKickoff = [
  "Один календарь на всю лигу",
  "Заявка lock до свистка",
  "Live-счёт с поля",
  "PDF протокол в 1 клик",
  "История событий по минутам",
];

export function BeforeAfter() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-danger/30 bg-danger/5 p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-danger">
          Без Kickoff
        </p>
        <h3 className="mt-2 font-display text-2xl font-bold">Хаос матчдена</h3>
        <ul className="mt-6 space-y-3">
          {without.map((t) => (
            <li key={t} className="flex items-start gap-3 text-sm text-muted">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-accent/40 bg-accent-dim/20 p-8 shadow-glow">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          С Kickoff
        </p>
        <h3 className="mt-2 font-display text-2xl font-bold">Один контур</h3>
        <ul className="mt-6 space-y-3">
          {withKickoff.map((t) => (
            <li key={t} className="flex items-start gap-3 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
