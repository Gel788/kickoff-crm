import Link from "next/link";

const cols = [
  {
    title: "Продукт",
    links: [
      { href: "#matchday", label: "Матчдень" },
      { href: "#demo-data", label: "Демо-лига" },
      { href: "#opensource", label: "Open source" },
    ],
  },
  {
    title: "Публично",
    links: [
      { href: "/o/demo", label: "Страница лиги" },
      { href: "/live/demo", label: "Live-табло" },
      { href: "/embed/demo/standings", label: "Embed таблицы" },
    ],
  },
  {
    title: "Вход",
    links: [
      { href: "/login", label: "Кабинет" },
      { href: "/login", label: "Демо operator@" },
      { href: "/league/guide", label: "Гайд лиги" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.08] bg-[#06080a]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <span className="font-display text-2xl font-bold tracking-tight">
              KICK<span className="text-accent">OFF</span>
            </span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              CRM футбольных лиг: заявки, протокол, дисциплина, live и публичный
              сайт — без зоопарка из таблиц и чатов.
            </p>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-muted/70">
              Matchday OS · 2026
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-xs text-muted md:flex-row">
          <span>Lottie · Framer Motion · FullCalendar · react-table</span>
          <span>Демо: operator@kickoff.app / demo123</span>
        </div>
      </div>
    </footer>
  );
}
