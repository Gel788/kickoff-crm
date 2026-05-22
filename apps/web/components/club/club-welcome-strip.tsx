import { format } from "@/lib/format";
import { Calendar, ClipboardList } from "lucide-react";
import Link from "next/link";

export function ClubWelcomeStrip({
  clubName,
  seasonName,
  openSquad,
}: {
  clubName: string;
  seasonName: string;
  openSquad: boolean;
}) {
  return (
    <div className="app-dashboard-hero mb-8 rounded-2xl border border-white/[0.08] p-5 sm:p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
        {seasonName}
      </p>
      <h2 className="mt-2 font-display text-xl font-bold sm:text-2xl">{clubName}</h2>
      <p className="mt-2 text-sm text-muted">
        {openSquad
          ? "Заявка открыта — заполните состав и подайте до дедлайна."
          : "Следите за календарём и готовьте состав к следующему матчу."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Link
          href="/club/roster"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-base/50 px-3 py-1.5 text-muted hover:text-white"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Состав сезона
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 font-mono text-muted">
          <Calendar className="h-3.5 w-3.5" />
          {format.date(new Date())}
        </span>
      </div>
    </div>
  );
}
