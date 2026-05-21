import { Button } from "@/components/kickoff/button";
import { DeleteButton } from "@/components/kickoff/confirm-form";
import { PageHeader } from "@/components/kickoff/page-header";
import { Card, DataTable, inputClass } from "@/components/kickoff/ui";
import {
  deleteClub,
  removeClubFromSeason,
  updateClub,
} from "@/lib/actions-crud";
import {
  clearSeasonRoster,
  fillSeasonRosterAction,
  toggleSeasonRosterAction,
} from "@/lib/actions-roster";
import { getIneligibilityReason } from "@/lib/eligibility";
import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/queries";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function ClubDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const ctx = await getOrgContext();
  if (!ctx?.season) redirect("/league/settings");
  const seasonId = ctx.season.id;

  const club = await prisma.club.findFirst({
    where: {
      id: params.id,
      organizationId: ctx.session.organizationId,
      seasonClubs: { some: { seasonId } },
    },
    include: {
      registrations: {
        where: { seasonId },
        include: { player: true },
        orderBy: { shirtNumber: "asc" },
      },
      seasonRoster: { where: { seasonId } },
      _count: {
        select: {
          homeFixtures: true,
          awayFixtures: true,
        },
      },
    },
  });

  if (!club) notFound();

  const matchCount = club._count.homeFixtures + club._count.awayFixtures;
  const rosterIds = new Set(club.seasonRoster.map((e) => e.registrationId));
  const rosterRows = await Promise.all(
    club.registrations.map(async (r) => ({
      reg: r,
      onRoster: rosterIds.has(r.id),
      block: await getIneligibilityReason(r.id, seasonId, club.id),
    })),
  );

  return (
    <>
      <PageHeader
        label="Клуб"
        title={club.name}
        description={club.shortName}
      >
        <Link href="/league/clubs">
          <Button variant="ghost" size="sm">
            ← Все клубы
          </Button>
        </Link>
      </PageHeader>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-bold">Редактировать</h3>
          <form action={updateClub} className="mt-4 space-y-3">
            <input type="hidden" name="id" value={club.id} />
            <input name="name" defaultValue={club.name} required className={inputClass} />
            <input name="shortName" defaultValue={club.shortName} required className={inputClass} />
            <input name="venue" defaultValue={club.venue ?? ""} className={inputClass} />
            <input
              name="primaryColor"
              type="color"
              defaultValue={club.primaryColor}
              className="h-10 w-full cursor-pointer rounded-lg border border-border bg-base"
            />
            <Button type="submit" size="sm">
              Сохранить
            </Button>
          </form>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-bold">Опасная зона</h3>
          <p className="mt-2 text-sm text-muted">
            Матчей в системе: {matchCount}. Игроков в сезоне: {club.registrations.length}.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <DeleteButton
              action={removeClubFromSeason}
              confirmMessage={`Убрать «${club.name}» из сезона ${ctx.season.name}? Игроки сезона будут удалены из реестра клуба.`}
              hidden={{ clubId: club.id }}
              label="Убрать из сезона"
            />
            {matchCount === 0 && (
              <DeleteButton
                action={deleteClub}
                confirmMessage={`Удалить клуб «${club.name}» полностью?`}
                hidden={{ clubId: club.id }}
              />
            )}
          </div>
        </Card>
      </div>

      <section className="mb-10">
        <h2 className="kickoff-section-title mb-4">
          Заявочный лист сезона ({club.seasonRoster.length} / {ctx.season!.maxSquadSize})
        </h2>
        <div className="mb-4 flex flex-wrap gap-2">
          <form action={fillSeasonRosterAction}>
            <input type="hidden" name="seasonId" value={seasonId} />
            <input type="hidden" name="clubId" value={club.id} />
            <Button type="submit" size="sm" variant="outline">
              Заполнить допущенными
            </Button>
          </form>
          <DeleteButton
            action={clearSeasonRoster}
            confirmMessage="Очистить заявочный лист клуба?"
            hidden={{ seasonId, clubId: club.id }}
            label="Очистить лист"
          />
        </div>
        <DataTable>
          <thead>
            <tr>
              <th>Игрок</th>
              <th>Лист</th>
            </tr>
          </thead>
          <tbody>
            {rosterRows.map(({ reg, onRoster, block }) => (
              <tr key={reg.id}>
                <td>
                  {reg.player.firstName} {reg.player.lastName}
                  {block && <span className="ml-2 text-xs text-danger">{block}</span>}
                </td>
                <td>
                  <form action={toggleSeasonRosterAction}>
                    <input type="hidden" name="seasonId" value={seasonId} />
                    <input type="hidden" name="clubId" value={club.id} />
                    <input type="hidden" name="registrationId" value={reg.id} />
                    <Button
                      type="submit"
                      size="sm"
                      variant={onRoster ? "primary" : "outline"}
                      disabled={!onRoster && Boolean(block)}
                    >
                      {onRoster ? "Убрать" : "В лист"}
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>

      <section>
        <h2 className="kickoff-section-title mb-4">Игроки в сезоне</h2>
        {club.registrations.length === 0 ? (
          <p className="text-muted">Нет зарегистрированных игроков</p>
        ) : (
          <DataTable>
            <thead>
              <tr>
                <th>№</th>
                <th>Игрок</th>
                <th>Допуск</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {club.registrations.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono">{r.shirtNumber ?? "—"}</td>
                  <td>
                    {r.player.firstName} {r.player.lastName}
                  </td>
                  <td className="text-sm">{r.eligibility}</td>
                  <td>
                    <Link href={`/league/players/${r.id}`}>
                      <Button size="sm" variant="outline">
                        Карточка
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
        <Link href="/league/players" className="mt-4 inline-block text-sm text-accent hover:underline">
          Все игроки лиги →
        </Link>
      </section>
    </>
  );
}
