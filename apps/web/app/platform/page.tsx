import { Button } from "@/components/kickoff/button";
import { PageHeader } from "@/components/kickoff/page-header";
import { DataTable, FormCard, inputClass, selectClass } from "@/components/kickoff/ui";
import { updateOrganizationPlan } from "@/lib/actions-billing";
import {
  createOrganization,
  createPlatformLeagueOwner,
  requirePlatformAdmin,
} from "@/lib/actions-platform";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PlatformPage() {
  try {
    await requirePlatformAdmin();
  } catch {
    redirect("/login");
  }

  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { seasons: true, clubs: true, memberships: true } },
    },
  });

  return (
    <div className="min-h-screen bg-base p-8">
      <PageHeader
        label="Platform"
        title="Админ платформы"
        description="SaaS: организации, планы, лимиты"
      />

      <form action={createOrganization} className="mb-8 max-w-md">
        <FormCard title="Новая лига">
          <input name="name" placeholder="Название лиги" required className={inputClass} />
          <input name="slug" placeholder="slug (demo)" required className={inputClass} />
          <Button type="submit" size="sm">
            Создать org + сезон
          </Button>
        </FormCard>
      </form>

      <DataTable>
        <thead>
          <tr>
            <th>Лига</th>
            <th>Slug</th>
            <th>План</th>
            <th>Лимиты</th>
            <th>Клубы</th>
            <th>План</th>
          </tr>
        </thead>
        <tbody>
          {orgs.map((o) => (
            <tr key={o.id}>
              <td className="font-medium">{o.name}</td>
              <td>
                <Link href={`/o/${o.slug}`} className="font-mono text-xs text-accent hover:underline">
                  {o.slug}
                </Link>
              </td>
              <td className="font-mono text-xs">{o.plan}</td>
              <td className="text-xs text-muted">
                {o._count.clubs}/{o.maxClubs} клубов · {o.maxPlayers} игр.
              </td>
              <td>{o._count.clubs}</td>
              <td>
                <form action={updateOrganizationPlan} className="flex gap-2">
                  <input type="hidden" name="organizationId" value={o.id} />
                  <select name="plan" defaultValue={o.plan} className={selectClass}>
                    <option value="pilot">pilot</option>
                    <option value="pro">pro</option>
                    <option value="enterprise">enterprise</option>
                  </select>
                  <Button type="submit" size="sm" variant="outline">
                    OK
                  </Button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>

      {orgs[0] && (
        <form action={createPlatformLeagueOwner} className="mt-8 max-w-md">
          <FormCard title="Владелец лиги">
            <input type="hidden" name="organizationId" value={orgs[0].id} />
            <input name="email" type="email" placeholder="owner@liga.ru" className={inputClass} />
            <input name="name" placeholder="Имя" className={inputClass} />
            <Button type="submit" size="sm">
              Назначить LEAGUE_OWNER
            </Button>
          </FormCard>
        </form>
      )}
    </div>
  );
}
