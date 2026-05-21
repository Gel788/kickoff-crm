import { Button } from "@/components/kickoff/button";
import { DeleteButton } from "@/components/kickoff/confirm-form";
import { FlashBanner } from "@/components/kickoff/flash-banner";
import { PageHeader } from "@/components/kickoff/page-header";
import { DataTable, FormCard, inputClass, selectClass } from "@/components/kickoff/ui";
import { adminResetPassword } from "@/lib/actions-auth-reset";
import { inviteUser, removeMembership, updateMembershipRole } from "@/lib/actions-users";
import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/queries";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

const ROLE_LABELS: Partial<Record<Role, string>> = {
  LEAGUE_OPERATOR: "Оператор лиги",
  LEAGUE_OWNER: "Владелец",
  CLUB_COACH: "Тренер",
  CLUB_DELEGATE: "Делегат",
  CLUB_ADMIN: "Админ клуба",
  REFEREE_CHIEF: "Судья",
  REFEREE_ASSISTANT: "Помощник судьи",
  MEDICAL_LEAGUE: "Медик лиги",
  GUARDIAN: "Опекун",
  DISCIPLINARY: "Дисциплина",
};

const INVITE_ROLES = Object.keys(ROLE_LABELS) as Role[];

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { error?: string; flash?: string };
}) {
  const ctx = await getOrgContext();
  if (!ctx?.org) redirect("/login");

  const season = ctx.season;
  const [members, clubs] = await Promise.all([
    prisma.membership.findMany({
      where: { organizationId: ctx.session.organizationId },
      include: { user: true, club: true },
      orderBy: { user: { name: "asc" } },
    }),
    season
      ? prisma.club.findMany({
          where: { seasonClubs: { some: { seasonId: season.id } } },
          orderBy: { name: "asc" },
        })
      : prisma.club.findMany({
          where: { organizationId: ctx.session.organizationId },
          orderBy: { name: "asc" },
        }),
  ]);

  return (
    <>
      <PageHeader
        label="Команда"
        title="Пользователи"
        description="Приглашение, смена роли, удаление доступа"
      />

      <FlashBanner code={searchParams.error} flash={searchParams.flash} />

      <form action={inviteUser} className="mb-8">
        <FormCard
          title="Пригласить пользователя"
          description="Новому пользователю выдаётся пароль demo123"
        >
          <input name="email" type="email" placeholder="email@club.ru" required className={inputClass} />
          <input name="name" placeholder="Имя" className={inputClass} />
          <select name="role" className={selectClass}>
            {INVITE_ROLES.map((k) => (
              <option key={k} value={k}>
                {ROLE_LABELS[k]}
              </option>
            ))}
          </select>
          <select name="clubId" className={selectClass}>
            <option value="">— Лига (без клуба) —</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm">
            Пригласить
          </Button>
        </FormCard>
      </form>

      <DataTable>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Клуб</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td className="font-medium">{m.user.name}</td>
              <td className="font-mono text-xs">{m.user.email}</td>
              <td>
                <form action={updateMembershipRole} className="flex flex-wrap gap-2">
                  <input type="hidden" name="membershipId" value={m.id} />
                  <select
                    name="role"
                    defaultValue={m.role}
                    className="kickoff-select max-w-[160px] py-1.5 text-xs"
                  >
                    {INVITE_ROLES.map((k) => (
                      <option key={k} value={k}>
                        {ROLE_LABELS[k]}
                      </option>
                    ))}
                  </select>
                  <select
                    name="clubId"
                    defaultValue={m.clubId ?? ""}
                    className="kickoff-select max-w-[140px] py-1.5 text-xs"
                  >
                    <option value="">—</option>
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.shortName}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="sm" variant="ghost">
                    OK
                  </Button>
                </form>
              </td>
              <td className="text-muted">{m.club?.shortName ?? "—"}</td>
              <td>
                <div className="flex flex-col gap-2">
                  <form action={adminResetPassword} className="flex gap-1">
                    <input type="hidden" name="userId" value={m.user.id} />
                    <input
                      name="password"
                      type="text"
                      defaultValue="demo123"
                      className="kickoff-input max-w-[88px] py-1 text-xs"
                    />
                    <Button type="submit" size="sm" variant="ghost">
                      Сброс
                    </Button>
                  </form>
                  <DeleteButton
                    action={removeMembership}
                    confirmMessage={`Убрать доступ ${m.user.email}?`}
                    hidden={{ membershipId: m.id }}
                    label="Удалить"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
