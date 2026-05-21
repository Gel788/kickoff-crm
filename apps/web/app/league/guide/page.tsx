import { MatchdayJourney } from "@/components/kickoff/matchday-journey";
import { PageHeader } from "@/components/kickoff/page-header";
import { BeforeAfter } from "@/components/landing/before-after";
import { ProductPreviewDuo } from "@/components/landing/product-preview-duo";
import { getOrgContext } from "@/lib/queries";
import {
  Building2,
  Calendar,
  Flag,
  Globe,
  Scale,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const roles = [
  {
    icon: Building2,
    name: "Оператор лиги",
    you: "Календарь, допуск, закрытие матчей, отчёты",
    href: "/league/dashboard",
    color: "text-accent",
  },
  {
    icon: Users,
    name: "Клуб (тренер)",
    you: "Заявочный лист, заявка на матч",
    href: "/club",
    color: "text-info",
  },
  {
    icon: Flag,
    name: "Судья",
    you: "Live-протокол на планшете, офлайн на поле",
    href: "/referee",
    color: "text-warning",
  },
  {
    icon: Scale,
    name: "Дисциплина",
    you: "Баны, апелляции, комитет",
    href: "/league/disciplinary",
    color: "text-muted",
  },
];

export default async function LeagueGuidePage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) redirect("/login");

  const liveUrl = `/live/${ctx.org.slug}`;

  return (
    <>
      <PageHeader
        label="Справка"
        title="Как работает Kickoff"
        description="Покажите эту страницу команде лиги и клубам — всё на одном экране"
      />

      <section className="mb-12 rounded-2xl border border-accent/20 bg-accent-dim/20 p-6 md:p-10">
        <h2 className="font-display text-2xl font-bold">
          Kickoff = операционная система матчдня
        </h2>
        <p className="mt-4 max-w-3xl text-muted leading-relaxed">
          Вместо таблиц и чатов — один поток: <strong className="text-white">заявка → lock → live → протокол → таблица</strong>.
          Лига платит за сезон, клубы и судьи работают внутри без доплаты.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link href={liveUrl} className="text-accent hover:underline">
            Публичное live-табло →
          </Link>
          <Link href="/league/calendar" className="text-accent hover:underline">
            Календарь лиги →
          </Link>
          <Link href="/" target="_blank" className="text-muted hover:text-white">
            Лендинг для презентации →
          </Link>
        </div>
      </section>

      <BeforeAfter />

      <section className="my-14">
        <h2 className="font-display text-xl font-bold">Кто что делает</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.name}
                href={r.href}
                className="rounded-2xl border border-border bg-elevated p-5 transition-colors hover:border-accent/30"
              >
                <Icon className={`h-6 w-6 ${r.color}`} />
                <h3 className="mt-3 font-bold">{r.name}</h3>
                <p className="mt-1 text-sm text-muted">{r.you}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="font-display text-xl font-bold">Один матч — полный цикл</h2>
        <MatchdayJourney />
      </section>

      <section className="mb-14">
        <h2 className="mb-6 font-display text-xl font-bold">
          Два кабинета — одна правда
        </h2>
        <ProductPreviewDuo />
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            icon: Calendar,
            title: "Для секретаря лиги",
            text: "Меньше звонков «кто в заявке». Всё видно на дашборде.",
          },
          {
            icon: Shield,
            title: "Для регистратора",
            text: "Игроки, документы, FIFA ID — реестр сезона.",
          },
          {
            icon: Globe,
            title: "Для маркетинга",
            text: "Live и API на сайт лиги — без разработки с нуля.",
          },
        ].map((b) => (
          <div
            key={b.title}
            className="rounded-2xl border border-border bg-elevated p-6"
          >
            <b.icon className="h-6 w-6 text-accent" />
            <h3 className="mt-3 font-bold">{b.title}</h3>
            <p className="mt-2 text-sm text-muted">{b.text}</p>
          </div>
        ))}
      </section>
    </>
  );
}
