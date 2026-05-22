import { Button } from "@/components/kickoff/button";
import { DeleteButton } from "@/components/kickoff/confirm-form";
import { PageHeader } from "@/components/kickoff/page-header";
import { Card, inputClass, labelClass } from "@/components/kickoff/ui";
import {
  deletePlayerDocument,
  deletePlayerRegistration,
  updatePlayerRegistration,
} from "@/lib/actions-crud";
import { updatePlayerEligibility } from "@/lib/actions";
import { addPlayerDocument, uploadPlayerPhoto } from "@/lib/actions-registry";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/queries";
import { EligibilityStatus } from "@prisma/client";
import { format } from "@/lib/format";
import { PlayerGoalSparkline } from "@/components/league/player-goal-sparkline";
import { getPlayerSeasonStats } from "@/lib/player-stats";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

const STATUS_LABELS: Record<EligibilityStatus, string> = {
  ELIGIBLE: "Допущен",
  PENDING: "На проверке",
  SUSPENDED: "Отстранён",
};

export default async function PlayerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const ctx = await getOrgContext();
  if (!ctx?.season) redirect("/league/settings");

  const reg = await prisma.playerRegistration.findFirst({
    where: {
      id: params.id,
      seasonId: ctx.season.id,
      season: { organizationId: ctx.session.organizationId },
    },
    include: {
      player: { include: { documents: true } },
      club: true,
      disciplinary: { where: { active: true } },
    },
  });

  if (!reg) notFound();

  const stats = await getPlayerSeasonStats(reg.id);
  const dob = reg.player.dateOfBirth.toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        label="Игрок"
        title={`${reg.player.firstName} ${reg.player.lastName}`}
        description={`${reg.club.name} · № ${reg.shirtNumber ?? "—"}${reg.ageCategory ? ` · ${reg.ageCategory}` : ""}`}
      >
        <Link href="/league/players">
          <Button variant="ghost" size="sm">
            ← Реестр
          </Button>
        </Link>
      </PageHeader>

      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="!p-4 text-center">
            <p className="font-mono text-2xl font-bold text-accent">{stats.goals}</p>
            <p className="text-xs text-muted">Голы</p>
          </Card>
          <Card className="!p-4 text-center">
            <p className="font-mono text-2xl font-bold">{stats.appearances}</p>
            <p className="text-xs text-muted">Матчи</p>
          </Card>
          <Card className="!p-4 text-center">
            <p className="font-mono text-2xl font-bold">{stats.starts}</p>
            <p className="text-xs text-muted">В старте</p>
          </Card>
          <Card className="!p-4 text-center">
            <p className="font-mono text-2xl font-bold text-warning">{stats.yellow}</p>
            <p className="text-xs text-muted">ЖК</p>
          </Card>
          <Card className="!p-4 text-center">
            <p className="font-mono text-2xl font-bold text-danger">{stats.red}</p>
            <p className="text-xs text-muted">КК</p>
          </Card>
        </div>
      )}

      {stats && stats.goalTimeline.length >= 2 && (
        <Card className="mb-8">
          <h3 className="font-display text-lg font-bold">Динамика голов</h3>
          <div className="mt-4">
            <PlayerGoalSparkline data={stats.goalTimeline} />
          </div>
        </Card>
      )}

      {stats && stats.recent.length > 0 && (
        <Card className="mb-8">
          <h3 className="font-display text-lg font-bold">Последние события</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {stats.recent.map((e, i) => (
              <li key={i} className="text-muted">
                {format.date(e.date)} · {e.fixtureLabel} · {e.minute}&apos; · {e.type}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-bold">Фото</h3>
          {reg.player.photoUrl && (
            <Image
              src={reg.player.photoUrl}
              alt=""
              width={96}
              height={96}
              className="mt-3 rounded-xl object-cover"
            />
          )}
          <form action={uploadPlayerPhoto} encType="multipart/form-data" className="mt-4 space-y-2">
            <input type="hidden" name="playerId" value={reg.player.id} />
            <input name="photo" type="file" accept="image/*" required className="text-sm" />
            <Button type="submit" size="sm" variant="outline">
              Загрузить фото
            </Button>
          </form>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-bold">Данные</h3>
          <form action={updatePlayerRegistration} className="mt-4 space-y-3">
            <input type="hidden" name="id" value={reg.id} />
            <input name="firstName" defaultValue={reg.player.firstName} required className={inputClass} />
            <input name="lastName" defaultValue={reg.player.lastName} required className={inputClass} />
            <input name="dateOfBirth" type="date" defaultValue={dob} required className={inputClass} />
            <input name="shirtNumber" type="number" defaultValue={reg.shirtNumber ?? ""} className={inputClass} />
            <input name="position" defaultValue={reg.position ?? "MF"} className={inputClass} />
            <input
              name="ageCategory"
              defaultValue={reg.ageCategory ?? ""}
              placeholder="U14 / OPEN"
              className={inputClass}
            />
            <input
              name="externalFifaId"
              defaultValue={reg.player.externalFifaId ?? ""}
              placeholder="FIFA ID"
              className={inputClass}
            />
            <Button type="submit" size="sm">
              Сохранить
            </Button>
          </form>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-bold">Допуск</h3>
          <p className="mt-2 text-sm">
            Статус:{" "}
            <span className="font-medium text-accent">{STATUS_LABELS[reg.eligibility]}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["ELIGIBLE", "PENDING", "SUSPENDED"] as EligibilityStatus[]).map((s) => (
              <form
                key={s}
                action={async () => {
                  "use server";
                  await updatePlayerEligibility(reg.id, s);
                }}
              >
                <Button
                  type="submit"
                  size="sm"
                  variant={reg.eligibility === s ? "primary" : "ghost"}
                >
                  {STATUS_LABELS[s]}
                </Button>
              </form>
            ))}
          </div>
          {reg.disciplinary.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-danger">
              {reg.disciplinary.map((d) => (
                <li key={d.id}>
                  {d.reason} — бан {d.matchesBanned - d.matchesServed} матч.
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 border-t border-border pt-4">
            <DeleteButton
              action={deletePlayerRegistration}
              confirmMessage={`Удалить ${reg.player.firstName} ${reg.player.lastName} из сезона?`}
              hidden={{ registrationId: reg.id }}
              label="Удалить из реестра"
            />
          </div>
        </Card>
      </div>

      <Card className="mb-8">
        <h3 className="font-display text-lg font-bold">Документы</h3>
        {reg.player.documents.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Документов нет</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reg.player.documents.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-base/40 px-4 py-3 text-sm"
              >
                <div>
                  <span className="font-medium">{d.docType}</span>
                  {d.expiresAt && (
                    <span className="ml-2 text-muted">
                      до {format.date(d.expiresAt)}
                    </span>
                  )}
                  {d.filePath && (
                    <a
                      href={d.filePath}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 text-accent hover:underline"
                    >
                      Скачать
                    </a>
                  )}
                </div>
                <DeleteButton
                  action={deletePlayerDocument}
                  confirmMessage="Удалить документ?"
                  hidden={{ documentId: d.id, registrationId: reg.id }}
                  label="Удалить"
                />
              </li>
            ))}
          </ul>
        )}
        <form action={addPlayerDocument} encType="multipart/form-data" className="mt-6 space-y-3 border-t border-border pt-6">
          <input type="hidden" name="playerId" value={reg.playerId} />
          <input name="docType" defaultValue="medical" className={inputClass} />
          <input name="expiresAt" type="date" className={inputClass} />
          <div>
            <span className={labelClass}>Файл</span>
            <input name="file" type="file" accept=".pdf,.jpg,.png" className="mt-1 w-full text-sm text-muted" />
          </div>
          <Button type="submit" size="sm" variant="outline">
            Добавить документ
          </Button>
        </form>
      </Card>
    </>
  );
}
