import { cn } from "@/lib/utils";
import {
  Calendar,
  Code2,
  GitCompare,
  LineChart,
  MessageCircle,
  QrCode,
  Search,
  Share2,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

type Feature = {
  title: string;
  desc: string;
  icon: LucideIcon;
  tag: string;
  href?: string;
};

/** Фишки, собранные из идей open-source лиг (OpenLeague, Sports-League, Sunday League). */
const features: Feature[] = [
  {
    title: "iCal + CSV календарь",
    desc: "Подписка в Google Calendar и экспорт тура — как в OpenLeague.",
    icon: Calendar,
    tag: "ical-generator",
    href: "/login",
  },
  {
    title: "Embed на сайт",
    desc: "iframe таблицы и бомбардиров для сайта лиги без бэкенда.",
    icon: Share2,
    tag: "виджет",
    href: "/embed/demo/standings",
  },
  {
    title: "RSVP на матч",
    desc: "Кто едет на игру — из pickup-лиг и OpenLeague.",
    icon: Users,
    tag: "клуб",
    href: "/login",
  },
  {
    title: "WhatsApp-заявка",
    desc: "Текст состава в буфер — без отдельного чата лиги.",
    icon: MessageCircle,
    tag: "клуб",
  },
  {
    title: "Форма W/D/L",
    desc: "Последние 5 матчей в таблице — FlashScore-стиль.",
    icon: LineChart,
    tag: "таблица",
    href: "/login",
  },
  {
    title: "Очные (H2H)",
    desc: "История встреч двух клубов — Sports-League.",
    icon: GitCompare,
    tag: "аналитика",
    href: "/login",
  },
  {
    title: "Балансировщик",
    desc: "Честные команды на тренировку — Sunday League.",
    icon: Wrench,
    tag: "pickup",
    href: "/login",
  },
  {
    title: "⌘K + fuse.js",
    desc: "Мгновенный поиск страниц и клубов в CRM.",
    icon: Search,
    tag: "UX",
    href: "/login",
  },
  {
    title: "QR матча",
    desc: "Ссылка на протокол и live с телефона на поле.",
    icon: QrCode,
    tag: "матчдень",
  },
  {
    title: "REST + OpenAPI",
    desc: "Табло, таблица, SSE live — для интеграторов.",
    icon: Code2,
    tag: "API",
    href: "/api/openapi",
  },
];

export function OpenFeaturesGrid() {
  return (
    <section id="opensource" className="relative mx-auto max-w-6xl px-6 py-28">
      <div className="text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-accent">
          Open source → Kickoff
        </p>
        <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          Лучшее из открытых лиг
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted">
          Мы не форкаем чужие репозитории — берём проверенные идеи (календарь, embed, RSVP,
          pickup) и встраиваем в один матчдень с протоколом и PDF.
        </p>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon;
          const inner = (
            <div
              className={cn(
                "group h-full rounded-2xl border border-white/[0.06] bg-elevated/60 p-5 transition-all",
                "hover:border-accent/30 hover:bg-elevated",
              )}
            >
              <div className="flex items-start justify-between">
                <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted">
                  {f.tag}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
            </div>
          );
          return f.href ? (
            <Link
              key={f.title}
              href={f.href}
              target={f.href.startsWith("/api") || f.href.startsWith("/embed") ? "_blank" : undefined}
              className="block"
            >
              {inner}
            </Link>
          ) : (
            <div key={f.title}>{inner}</div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-xs text-muted">
        Вдохновение: OpenLeague · Flask Sports-League · sunday-league · MatchDay-паттерны
      </p>
    </section>
  );
}
