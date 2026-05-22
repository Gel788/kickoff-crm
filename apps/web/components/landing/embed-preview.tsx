import Link from "next/link";

export function EmbedPreview() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const standingsSrc = `${appUrl}/embed/demo/standings`;

  return (
    <section id="embed" className="mx-auto max-w-6xl px-6 py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-accent">
            Для сайта лиги
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
            Виджеты без разработки
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            Вставьте таблицу или бомбардиров на WordPress, Tilda или свой сайт — данные
            подтягиваются из Kickoff автоматически.
          </p>
          <pre className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-[11px] text-muted">
            {`<iframe src="${standingsSrc}"\n  width="100%" height="420" />`}
          </pre>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link href="/embed/demo/standings" target="_blank" className="text-accent hover:underline">
              Открыть таблицу →
            </Link>
            <Link href="/embed/demo/scorers" target="_blank" className="text-accent hover:underline">
              Бомбардиры →
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e12] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <div className="flex gap-2 border-b border-white/5 px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-danger/80" />
            <span className="h-2 w-2 rounded-full bg-warning/80" />
            <span className="h-2 w-2 rounded-full bg-accent/80" />
            <span className="ml-2 font-mono text-[10px] text-muted">embed · demo</span>
          </div>
          <iframe
            title="Демо таблица"
            src={standingsSrc}
            className="h-[380px] w-full border-0 bg-transparent"
          />
        </div>
      </div>
    </section>
  );
}
