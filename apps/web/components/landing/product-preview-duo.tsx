import { Activity, Building2, ClipboardList, Table2, Users } from "lucide-react";

function MockWindow({
  title,
  accent,
  children,
}: {
  title: string;
  accent: "league" | "club";
  children: React.ReactNode;
}) {
  const border = accent === "league" ? "border-accent/30" : "border-info/30";
  const dot = accent === "league" ? "bg-accent" : "bg-info";
  return (
    <div
      className={`overflow-hidden rounded-2xl border ${border} bg-elevated/90 shadow-xl`}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        <span className="font-mono text-[10px] text-muted">{title}</span>
      </div>
      {children}
    </div>
  );
}

export function ProductPreviewDuo() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <MockWindow title="kickoff.app/league — оператор лиги" accent="league">
        <div className="space-y-3 p-5">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-accent" />
            <span className="text-xs font-bold">Дашборд лиги</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { l: "Матчи сегодня", v: "4", i: Activity },
              { l: "Просроч. заявки", v: "1", i: ClipboardList },
              { l: "На проверке", v: "2", i: Table2 },
              { l: "Live сейчас", v: "1", i: Activity },
            ].map((c) => (
              <div
                key={c.l}
                className="rounded-lg border border-border bg-base/60 px-3 py-2"
              >
                <c.i className="h-3.5 w-3.5 text-accent" />
                <p className="mt-1 text-[10px] text-muted">{c.l}</p>
                <p className="font-mono text-lg font-bold">{c.v}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-[11px] text-warning">
            ⚠ Спартак — заявка не подана · тур 12
          </div>
          <p className="text-[10px] text-muted">
            → Видно, что требует внимания, до звонка тренеру
          </p>
        </div>
      </MockWindow>

      <MockWindow title="kickoff.app/club — тренер" accent="club">
        <div className="space-y-3 p-5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-info" />
            <span className="text-xs font-bold">Кабинет клуба</span>
          </div>
          <div className="rounded-lg border border-info/30 bg-info/5 p-3">
            <p className="text-[10px] font-bold uppercase text-info">
              Заявка открыта
            </p>
            <p className="mt-1 font-display text-sm font-bold">
              Динамо — Зенит
            </p>
            <p className="text-[10px] text-muted">Сб 15:00 · дедлайн 48ч</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-base">
              <div className="h-full w-3/4 rounded-full bg-info" />
            </div>
            <p className="mt-1 text-[10px] text-muted">18/20 в заявке</p>
          </div>
          <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
            {["№1 Иванов", "№7 Петров", "№10 Сидоров"].map((n) => (
              <span
                key={n}
                className="rounded border border-border bg-base/50 px-1 py-1"
              >
                {n}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-muted">
            → Тренер подаёт состав без звонка в лигу
          </p>
        </div>
      </MockWindow>
    </div>
  );
}
