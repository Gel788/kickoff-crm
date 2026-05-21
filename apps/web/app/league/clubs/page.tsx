import { Button } from "@/components/kickoff/button";
import { FlashBanner } from "@/components/kickoff/flash-banner";
import { PageHeader } from "@/components/kickoff/page-header";
import { RowActions } from "@/components/kickoff/row-actions";
import {
  DataTable,
  EmptyState,
  FormCard,
  inputClass,
} from "@/components/kickoff/ui";
import { deleteClub } from "@/lib/actions-crud";
import { createClub } from "@/lib/actions-registry";
import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/queries";
import { Shield } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const ctx = await getOrgContext();
  if (!ctx?.season) redirect("/league/settings");

  const clubs = await prisma.club.findMany({
    where: { seasonClubs: { some: { seasonId: ctx.season.id } } },
    include: {
      registrations: {
        where: { seasonId: ctx.season.id },
        select: { id: true },
      },
      _count: { select: { homeFixtures: true, awayFixtures: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        label="Реестр"
        title="Клубы"
        description={`${clubs.length} команд · добавление, просмотр, редактирование, удаление`}
      />

      <FlashBanner code={searchParams.error} />

      <form action={createClub} className="mb-8">
        <FormCard title="Добавить клуб" description="Клуб сразу попадает в активный сезон">
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="name" placeholder="Название" required className={inputClass} />
            <input name="shortName" placeholder="Короткое (3 буквы)" required className={inputClass} />
            <input name="venue" placeholder="Стадион" className={`${inputClass} sm:col-span-2`} />
          </div>
          <Button type="submit" size="sm">
            Добавить
          </Button>
        </FormCard>
      </form>

      {clubs.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="Клубов пока нет"
          description="Добавьте первую команду формой выше"
        />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>Клуб</th>
              <th>Стадион</th>
              <th>Игроки</th>
              <th>Матчи</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <span
                      className="h-8 w-1 rounded-full"
                      style={{ backgroundColor: c.primaryColor }}
                    />
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="font-mono text-xs text-muted">{c.shortName}</p>
                    </div>
                  </div>
                </td>
                <td className="text-muted">{c.venue ?? "—"}</td>
                <td className="font-mono">{c.registrations.length}</td>
                <td className="font-mono text-muted">
                  {c._count.homeFixtures + c._count.awayFixtures}
                </td>
                <td>
                  <RowActions
                    viewHref={`/league/clubs/${c.id}`}
                    deleteAction={deleteClub}
                    deleteHidden={{ clubId: c.id }}
                    deleteMessage={`Удалить клуб «${c.name}» навсегда? Доступно только без матчей.`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
