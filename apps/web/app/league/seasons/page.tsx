import { Button } from "@/components/kickoff/button";
import { PageHeader } from "@/components/kickoff/page-header";
import { DataTable, FormCard, inputClass } from "@/components/kickoff/ui";
import { activateSeason } from "@/lib/actions-crud";
import { createSeason } from "@/lib/actions-season";
import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/queries";
import { format } from "@/lib/format";
import { redirect } from "next/navigation";

export default async function SeasonsPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) redirect("/login");

  const seasons = await prisma.season.findMany({
    where: { organizationId: ctx.session.organizationId },
    orderBy: { startDate: "desc" },
    include: {
      _count: { select: { competitions: true, registrations: true } },
    },
  });

  return (
    <>
      <PageHeader
        label="Сезоны"
        title="Сезоны лиги"
        description="Создание, переключение активного сезона"
      />

      <form action={createSeason} className="mb-8">
        <FormCard title="Новый сезон" description="Станет активным, предыдущий уйдёт в архив">
          <input name="name" placeholder="2026/27" required className={inputClass} />
          <input name="startDate" type="date" required className={inputClass} />
          <input name="endDate" type="date" required className={inputClass} />
          <Button type="submit" size="sm">
            Создать и активировать
          </Button>
        </FormCard>
      </form>

      <DataTable>
        <thead>
          <tr>
            <th>Сезон</th>
            <th>Период</th>
            <th>Игроки</th>
            <th>Статус</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {seasons.map((s) => (
            <tr key={s.id}>
              <td className="font-medium">{s.name}</td>
              <td className="text-muted">
                {format.date(s.startDate)} — {format.date(s.endDate)}
              </td>
              <td className="font-mono">{s._count.registrations}</td>
              <td>
                {s.isActive ? (
                  <span className="text-accent">Активен</span>
                ) : (
                  <span className="text-muted">Архив</span>
                )}
              </td>
              <td>
                {!s.isActive && (
                  <form action={activateSeason}>
                    <input type="hidden" name="seasonId" value={s.id} />
                    <Button type="submit" size="sm" variant="outline">
                      Сделать активным
                    </Button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
