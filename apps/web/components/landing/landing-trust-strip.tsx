import { CalendarCheck, Globe, Shield, Zap } from "lucide-react";

const items = [
  { icon: Zap, label: "Матчдень за 10 мин", sub: "демо-сценарий" },
  { icon: CalendarCheck, label: "18+ матчей", sub: "голы и таблица" },
  { icon: Globe, label: "API + embed", sub: "сайт лиги" },
  { icon: Shield, label: "5 ролей", sub: "лига · клуб · судья" },
];

export function LandingTrustStrip() {
  return (
    <section className="relative border-y border-white/[0.06] bg-[#080c10]/80 backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-8 md:grid-cols-4 md:gap-4 md:py-10">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-4 md:flex-col md:items-start md:gap-2"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-display text-sm font-bold md:text-base">
                  {item.label}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {item.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
