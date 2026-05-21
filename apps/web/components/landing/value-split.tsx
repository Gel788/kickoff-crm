import { MatchdayJourney } from "@/components/kickoff/matchday-journey";
import {
  Building2,
  Calendar,
  Globe,
  Shield,
  TableProperties,
  Users,
  ClipboardList,
  FileSignature,
} from "lucide-react";
import Link from "next/link";

export function ValueSplit() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-accent">
        Для кого продукт
      </p>
      <h2 className="mt-3 text-center font-display text-3xl font-bold md:text-5xl">
        Лига управляет. Клубы играют.
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-muted">
        Один договор с лигой — все клубы сезона подключаются без доплаты. Каждый видит
        только своё, лига видит всё.
      </p>

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-accent/25 bg-gradient-to-b from-accent/10 to-elevated p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-accent-dim p-3">
              <Building2 className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold">Лига платит</h3>
              <p className="text-sm text-muted">Оператор, регламент, контроль</p>
            </div>
          </div>
          <ul className="mt-8 space-y-4">
            {[
              {
                icon: Calendar,
                t: "Календарь и генерация тура",
                d: "Создайте круг за минуту, назначьте судей.",
              },
              {
                icon: Shield,
                t: "Реестр и допуск",
                d: "Игроки, документы, дисциплина — до матча.",
              },
              {
                icon: TableProperties,
                t: "Таблица из матчей",
                d: "Не пересчитывайте очки вручную.",
              },
              {
                icon: Globe,
                t: "Публичный слой",
                d: "Live, API, PDF — для сайта и федерации.",
              },
            ].map((row) => (
              <li key={row.t} className="flex gap-4">
                <row.icon className="mt-1 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <p className="font-medium">{row.t}</p>
                  <p className="text-sm text-muted">{row.d}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            className="mt-8 inline-block text-sm font-medium text-accent hover:underline"
          >
            Кабинет лиги →
          </Link>
        </div>

        <div className="rounded-3xl border border-info/25 bg-gradient-to-b from-info/10 to-elevated p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-info/20 p-3">
              <Users className="h-8 w-8 text-info" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold">Клубы бесплатно</h3>
              <p className="text-sm text-muted">Тренер, делегат, заявки</p>
            </div>
          </div>
          <ul className="mt-8 space-y-4">
            {[
              {
                icon: ClipboardList,
                t: "Заявочный лист сезона",
                d: "Один раз собрали состав — дальше клики на матч.",
              },
              {
                icon: Users,
                t: "Заявка на матч",
                d: "Подача до дедлайна, причины блокировки видны сразу.",
              },
              {
                icon: FileSignature,
                t: "Подпись протокола",
                d: "Делегат подтверждает результат без бумаги.",
              },
              {
                icon: Calendar,
                t: "Календарь клуба",
                d: "Все игры и статусы — не ищите в чате лиги.",
              },
            ].map((row) => (
              <li key={row.t} className="flex gap-4">
                <row.icon className="mt-1 h-5 w-5 shrink-0 text-info" />
                <div>
                  <p className="font-medium">{row.t}</p>
                  <p className="text-sm text-muted">{row.d}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-muted">
            Демо клуба: coach@kickoff.app / demo123
          </p>
        </div>
      </div>

      <div className="mt-20">
        <h3 className="text-center font-display text-2xl font-bold">
          Как проходит один матч
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted">
          От заявки до PDF — пять шагов, три роли, ноль Excel.
        </p>
        <MatchdayJourney />
      </div>
    </section>
  );
}
