import { Button } from "@/components/kickoff/button";
import { DeleteButton } from "@/components/kickoff/confirm-form";
import { FlashBanner } from "@/components/kickoff/flash-banner";
import { PageHeader } from "@/components/kickoff/page-header";
import { Card, DataTable, SectionTitle } from "@/components/kickoff/ui";
import {
  clearSeasonRoster,
  fillSeasonRosterAction,
  toggleSeasonRosterAction,
} from "@/lib/actions-roster";
import { getIneligibilityReason } from "@/lib/eligibility";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ClubRosterPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await getSession();
  if (!session?.clubId) redirect("/login");

  const season = await prisma.season.findFirst({
    where: { organizationId: session.organizationId, isActive: true },
  });
  if (!season) redirect("/club");

  const [club, registrations, roster] = await Promise.all([
    prisma.club.findUnique({ where: { id: session.clubId } }),
    prisma.playerRegistration.findMany({
      where: { clubId: session.clubId, seasonId: season.id },
      include: { player: true },
      orderBy: { shirtNumber: "asc" },
    }),
    prisma.seasonRosterEntry.findMany({
      where: { clubId: session.clubId, seasonId: season.id },
    }),
  ]);

  const rosterIds = new Set(roster.map((r) => r.registrationId));

  const rows = await Promise.all(
    registrations.map(async (r) => ({
      reg: r,
      onRoster: rosterIds.has(r.id),
      block: await getIneligibilityReason(r.id, season.id, session.clubId!),
    })),
  );

  return (
    <>
      <PageHeader
        label="Сезон"
        title="Заявочный лист"
        description={`${club?.name} · ${roster.length} / ${season.maxSquadSize} игроков`}
      >
        <Link href="/club">
          <Button variant="ghost" size="sm">
            ← Кабинет
          </Button>
        </Link>
      </PageHeader>

      <FlashBanner code={searchParams.error} />

      <Card className="mb-8 !p-5">
        <p className="text-sm text-muted">
          Игроки в листе сезона попадают в матчевые заявки. Вне листа — только если
          лист пуст.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <form action={fillSeasonRosterAction}>
            <input type="hidden" name="seasonId" value={season.id} />
            <input type="hidden" name="clubId" value={session.clubId!} />
            <Button type="submit" size="sm" variant="outline">
              Заполнить всеми допущенными
            </Button>
          </form>
          <DeleteButton
            action={clearSeasonRoster}
            confirmMessage="Очистить весь заявочный лист?"
            hidden={{ seasonId: season.id, clubId: session.clubId }}
            label="Очистить лист"
          />
        </div>
      </Card>

      <SectionTitle>
        Игроки клуба ({registrations.length})
      </SectionTitle>

      {rows.length === 0 ? (
        <p className="text-muted">
          В реестре нет игроков. Лига добавляет их в разделе «Игроки».
        </p>
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>№</th>
              <th>Игрок</th>
              <th>Допуск</th>
              <th>Лист</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ reg, onRoster, block }) => (
              <tr key={reg.id}>
                <td className="font-mono">{reg.shirtNumber ?? "—"}</td>
                <td>
                  <span className="font-medium">
                    {reg.player.firstName} {reg.player.lastName}
                  </span>
                  {block && (
                    <p className="text-xs text-danger">{block}</p>
                  )}
                </td>
                <td className="text-sm text-muted">{reg.eligibility}</td>
                <td>
                  <form action={toggleSeasonRosterAction}>
                    <input type="hidden" name="seasonId" value={season.id} />
                    <input type="hidden" name="clubId" value={session.clubId!} />
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
      )}
    </>
  );
}
