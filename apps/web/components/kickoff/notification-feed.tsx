import { EmptyState } from "@/components/kickoff/ui";
import { format } from "@/lib/format";
import { Bell } from "lucide-react";
import Link from "next/link";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
};

export function NotificationFeed({ items }: { items: NotificationItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="Входящих нет"
        description="Здесь появятся переносы матчей, дедлайны заявок и события протокола"
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((n) => (
        <li
          key={n.id}
          className={`app-list-card rounded-2xl border p-5 transition-colors ${
            n.read
              ? "border-border/80 bg-elevated/60"
              : "border-accent/25 bg-gradient-to-br from-accent/[0.08] to-elevated/80"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <p className="font-medium">{n.title}</p>
            {!n.read && (
              <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] uppercase text-base">
                new
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">{n.body}</p>
          {n.link && (
            <Link
              href={n.link}
              className="mt-3 inline-flex text-sm font-medium text-accent hover:text-white"
            >
              Открыть →
            </Link>
          )}
          <p className="mt-3 font-mono text-[10px] text-muted/80">
            {format.datetime(n.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
