import { Activity, Calendar, Shield, Table2 } from "lucide-react";

const panels = [
  { icon: Calendar, label: "Календарь", value: "24 матча" },
  { icon: Table2, label: "Таблица", value: "авто" },
  { icon: Shield, label: "Допуск", value: "98%" },
  { icon: Activity, label: "Live", value: "3 матча" },
];

export function ProductPreview() {
  return (
    <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border/80 bg-elevated/80 p-1 shadow-2xl shadow-accent/5 backdrop-blur">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-danger/80" />
        <span className="h-3 w-3 rounded-full bg-warning/80" />
        <span className="h-3 w-3 rounded-full bg-accent/80" />
        <span className="ml-4 font-mono text-xs text-muted">
          kickoff.app/league
        </span>
      </div>
      <div className="grid gap-4 p-6 md:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          <div className="h-8 w-48 rounded-lg bg-hover" />
          <div className="grid grid-cols-2 gap-3">
            {panels.map((p) => (
              <div
                key={p.label}
                className="rounded-xl border border-border bg-base/60 p-4"
              >
                <p.icon className="h-5 w-5 text-accent" />
                <p className="mt-2 text-xs text-muted">{p.label}</p>
                <p className="font-mono text-lg font-bold">{p.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-base/60 p-4">
            <p className="text-xs text-muted">Ближайший матч</p>
            <p className="mt-2 font-display font-bold">Динамо — Спартак</p>
            <p className="font-mono text-xs text-accent">Суббота 15:00 · LIVE</p>
          </div>
        </div>
        <div className="rounded-xl border border-accent/20 bg-accent-dim/30 p-4">
          <p className="font-mono text-xs uppercase text-accent">Протокол</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex justify-between">
              <span>67&apos; Гол</span>
              <span className="text-muted">#10</span>
            </li>
            <li className="flex justify-between">
              <span>55&apos; ЖК</span>
              <span className="text-muted">#7</span>
            </li>
            <li className="flex justify-between">
              <span>34&apos; Гол</span>
              <span className="text-muted">#9</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
