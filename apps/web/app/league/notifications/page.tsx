import { PageHeader } from "@/components/kickoff/page-header";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const items = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  await prisma.notification.updateMany({
    where: { userId: session.userId, read: false },
    data: { read: true },
  });

  return (
    <>
      <PageHeader label="Inbox" title="Уведомления" />

      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="text-muted">Пусто</li>
        ) : (
          items.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border p-4 ${n.read ? "border-border bg-elevated" : "border-accent/30 bg-accent-dim"}`}
            >
              <p className="font-medium">{n.title}</p>
              <p className="mt-1 text-sm text-muted">{n.body}</p>
              {n.link && (
                <Link href={n.link} className="mt-2 inline-block text-sm text-accent">
                  Открыть →
                </Link>
              )}
              <p className="mt-2 font-mono text-xs text-muted">
                {n.createdAt.toLocaleString("ru-RU")}
              </p>
            </li>
          ))
        )}
      </ul>
    </>
  );
}
