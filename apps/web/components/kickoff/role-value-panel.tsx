import { cn } from "@/lib/utils";
import {
  Building2,
  Calendar,
  ClipboardList,
  FileText,
  Globe,
  Shield,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Benefit = {
  icon: LucideIcon;
  title: string;
  desc: string;
  href?: string;
  tag?: string;
};

const LEAGUE: Benefit[] = [
  {
    icon: Calendar,
    title: "Весь тур в одном календаре",
    desc: "Генерация круга, переносы, конфликты слотов — без Google-таблиц.",
    href: "/league/calendar",
    tag: "Экономия 10+ ч/нед",
  },
  {
    icon: Shield,
    title: "Допуск до свистка",
    desc: "Документы, баны, медицина — клуб не выставит недопущенного.",
    href: "/league/players",
  },
  {
    icon: Zap,
    title: "Live и таблица сами",
    desc: "События судьи → счёт → турнирная таблица без ручного ввода.",
    href: "/league/standings",
  },
  {
    icon: FileText,
    title: "Официальный PDF",
    desc: "Протокол с логотипом лиги для федерации и архива.",
    href: "/league/reports",
  },
  {
    icon: Globe,
    title: "Сайт и партнёры",
    desc: "Live-табло, API таблицы и бомбардиров — встраивается на сайт.",
    href: "/league/settings",
  },
];

const CLUB: Benefit[] = [
  {
    icon: ClipboardList,
    title: "Заявка за 5 минут",
    desc: "Состав на матч из заявочного листа сезона — без переписки с секретарём.",
    href: "/club/roster",
    tag: "Клуб",
  },
  {
    icon: Users,
    title: "Реестр игроков",
    desc: "Номера, позиции, статус допуска — всегда актуально.",
    href: "/club",
  },
  {
    icon: FileText,
    title: "Подпись протокола",
    desc: "Делегат подтверждает или оспаривает результат с телефона.",
    href: "/club/delegate",
  },
  {
    icon: Calendar,
    title: "Календарь клуба",
    desc: "Все матчи сезона и статус заявки — в одном месте.",
    href: "/club",
  },
];

export function RoleValuePanel({
  role,
  guideHref,
}: {
  role: "league" | "club";
  guideHref?: string;
}) {
  const items = role === "league" ? LEAGUE : CLUB;
  const headline =
    role === "league"
      ? "Что Kickoff даёт вашей лиге"
      : "Что Kickoff даёт вашему клубу";
  const sub =
    role === "league"
      ? "Календарь, допуск, протоколы и таблица — в одном контуре тура."
      : "Заявки, состав и подпись протокола — без лишней переписки с лигой.";

  return (
    <section className="mb-10 overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.12] via-[#0c1014] to-elevated/90 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            {role === "league" ? (
              <Building2 className="mr-1 inline h-3 w-3" />
            ) : (
              <Users className="mr-1 inline h-3 w-3" />
            )}
            Ценность продукта
          </p>
          <h2 className="mt-2 font-display text-xl font-bold md:text-2xl">{headline}</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">{sub}</p>
        </div>
        {guideHref && (
          <Link
            href={guideHref}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-base/60 px-4 py-2 text-sm font-medium text-accent hover:border-accent/40"
          >
            Как это работает
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((b) => {
          const Icon = b.icon;
          const inner = (
            <div
              className={cn(
                "h-full rounded-xl border border-border/80 bg-base/50 p-4 transition-all",
                b.href && "hover:border-accent/30 hover:bg-base/80",
              )}
            >
              <Icon className="h-5 w-5 text-accent" />
              {b.tag && (
                <span className="mt-2 inline-block rounded-full bg-accent-dim px-2 py-0.5 font-mono text-[10px] text-accent">
                  {b.tag}
                </span>
              )}
              <h3 className="mt-2 text-sm font-bold">{b.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{b.desc}</p>
            </div>
          );
          return b.href ? (
            <Link key={b.title} href={b.href}>
              {inner}
            </Link>
          ) : (
            <div key={b.title}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
