import { MatchdayJourney } from "@/components/kickoff/matchday-journey";
import { PageHeader } from "@/components/kickoff/page-header";
import { getSession } from "@/lib/auth";
import { ClipboardList, FileSignature, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ClubGuidePage() {
  const session = await getSession();
  if (!session?.clubId) redirect("/login");

  return (
    <>
      <PageHeader
        label="Справка"
        title="Kickoff для клуба"
        description="Что даёт платформа вашей команде — бесплатно в рамках лиги"
      />

      <section className="mb-10 rounded-2xl border border-info/25 bg-info/10 p-8">
        <h2 className="font-display text-xl font-bold">Вам не нужен Excel</h2>
        <p className="mt-3 text-muted leading-relaxed">
          Лига оплатила Kickoff на сезон. Вы получаете кабинет клуба: заявочный лист,
          заявки на матчи, подпись протокола делегатом.
        </p>
      </section>

      <div className="mb-10 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: ClipboardList,
            title: "1. Заявочный лист",
            text: "Соберите состав сезона один раз.",
            href: "/club/roster",
          },
          {
            icon: Users,
            title: "2. Заявка на матч",
            text: "Когда лига открыла окно — выберите игроков.",
            href: "/club",
          },
          {
            icon: FileSignature,
            title: "3. Подпись",
            text: "Делегат подтверждает протокол после игры.",
            href: "/club/delegate",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.title}
              href={s.href}
              className="rounded-2xl border border-border bg-elevated p-6 hover:border-info/40"
            >
              <Icon className="h-6 w-6 text-info" />
              <h3 className="mt-3 font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.text}</p>
            </Link>
          );
        })}
      </div>

      <h2 className="mb-4 font-display text-lg font-bold">Где вы в общем процессе</h2>
      <MatchdayJourney compact />
    </>
  );
}
