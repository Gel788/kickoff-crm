import { getLandingDemoData } from "@/lib/landing-demo";
import { format } from "@/lib/format";
import Link from "next/link";
import { ArrowRight, Radio, Trophy } from "lucide-react";

export async function LandingLiveData() {
  const data = await getLandingDemoData();

  if (!data) {
    return (
      <section id="demo-data" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-center text-muted">
          Демо-лига не найдена. Запустите{" "}
          <code className="text-accent">npm run db:setup</code>
        </p>
      </section>
    );
  }

  return (
    <section id="demo-data" className="relative mx-auto max-w-6xl px-6 py-28">
      <div className="text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-accent">
          Живые данные
        </p>
        <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          Не макет — ваша демо-лига
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Как публичный хаб в OpenLeague: таблица и бомбардиры из реальной БД, live и API
          на slug <span className="font-mono text-accent">{data.orgSlug}</span>
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-elevated/90 p-6 backdrop-blur-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">{data.orgName}</h3>
            <span className="font-mono text-xs text-muted">{data.seasonName}</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-muted">
                <th className="pb-2">#</th>
                <th className="pb-2">Клуб</th>
                <th className="pb-2 text-center">О</th>
                <th className="pb-2 text-center">±</th>
              </tr>
            </thead>
            <tbody>
              {data.standings.map((row, i) => (
                <tr key={row.clubId} className="border-b border-white/5">
                  <td className="py-2.5 font-mono text-muted">{i + 1}</td>
                  <td className="py-2.5 font-medium">{row.clubName}</td>
                  <td className="py-2.5 text-center font-mono font-bold text-accent">
                    {row.points}
                  </td>
                  <td className="py-2.5 text-center font-mono text-muted">
                    {row.gd > 0 ? "+" : ""}
                    {row.gd}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <Link
              href={`/embed/${data.orgSlug}/standings`}
              target="_blank"
              className="text-accent hover:underline"
            >
              Embed таблицы →
            </Link>
            <Link
              href={`/api/v1/${data.orgSlug}/standings`}
              target="_blank"
              className="text-muted hover:text-white"
            >
              API JSON →
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-accent/25 bg-accent/5 p-5">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase text-accent">
              <Radio className="h-3.5 w-3.5" />
              Сейчас
            </p>
            <p className="mt-3 font-display text-3xl font-bold">
              {data.liveCount > 0 ? `${data.liveCount} LIVE` : "—"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {data.closedCount} матчей закрыто в сезоне
            </p>
            <Link
              href={`/live/${data.orgSlug}`}
              className="mt-4 inline-flex items-center gap-1 text-sm text-accent hover:underline"
            >
              Live-табло <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-elevated/90 p-5">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase text-muted">
              <Trophy className="h-3.5 w-3.5" />
              Бомбардиры
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {data.scorers.slice(0, 5).map((s, i) => (
                <li key={s.name} className="flex justify-between">
                  <span>
                    <span className="font-mono text-muted">{i + 1}.</span> {s.name}
                  </span>
                  <span className="font-mono font-bold text-accent">{s.goals}</span>
                </li>
              ))}
            </ul>
          </div>

          {data.nextFixture && (
            <div className="rounded-2xl border border-info/20 bg-info/5 p-5 text-sm">
              <p className="font-mono text-[10px] uppercase text-info">Ближайший</p>
              <p className="mt-2 font-display font-bold">{data.nextFixture.label}</p>
              <p className="mt-1 text-muted">
                {format.datetime(data.nextFixture.at)}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
