import { resolveOrgBySlug } from "@/lib/api-helpers";
import { getStandingsForSeason } from "@/lib/queries";

export default async function EmbedStandingsPage({
  params,
}: {
  params: { slug: string };
}) {
  const org = await resolveOrgBySlug(params.slug);
  if (!org?.seasons[0]) {
    return (
      <p style={{ fontFamily: "system-ui", padding: 16 }}>Лига не найдена</p>
    );
  }

  const { standings } = await getStandingsForSeason(org.seasons[0].id);

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        background: "#0a0a0a",
        color: "#eee",
        padding: 12,
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: 14, margin: "0 0 12px", opacity: 0.7 }}>
        {org.name} — таблица
      </h1>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #333" }}>
            <th style={{ textAlign: "left", padding: 6 }}>#</th>
            <th style={{ textAlign: "left", padding: 6 }}>Клуб</th>
            <th style={{ textAlign: "center", padding: 6 }}>О</th>
            <th style={{ textAlign: "center", padding: 6 }}>И</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => (
            <tr key={row.clubId} style={{ borderBottom: "1px solid #222" }}>
              <td style={{ padding: 6, opacity: 0.6 }}>{i + 1}</td>
              <td style={{ padding: 6 }}>{row.clubName}</td>
              <td style={{ padding: 6, textAlign: "center", color: "#00e676" }}>
                {row.points}
              </td>
              <td style={{ padding: 6, textAlign: "center" }}>{row.played}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 12, fontSize: 10, opacity: 0.4 }}>Kickoff</p>
    </div>
  );
}
