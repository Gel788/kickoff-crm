import { NotificationFeed } from "@/components/kickoff/notification-feed";
import { PageHeader } from "@/components/kickoff/page-header";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const items = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unread = items.filter((n) => !n.read).length;

  await prisma.notification.updateMany({
    where: { userId: session.userId, read: false },
    data: { read: true },
  });

  return (
    <>
      <PageHeader
        label="Inbox"
        title="Уведомления"
        description={
          unread > 0
            ? `${unread} новых — переносы, заявки, протоколы`
            : "История событий лиги и клубов"
        }
      />
      <NotificationFeed items={items} />
    </>
  );
}
