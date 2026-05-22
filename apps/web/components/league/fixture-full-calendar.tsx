"use client";

import { rescheduleFixture } from "@/lib/actions-fixtures";
import type { CalendarFixtureItem } from "@/components/league/fixture-month-calendar";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendarBase from "@fullcalendar/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { ComponentType } from "react";

const FullCalendar = FullCalendarBase as unknown as ComponentType<
  Record<string, unknown>
>;
const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "#3b82f6",
  SQUADS_OPEN: "#eab308",
  LIVE: "#ef4444",
  CLOSED: "#6b7280",
  PROTOCOL_REVIEW: "#a855f7",
};

export function FixtureFullCalendar({
  fixtures,
}: {
  fixtures: CalendarFixtureItem[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const events = useMemo(
    () =>
      fixtures.map((f) => ({
        id: f.id,
        title: `${f.homeShort} — ${f.awayShort}`,
        start: f.scheduledAt,
        backgroundColor: STATUS_COLORS[f.status] ?? "#22c55e",
        borderColor: "transparent",
        extendedProps: { status: f.status },
      })),
    [fixtures],
  );

  const onDrop = useCallback(
    async (info: { event: { id: string; start: Date | null; extendedProps: { status: string } }; revert: () => void }) => {
      const status = info.event.extendedProps.status as string;
      if (status === "LIVE" || status === "CLOSED") {
        info.revert();
        setError("Нельзя переносить live или завершённые матчи");
        return;
      }
      if (!info.event.start) {
        info.revert();
        return;
      }
      setBusy(true);
      setError(null);
      try {
        await rescheduleFixture(info.event.id, info.event.start.toISOString());
        router.refresh();
      } catch {
        info.revert();
        setError("Не удалось перенести матч");
      } finally {
        setBusy(false);
      }
    },
    [router],
  );

  return (
    <div className="fixture-fc-wrap rounded-2xl border border-border bg-elevated p-4">
      <p className="mb-3 text-xs text-muted">
        Перетащите матч на другой день — заявки в черновик, клубы получат уведомление.
        {busy && <span className="ml-2 text-accent">Сохранение…</span>}
      </p>
      {error && <p className="mb-2 text-xs text-danger">{error}</p>}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ru"
        firstDay={1}
        height="auto"
        events={events}
        editable
        eventDurationEditable={false}
        eventDrop={(arg: Parameters<typeof onDrop>[0]) => void onDrop(arg)}
        eventClick={(arg: { event: { id: string } }) =>
          router.push(`/league/fixtures/${arg.event.id}`)
        }
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek",
        }}
        buttonText={{
          today: "Сегодня",
          month: "Месяц",
          week: "Неделя",
        }}
      />
    </div>
  );
}
