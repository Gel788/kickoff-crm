import { Button } from "@/components/kickoff/button";
import { DeleteButton } from "@/components/kickoff/confirm-form";
import { PageHeader } from "@/components/kickoff/page-header";
import { DataTable, FormCard, inputClass } from "@/components/kickoff/ui";
import {
  createApiKey,
  createWebhook,
  deleteWebhook,
  revokeApiKey,
} from "@/lib/actions-integrations";
import {
  updateOrganization,
  updateTelegramChat,
  uploadOrganizationLogo,
} from "@/lib/actions-org";
import {
  createFixture,
  createRound,
  generateRoundRobin,
  updateSeasonRegulation,
} from "@/lib/actions-season";
import { prisma } from "@/lib/db";
import { pointsFromRegulationRules } from "@/lib/season-rules";
import { getOrgContext } from "@/lib/queries";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { api_key?: string };
}) {
  const ctx = await getOrgContext();
  if (!ctx?.org) redirect("/login");

  const season = ctx.season
    ? await prisma.season.findUnique({
        where: { id: ctx.season.id },
        include: {
          regulation: true,
          competitions: {
            include: {
              divisions: {
                include: { rounds: { orderBy: { number: "desc" } } },
              },
            },
          },
        },
      })
    : null;

  const pointsRules = season?.regulation
    ? pointsFromRegulationRules(season.regulation.rules)
    : { win: 3, draw: 1, loss: 0 };

  const orgFull = await prisma.organization.findUnique({
    where: { id: ctx.org.id },
    include: {
      apiKeys: { where: { active: true }, orderBy: { createdAt: "desc" } },
      webhookEndpoints: { orderBy: { createdAt: "desc" } },
    },
  });

  const division = season?.competitions[0]?.divisions[0];
  const clubs = season
    ? await prisma.club.findMany({
        where: { seasonClubs: { some: { seasonId: season.id } } },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <>
      <PageHeader label="Админ" title="Настройки лиги" />

      <div className="grid max-w-4xl gap-8">
        {searchParams.api_key && (
          <div className="rounded-xl border border-accent/40 bg-accent-dim/40 p-4 text-sm">
            <p className="font-bold text-accent">API-ключ (скопируйте сейчас)</p>
            <code className="mt-2 block break-all font-mono text-xs">
              {searchParams.api_key}
            </code>
          </div>
        )}

        <form action={updateOrganization} className="rounded-xl border border-border bg-elevated p-6 space-y-4">
          <h3 className="font-display font-bold">Организация</h3>
          {orgFull?.logoUrl && (
            <Image
              src={orgFull.logoUrl}
              alt="Logo"
              width={64}
              height={64}
              className="rounded-lg"
            />
          )}
          <input name="name" defaultValue={ctx.org.name} className={inputClass} />
          <input name="timezone" defaultValue={orgFull?.timezone ?? "Europe/Moscow"} className={inputClass} />
          <input name="locale" defaultValue={orgFull?.locale ?? "ru"} className={inputClass} />
          <Button type="submit" size="sm">Сохранить</Button>
        </form>

        <form action={uploadOrganizationLogo} encType="multipart/form-data" className="rounded-xl border border-border bg-elevated p-6 space-y-4">
          <h3 className="font-display font-bold">Логотип для PDF</h3>
          <input name="logo" type="file" accept="image/*" required className="text-sm" />
          <Button type="submit" size="sm" variant="outline">Загрузить</Button>
        </form>

        <form action={updateTelegramChat} className="rounded-xl border border-border bg-elevated p-6 space-y-4">
          <h3 className="font-display font-bold">Telegram</h3>
          <p className="text-xs text-muted">
            В боте: /link {ctx.org.slug} · Webhook: /api/telegram/webhook
          </p>
          <input
            name="telegramChatId"
            defaultValue={orgFull?.telegramChatId ?? ""}
            placeholder="Chat ID"
            className={inputClass}
          />
          <Button type="submit" size="sm" variant="outline">
            Сохранить chat
          </Button>
        </form>

        <section className="rounded-xl border border-border bg-elevated p-6 text-sm space-y-2">
          <h3 className="font-display font-bold">Публичные ссылки</h3>
          <p>
            <span className="text-muted">API:</span>{" "}
            <code className="text-accent">/api/v1/{ctx.org.slug}/standings</code>
          </p>
          <p>
            <span className="text-muted">Live:</span>{" "}
            <Link href={`/live/${ctx.org.slug}`} className="text-accent hover:underline">
              /live/{ctx.org.slug}
            </Link>
          </p>
          <p>
            <span className="text-muted">OpenAPI:</span>{" "}
            <Link href="/api/openapi" className="text-accent hover:underline">
              /api/openapi
            </Link>
          </p>
          {season && (
            <p>
              <span className="text-muted">FIFA CSV:</span>{" "}
              <Link href={`/api/league/export-fifa?seasonId=${season.id}`} className="text-accent hover:underline">
                экспорт регистраций
              </Link>
            </p>
          )}
        </section>

        <form action={createApiKey}>
          <FormCard title="API-ключи" description="Заголовок X-Api-Key">
            <input name="name" placeholder="Интеграция" className={inputClass} />
            <Button type="submit" size="sm">Создать ключ</Button>
          </FormCard>
        </form>
        {orgFull && orgFull.apiKeys.length > 0 && (
          <DataTable>
            <thead>
              <tr><th>Имя</th><th>Префикс</th><th></th></tr>
            </thead>
            <tbody>
              {orgFull.apiKeys.map((k) => (
                <tr key={k.id}>
                  <td>{k.name}</td>
                  <td className="font-mono text-xs">{k.keyPrefix}…</td>
                  <td>
                    <DeleteButton action={revokeApiKey} hidden={{ id: k.id }} label="Отозвать" confirmMessage="Отозвать ключ?" />
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}

        <form action={createWebhook}>
          <FormCard title="Webhooks" description="События через запятую, напр. fixture.closed">
            <input name="url" type="url" placeholder="https://..." required className={inputClass} />
            <input name="events" defaultValue="fixture.closed" className={inputClass} />
            <Button type="submit" size="sm">Добавить endpoint</Button>
          </FormCard>
        </form>
        {orgFull && orgFull.webhookEndpoints.length > 0 && (
          <DataTable>
            <thead>
              <tr><th>URL</th><th></th></tr>
            </thead>
            <tbody>
              {orgFull.webhookEndpoints.map((w) => (
                <tr key={w.id}>
                  <td className="max-w-xs truncate font-mono text-xs">{w.url}</td>
                  <td>
                    <DeleteButton action={deleteWebhook} hidden={{ id: w.id }} label="Удалить" confirmMessage="Удалить webhook?" />
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}

        {season && (
          <>
            <form
              action={updateSeasonRegulation}
              className="rounded-xl border border-border bg-elevated p-6 space-y-4"
            >
              <h3 className="font-display font-bold">Регламент сезона</h3>
              <input type="hidden" name="seasonId" value={season.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs text-muted">
                  Дедлайн заявки (ч)
                  <input
                    name="squadDeadlineHours"
                    type="number"
                    defaultValue={season.squadDeadlineHours}
                    className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2"
                  />
                </label>
                <label className="text-xs text-muted">
                  Макс. игроков в клубе
                  <input
                    name="maxSquadSize"
                    type="number"
                    defaultValue={season.maxSquadSize ?? 25}
                    className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2"
                  />
                </label>
                <label className="text-xs text-muted">
                  Макс. запасных
                  <input
                    name="maxBench"
                    type="number"
                    defaultValue={season.maxBench}
                    className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2"
                  />
                </label>
                <label className="text-xs text-muted">
                  Жёлтых до бана
                  <input
                    name="yellowBanThreshold"
                    type="number"
                    defaultValue={season.yellowBanThreshold}
                    className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2"
                  />
                </label>
                <label className="text-xs text-muted">
                  Бан за жёлтые (матчей)
                  <input
                    name="yellowBanMatches"
                    type="number"
                    defaultValue={season.yellowBanMatches}
                    className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2"
                  />
                </label>
                <label className="text-xs text-muted">
                  Бан за красную (матчей)
                  <input
                    name="redBanMatches"
                    type="number"
                    defaultValue={season.redBanMatches}
                    className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2"
                  />
                </label>
                <label className="text-xs text-muted">
                  Очки за победу
                  <input
                    name="pointsWin"
                    type="number"
                    defaultValue={pointsRules.win}
                    className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2"
                  />
                </label>
                <label className="text-xs text-muted">
                  Очки за ничью
                  <input
                    name="pointsDraw"
                    type="number"
                    defaultValue={pointsRules.draw}
                    className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2"
                  />
                </label>
                <label className="text-xs text-muted">
                  Очки за поражение
                  <input
                    name="pointsLoss"
                    type="number"
                    defaultValue={pointsRules.loss}
                    className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2"
                  />
                </label>
              </div>
              <Button type="submit" size="sm">
                Сохранить регламент
              </Button>
            </form>

            {division && (
              <>
                <form
                  action={generateRoundRobin}
                  className="rounded-xl border border-accent/20 bg-accent-dim/30 p-6 space-y-4"
                >
                  <h3 className="font-display font-bold">Сгенерировать тур (все пары)</h3>
                  <input type="hidden" name="divisionId" value={division.id} />
                  <input type="hidden" name="seasonId" value={season.id} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      name="roundNumber"
                      type="number"
                      placeholder="Номер тура"
                      defaultValue={division.rounds[0]?.number + 1 || 1}
                      className="rounded-lg border border-border bg-base px-3 py-2 text-sm"
                    />
                    <input
                      name="startDate"
                      type="date"
                      required
                      className="rounded-lg border border-border bg-base px-3 py-2 text-sm"
                    />
                  </div>
                  <Button type="submit" size="sm">
                    Создать матчи круга
                  </Button>
                </form>

                <form
                  action={createFixture}
                  className="rounded-xl border border-border bg-elevated p-6 space-y-4"
                >
                  <h3 className="font-display font-bold">Добавить матч</h3>
                  <select
                    name="roundId"
                    className="w-full rounded-lg border border-border bg-base px-3 py-2 text-sm"
                  >
                    {division.rounds.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name ?? `Тур ${r.number}`}
                      </option>
                    ))}
                  </select>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <select
                      name="homeClubId"
                      className="rounded-lg border border-border bg-base px-3 py-2 text-sm"
                    >
                      {clubs.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} (дом)
                        </option>
                      ))}
                    </select>
                    <select
                      name="awayClubId"
                      className="rounded-lg border border-border bg-base px-3 py-2 text-sm"
                    >
                      {clubs.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} (гости)
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    name="scheduledAt"
                    type="datetime-local"
                    required
                    className="w-full rounded-lg border border-border bg-base px-3 py-2 text-sm"
                  />
                  <input
                    name="venue"
                    placeholder="Стадион"
                    className="w-full rounded-lg border border-border bg-base px-3 py-2 text-sm"
                  />
                  <Button type="submit" size="sm">
                    Создать матч
                  </Button>
                </form>

                <form
                  action={createRound}
                  className="rounded-xl border border-border bg-elevated p-6 space-y-4"
                >
                  <h3 className="font-display font-bold">Новый тур</h3>
                  <input type="hidden" name="divisionId" value={division.id} />
                  <input
                    name="number"
                    type="number"
                    placeholder="Номер тура"
                    className="w-full rounded-lg border border-border bg-base px-3 py-2 text-sm"
                  />
                  <input
                    name="name"
                    placeholder="Название (опционально)"
                    className="w-full rounded-lg border border-border bg-base px-3 py-2 text-sm"
                  />
                  <Button type="submit" size="sm" variant="outline">
                    Добавить тур
                  </Button>
                </form>
              </>
            )}
          </>
        )}

        <section className="rounded-xl border border-border bg-elevated p-6 text-sm">
          <h3 className="font-display font-bold text-accent">Демо-аккаунты</h3>
          <p className="mt-2 text-muted">Пароль для всех: demo123</p>
          <ul className="mt-3 space-y-1 font-mono text-xs">
            <li>operator@kickoff.app — лига</li>
            <li>admin@kickoff.app — platform</li>
            <li>referee@kickoff.app — судья</li>
            <li>coach@kickoff.app — клуб</li>
            <li>delegate@kickoff.app — делегат</li>
            <li>medical@kickoff.app — врач</li>
            <li>parent@kickoff.app — опекун</li>
          </ul>
          <Link href="/login" className="mt-4 inline-block text-accent hover:underline">
            Войти →
          </Link>
        </section>
      </div>
    </>
  );
}
