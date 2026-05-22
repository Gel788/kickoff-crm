import { resolveOrgBySlug } from "@/lib/api-helpers";
import { getTopScorers } from "@/lib/queries";

export default async function EmbedScorersPage({
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

  const scorers = await getTopScorers(org.seasons[0].id, 15);

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
        {org.name} — бомбардиры
      </h1>
      <ol style={{ margin: 0, padding: "0 0 0 20px", fontSize: 13 }}>
        {scorers.length === 0 ? (
          <li style={{ opacity: 0.5 }}>Нет данных</li>
        ) : (
          scorers.map((s) => (
            <li key={s.name + s.club} style={{ marginBottom: 8 }}>
              <span style={{ color: "#00e676", fontWeight: 700 }}>{s.goals}</span>{" "}
              {s.name}{" "}
              <span style={{ opacity: 0.5, fontSize: 11 }}>{s.club}</span>
            </li>
          ))
        )}
      </ol>
      <p style={{ marginTop: 12, fontSize: 10, opacity: 0.4 }}>Kickoff</p>
    </div>
  );
}
