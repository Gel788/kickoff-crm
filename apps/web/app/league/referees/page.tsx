import { Button } from "@/components/kickoff/button";
import { PageHeader } from "@/components/kickoff/page-header";
import { FormCard, inputClass, selectClass } from "@/components/kickoff/ui";
import { assignRefereeSlot } from "@/lib/actions-registry";
import { inviteUser } from "@/lib/actions-users";
import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/queries";
import {
  REFEREE_SLOT_LABELS,
  REFEREE_SLOT_ORDER,
} from "@/lib/referee-slots";
import { RefereeSlot } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function RefereesPage() {
  const ctx = await getOrgContext();
  if (!ctx?.season) redirect("/league/settings");

  const referees = await prisma.user.findMany({
    where: {
      memberships: {
        some: {
          organizationId: ctx.session.organizationId,
          role: { in: ["REFEREE_CHIEF", "REFEREE_ASSISTANT"] },
        },
      },
    },
    include: {
      refereeProfile: true,
      assignments: {
        include: {
          fixture: { include: { homeClub: true, awayClub: true } },
        },
      },
    },
  });

  const upcomingFixtures = await prisma.fixture.findMany({
    where: {
      round: { division: { competition: { seasonId: ctx.season.id } } },
      status: { not: "CLOSED" },
    },
    include: {
      homeClub: true,
      awayClub: true,
      refereeAssignments: { include: { user: true } },
    },
    orderBy: { scheduledAt: "asc" },
    take: 30,
  });

  const needsChief = upcomingFixtures.filter((f) =>
    !f.refereeAssignments.some((a) => a.slot === "CHIEF"),
  );

  return (
    <>
      <PageHeader
        label="Судейская коллегия"
        title="Судьи"
        description="Добавьте судей в пользователи, назначьте бригаду из 4 человек на матч"
      />

      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <FormCard title="Пригласить судью">
          <form action={inviteUser} className="space-y-4">
            <label className="block text-xs text-muted">
              Email
              <input
                name="email"
                type="email"
                required
                className={inputClass}
                placeholder="ref2@liga.ru"
              />
            </label>
            <label className="block text-xs text-muted">
              Имя
              <input name="name" className={inputClass} placeholder="Иван Иванов" />
            </label>
            <label className="block text-xs text-muted">
              Роль
              <select name="role" className={selectClass} defaultValue="REFEREE_CHIEF">
                <option value="REFEREE_CHIEF">Главный судья</option>
                <option value="REFEREE_ASSISTANT">Помощник</option>
              </select>
            </label>
            <p className="text-xs text-muted">
              Временный пароль: <strong>demo123</strong> (сменить в профиле). Все судьи
              также в{" "}
              <Link href="/league/users" className="text-accent underline">
                Пользователи
              </Link>
              .
            </p>
            <Button type="submit" size="sm">
              Добавить судью
            </Button>
          </form>
        </FormCard>

        <div className="rounded-xl border border-border bg-elevated p-6 text-sm text-muted">
          <h3 className="mb-2 font-display font-bold text-foreground">
            Как назначить 4 судей
          </h3>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Пригласите минимум 4 человек с ролью судьи.</li>
            <li>Откройте матч в календаре или блок ниже.</li>
            <li>
              Для каждой позиции: главный, 1-й и 2-й помощник, резервный (4-й).
            </li>
            <li>
              Live-протокол ведёт любой из назначенных; обычно — главный.
            </li>
          </ol>
        </div>
      </div>

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        {referees.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border border-border bg-elevated p-6"
          >
            <h3 className="font-display text-lg font-bold">{r.name}</h3>
            <p className="text-sm text-muted">{r.email}</p>
            <p className="mt-2 font-mono text-xs text-accent">
              {r.refereeProfile?.category ?? "—"} ·{" "}
              {r.refereeProfile?.active ? "активен" : "неактивен"}
            </p>
            <p className="mt-2 text-sm">Назначений: {r.assignments.length}</p>
          </div>
        ))}
        {referees.length === 0 && (
          <p className="text-muted col-span-2">
            Нет судей. Пригласите хотя бы четырёх через форму выше.
          </p>
        )}
      </div>

      <h2 className="mb-4 font-display text-xl font-bold">
        Назначения на матчи
      </h2>
      <div className="space-y-6">
        {upcomingFixtures.map((f) => {
          const bySlot = new Map(
            f.refereeAssignments.map((a) => [a.slot, a.user.name]),
          );
          return (
            <div
              key={f.id}
              className="rounded-xl border border-border bg-elevated p-4"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">
                  {f.homeClub.shortName} — {f.awayClub.shortName} ·{" "}
                  {f.scheduledAt.toLocaleString("ru-RU")}
                </span>
                <Link
                  href={`/league/fixtures/${f.id}`}
                  className="text-sm text-accent underline"
                >
                  Карточка матча →
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {REFEREE_SLOT_ORDER.map((slot) => (
                  <div
                    key={slot}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-base px-3 py-2"
                  >
                    <span className="text-xs text-muted">
                      {REFEREE_SLOT_LABELS[slot]}
                    </span>
                    {bySlot.get(slot) ? (
                      <span className="text-sm">{bySlot.get(slot)}</span>
                    ) : referees.length > 0 ? (
                      <form
                        className="flex gap-2"
                        action={async (fd) => {
                          "use server";
                          await assignRefereeSlot(
                            f.id,
                            String(fd.get("refereeId") ?? ""),
                            slot as RefereeSlot,
                          );
                        }}
                      >
                        <select
                          name="refereeId"
                          className="rounded-lg border border-border bg-elevated px-2 py-1 text-xs"
                          required
                        >
                          <option value="">—</option>
                          {referees.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                        <Button type="submit" size="sm">
                          OK
                        </Button>
                      </form>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {needsChief.length > 0 && (
        <p className="mt-6 text-sm text-muted">
          Без главного судьи: {needsChief.length} матч(ей) — назначьте позицию
          «Главный судья».
        </p>
      )}
    </>
  );
}
