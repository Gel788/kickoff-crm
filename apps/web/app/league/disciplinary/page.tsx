import { Button } from "@/components/kickoff/button";
import { DeleteButton } from "@/components/kickoff/confirm-form";
import { PageHeader } from "@/components/kickoff/page-header";
import { FormCard, DataTable, inputClass, selectClass } from "@/components/kickoff/ui";
import {
  createManualDisciplinary,
  deleteDisciplinaryRecord,
} from "@/lib/actions-crud";
import {
  appealDisciplinaryCase,
  resolveDisciplinaryCase,
  serveBan,
} from "@/lib/actions-integrity";
import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function DisciplinaryPage() {
  const ctx = await getOrgContext();
  if (!ctx?.season) redirect("/league/settings");

  const [events, records, cases, registrations] = await Promise.all([
    prisma.matchEvent.findMany({
      where: {
        type: { in: ["YELLOW", "SECOND_YELLOW", "RED"] },
        fixture: {
          round: { division: { competition: { seasonId: ctx.season.id } } },
        },
      },
      include: {
        registration: { include: { player: true, club: true } },
        fixture: { include: { homeClub: true, awayClub: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.disciplinaryRecord.findMany({
      where: {
        registration: { seasonId: ctx.season.id },
      },
      include: {
        registration: { include: { player: true, club: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.disciplinaryCase.findMany({
      where: { registration: { seasonId: ctx.season.id } },
      include: {
        registration: { include: { player: true, club: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.playerRegistration.findMany({
      where: { seasonId: ctx.season.id },
      include: { player: true, club: true },
      orderBy: [{ club: { name: "asc" } }, { player: { lastName: "asc" } }],
    }),
  ]);

  const EVENT_LABELS: Record<string, string> = {
    YELLOW: "Жёлтая",
    SECOND_YELLOW: "Вторая жёлтая",
    RED: "Красная",
  };

  return (
    <>
      <PageHeader
        label="Integrity"
        title="Дисциплина"
        description={`Жёлтые от ${ctx.season.yellowBanThreshold} → бан ${ctx.season.yellowBanMatches} матч · Красная → ${ctx.season.redBanMatches}`}
      />

      <form action={createManualDisciplinary} className="mb-8">
        <FormCard title="Назначить санкцию вручную" description="Комитет лиги">
          <select name="registrationId" required className={selectClass}>
            <option value="">Игрок</option>
            {registrations.map((r) => (
              <option key={r.id} value={r.id}>
                {r.player.lastName} {r.player.firstName} ({r.club.shortName})
              </option>
            ))}
          </select>
          <input
            name="matchesBanned"
            type="number"
            min={1}
            defaultValue={1}
            className={inputClass}
            placeholder="Матчей бана"
          />
          <input name="reason" required className={inputClass} placeholder="Причина" />
          <Button type="submit" size="sm">
            Назначить бан
          </Button>
        </FormCard>
      </form>

      <section className="mb-10">
        <h2 className="mb-4 kickoff-section-title">Дела комитета (DisciplinaryCase)</h2>
        <DataTable>
          <thead>
            <tr>
              <th>Игрок</th>
              <th>Статус</th>
              <th>Бан</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cases.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  Нет открытых дел
                </td>
              </tr>
            ) : (
              cases.map((c) => (
                <tr key={c.id}>
                  <td>
                    {c.registration.player.firstName} {c.registration.player.lastName}
                    <span className="ml-2 text-muted">{c.registration.club.shortName}</span>
                  </td>
                  <td>{c.status}</td>
                  <td className="font-mono text-center">
                    {c.matchesServed}/{c.matchesBanned}
                  </td>
                  <td>
                    {c.status === "OPEN" && (
                      <form action={appealDisciplinaryCase} className="flex flex-wrap gap-2">
                        <input type="hidden" name="caseId" value={c.id} />
                        <input name="reason" placeholder="Апелляция" className={inputClass} />
                        <Button type="submit" size="sm" variant="outline">
                          Апелляция
                        </Button>
                      </form>
                    )}
                    {c.status === "APPEALED" && (
                      <form action={resolveDisciplinaryCase} className="flex flex-wrap gap-2">
                        <input type="hidden" name="caseId" value={c.id} />
                        <input name="decision" placeholder="Решение" className={inputClass} />
                        <label className="flex items-center gap-1 text-xs">
                          <input type="checkbox" name="accept" /> Принять
                        </label>
                        <Button type="submit" size="sm">
                          Решить
                        </Button>
                      </form>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </DataTable>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 kickoff-section-title">Активные санкции</h2>
        <DataTable>
          <thead>
            <tr>
              <th>Игрок</th>
              <th>Причина</th>
              <th>Бан</th>
              <th>Отбыто</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {records.filter((r) => r.active).length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  Активных санкций нет
                </td>
              </tr>
            ) : (
              records
                .filter((r) => r.active)
                .map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.registration.player.firstName}{" "}
                      {r.registration.player.lastName}
                      <span className="ml-2 text-muted">
                        {r.registration.club.shortName}
                      </span>
                    </td>
                    <td>{r.reason}</td>
                    <td className="text-center font-mono">{r.matchesBanned}</td>
                    <td className="text-center font-mono">{r.matchesServed}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <form
                          action={async () => {
                            "use server";
                            await serveBan(r.id);
                          }}
                        >
                          <Button type="submit" size="sm" variant="outline">
                            +1 отбыто
                          </Button>
                        </form>
                        <DeleteButton
                          action={deleteDisciplinaryRecord}
                          confirmMessage="Снять санкцию и вернуть допуск?"
                          hidden={{ recordId: r.id }}
                          label="Снять"
                        />
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </DataTable>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Карточки в протоколах</h2>
        <DataTable>
          <thead>
            <tr>
              <th>Мин</th>
              <th>Игрок</th>
              <th>Карточка</th>
              <th>Матч</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td className="font-mono">{e.minute}&apos;</td>
                <td>
                  {e.registration
                    ? `${e.registration.player.firstName} ${e.registration.player.lastName}`
                    : "—"}
                </td>
                <td className="text-danger">{EVENT_LABELS[e.type]}</td>
                <td className="text-muted">
                  {e.fixture.homeClub.shortName} — {e.fixture.awayClub.shortName}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>
    </>
  );
}
