import { Button } from "@/components/kickoff/button";
import { FlashBanner } from "@/components/kickoff/flash-banner";
import { PageHeader } from "@/components/kickoff/page-header";
import { PlayersTable, type PlayerTableRow } from "@/components/league/players-table";
import {
  EmptyState,
  FilterBar,
  FormCard,
  inputClass,
  labelClass,
  selectClass,
} from "@/components/kickoff/ui";
import { addPlayerDocument, createPlayer } from "@/lib/actions-registry";
import { Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/queries";
import { EligibilityStatus, Prisma } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

const STATUS_LABELS: Record<EligibilityStatus, string> = {
  ELIGIBLE: "Допущен",
  PENDING: "На проверке",
  SUSPENDED: "Отстранён",
};

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    club?: string;
    status?: string;
    error?: string;
    warn?: string;
    hint?: string;
  };
}) {
  const ctx = await getOrgContext();
  if (!ctx?.season) redirect("/league/settings");

  const q = searchParams.q?.trim() ?? "";
  const clubFilter = searchParams.club ?? "";
  const statusFilter = searchParams.status as EligibilityStatus | undefined;

  const where: Prisma.PlayerRegistrationWhereInput = {
    seasonId: ctx.season.id,
    ...(clubFilter ? { clubId: clubFilter } : {}),
    ...(statusFilter ? { eligibility: statusFilter } : {}),
    ...(q
      ? {
          OR: [
            { player: { firstName: { contains: q } } },
            { player: { lastName: { contains: q } } },
          ],
        }
      : {}),
  };

  const [players, clubs] = await Promise.all([
    prisma.playerRegistration.findMany({
      where,
      include: { player: { include: { documents: true } }, club: true },
      orderBy: [{ club: { name: "asc" } }, { shirtNumber: "asc" }],
    }),
    prisma.club.findMany({
      where: { seasonClubs: { some: { seasonId: ctx.season.id } } },
    }),
  ]);

  return (
    <>
      <PageHeader
        label="Реестр"
        title="Игроки"
        description={`${players.length} · лимит ${ctx.season.maxSquadSize} на клуб · карточка, правка, удаление`}
      />

      <FlashBanner
        code={searchParams.error}
        warn={searchParams.warn}
        hint={searchParams.hint}
      />

      <FilterBar>
      <form method="get" className="flex flex-wrap items-center gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Поиск по имени"
          className={`${inputClass} min-w-[200px] flex-1`}
        />
        <select name="club" defaultValue={clubFilter} className={selectClass}>
          <option value="">Все клубы</option>
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select name="status" defaultValue={statusFilter ?? ""} className={selectClass}>
          <option value="">Все статусы</option>
          {(["ELIGIBLE", "PENDING", "SUSPENDED"] as const).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <Button type="submit" size="sm">Фильтр</Button>
        <Link href="/league/players">
          <Button type="button" size="sm" variant="ghost">Сброс</Button>
        </Link>
      </form>
      </FilterBar>

      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <form action={createPlayer} className="space-y-3">
          <FormCard title="Новый игрок" description="Регистрация в реестре сезона">
            <input name="firstName" placeholder="Имя" required className={inputClass} />
            <input name="lastName" placeholder="Фамилия" required className={inputClass} />
            <input name="dateOfBirth" type="date" required className={inputClass} />
            <select name="clubId" className={selectClass}>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input name="shirtNumber" type="number" placeholder="Номер" className={inputClass} />
            <input name="position" defaultValue="MF" className={inputClass} />
            <select name="ageCategory" className={selectClass}>
              <option value="">Возрастная категория</option>
              {["U10", "U12", "U14", "U16", "U18", "OPEN"].map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" name="isMinor" className="rounded border-border" /> Несовершеннолетний
            </label>
            {searchParams.warn === "similar" && (
              <label className="flex items-center gap-2 text-sm text-warning">
                <input
                  type="checkbox"
                  name="confirmSimilar"
                  className="rounded border-border"
                />
                Подтверждаю: это не дубликат
              </label>
            )}
            <Button type="submit" size="sm">Создать</Button>
          </FormCard>
        </form>
        <form action={addPlayerDocument} encType="multipart/form-data" className="space-y-3">
          <FormCard title="Документ" description="PDF или изображение в карточку игрока">
            <select name="playerId" className={selectClass}>
              {players.map((r) => (
                <option key={r.playerId} value={r.playerId}>
                  {r.player.firstName} {r.player.lastName}
                </option>
              ))}
            </select>
            <input name="docType" defaultValue="medical" className={inputClass} />
            <input name="expiresAt" type="date" className={inputClass} />
            <div>
              <span className={labelClass}>Файл</span>
              <input name="file" type="file" accept=".pdf,.jpg,.png" className="w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-accent-dim file:px-3 file:py-2 file:text-xs file:font-medium file:text-accent" />
            </div>
            <Button type="submit" size="sm" variant="outline">Загрузить</Button>
          </FormCard>
        </form>
      </div>

      {players.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Игроков не найдено"
          description="Добавьте игрока формой выше или сбросьте фильтры"
        />
      ) : (
        <PlayersTable
          rows={players.map(
            (r): PlayerTableRow => ({
              registrationId: r.id,
              shirtNumber: r.shirtNumber,
              name: `${r.player.firstName} ${r.player.lastName}`,
              clubShort: r.club.shortName,
              docsCount: r.player.documents.length,
              hasFiles: r.player.documents.some((d) => d.filePath),
              eligibility: r.eligibility,
            }),
          )}
        />
      )}
    </>
  );
}
