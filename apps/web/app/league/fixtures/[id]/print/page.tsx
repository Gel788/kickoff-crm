import { getFixtureDetail } from "@/lib/queries";
import { format } from "@/lib/format";
import { REFEREE_SLOT_LABELS, REFEREE_SLOT_ORDER } from "@/lib/referee-slots";
import { notFound } from "next/navigation";

const EVENT_RU: Record<string, string> = {
  GOAL: "Гол",
  OWN_GOAL: "Автогол",
  PENALTY_SCORED: "Пенальти",
  YELLOW: "ЖК",
  SECOND_YELLOW: "2ЖК",
  RED: "КК",
  SUBSTITUTION: "Замена",
  INJURY: "Травма",
  VAR_DECISION: "VAR",
  OTHER: "Прочее",
};

export default async function PrintProtocolPage({
  params,
}: {
  params: { id: string };
}) {
  const fixture = await getFixtureDetail(params.id);
  if (!fixture) notFound();

  return (
    <html lang="ru">
      <head>
        <title>
          Протокол — {fixture.homeClub.name} vs {fixture.awayClub.name}
        </title>
        <style>{`
          body { font-family: system-ui, sans-serif; padding: 40px; color: #111; }
          h1 { font-size: 22px; margin-bottom: 8px; }
          .meta { color: #555; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          .score { font-size: 32px; font-weight: bold; margin: 24px 0; }
          @media print { button { display: none; } }
        `}</style>
      </head>
      <body>
        <button type="button" id="print-btn">
          Печать / Сохранить PDF
        </button>
        <script dangerouslySetInnerHTML={{ __html: "document.getElementById('print-btn')?.addEventListener('click',function(){window.print()})" }} />
        <h1>Судейский протокол</h1>
        <p className="meta">
          {fixture.homeClub.name} — {fixture.awayClub.name}
          <br />
          {format.datetime(fixture.scheduledAt)}
          {fixture.venue && ` · ${fixture.venue}`}
        </p>
        <p className="score">
          {fixture.homeScore} : {fixture.awayScore}
        </p>
        {fixture.refereeAssignments.length > 0 && (
          <div>
            <strong>Судейская бригада:</strong>
            <ul>
              {REFEREE_SLOT_ORDER.map((slot) => {
                const a = fixture.refereeAssignments.find((x) => x.slot === slot);
                if (!a) return null;
                return (
                  <li key={slot}>
                    {REFEREE_SLOT_LABELS[slot]}: {a.user.name}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <h2>События</h2>
        <table>
          <thead>
            <tr>
              <th>Мин</th>
              <th>Событие</th>
              <th>Игрок</th>
            </tr>
          </thead>
          <tbody>
            {fixture.events.map((e) => (
              <tr key={e.id}>
                <td>{e.minute}&apos;</td>
                <td>{EVENT_RU[e.type] ?? e.type}</td>
                <td>
                  {e.registration
                    ? `${e.registration.player.firstName} ${e.registration.player.lastName}`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Заявки</h2>
        {fixture.squads.map((s) => (
          <div key={s.id} style={{ marginBottom: 16 }}>
            <strong>{s.club.name}</strong>
            <ul>
              {s.lines.map((l) => (
                <li key={l.id}>
                  {l.registration.player.firstName}{" "}
                  {l.registration.player.lastName}
                  {l.isCaptain ? " (C)" : ""}
                  {l.isStarter ? "" : " [зап]"}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <h2>Подписи</h2>
        <ul>
          {fixture.signatures.map((s) => (
            <li key={s.id}>
              {s.role}: {s.refused ? `Отказ — ${s.refuseReason}` : s.user.name}
            </li>
          ))}
        </ul>

        {fixture.medicalReport && (
          <>
            <h2>Медицина</h2>
            <p>{fixture.medicalReport.summary}</p>
            <p>{fixture.medicalReport.injuries}</p>
          </>
        )}

        <p style={{ marginTop: 40, fontSize: 12, color: "#888" }}>
          Kickoff · сгенерировано {format.datetime(new Date())}
        </p>
      </body>
    </html>
  );
}
