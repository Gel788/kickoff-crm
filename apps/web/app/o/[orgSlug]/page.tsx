import { Button } from "@/components/kickoff/button";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function OrgPublicHubPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
    include: { seasons: { where: { isActive: true }, take: 1 } },
  });
  if (!org) notFound();

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="min-h-screen bg-base p-10">
      <p className="font-mono text-xs uppercase text-accent">Kickoff</p>
      <h1 className="mt-2 font-display text-4xl font-bold">{org.name}</h1>
      <p className="mt-2 text-muted">
        Сезон: {org.seasons[0]?.name ?? "—"} · slug: {org.slug}
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link href={`/live/${org.slug}`}>
          <Button size="lg">Live-табло</Button>
        </Link>
        <Link href={`/o/${org.slug}/league/dashboard`}>
          <Button size="lg" variant="outline">
            Кабинет лиги
          </Button>
        </Link>
        <Link href="/login">
          <Button size="lg" variant="ghost">
            Войти
          </Button>
        </Link>
      </div>

      <section className="mt-12 rounded-xl border border-border bg-elevated p-6 text-sm font-mono">
        <p className="text-muted mb-2">API</p>
        <p>GET {base}/api/v1/{org.slug}/standings</p>
        <p>GET {base}/api/v1/{org.slug}/live/stream (SSE)</p>
        <p>GET {base}/api/openapi</p>
      </section>
    </div>
  );
}
