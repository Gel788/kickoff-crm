import { getStandingsForSeason } from "@/lib/queries";
import { prisma } from "@/lib/db";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Kickoff — турнирная таблица";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { orgSlug: string };
}) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
    include: { seasons: { where: { isActive: true }, take: 1 } },
  });

  const season = org?.seasons[0];
  let rows: { pos: number; name: string; pts: number }[] = [];

  if (season) {
    const { standings } = await getStandingsForSeason(season.id);
    rows = standings.slice(0, 8).map((s, i) => ({
      pos: i + 1,
      name: s.clubName,
      pts: s.points,
    }));
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(145deg, #050a05 0%, #0f1a0f 50%, #051005 100%)",
          color: "#e8f0e8",
          padding: 48,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#22c55e",
            }}
          />
          <span style={{ fontSize: 22, color: "#22c55e", letterSpacing: 4 }}>
            KICKOFF
          </span>
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>
          {org?.name ?? "Лига"}
        </h1>
        <p style={{ fontSize: 22, color: "#8a9a8a", marginBottom: 32 }}>
          {season?.name ?? "Турнирная таблица"}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          {rows.length === 0 ? (
            <p style={{ fontSize: 24, color: "#6a7a6a" }}>Таблица скоро появится</p>
          ) : (
            rows.map((r) => (
              <div
                key={r.pos}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 12,
                  padding: "12px 20px",
                  fontSize: 26,
                }}
              >
                <span style={{ display: "flex", gap: 16 }}>
                  <span style={{ color: "#22c55e", fontWeight: 700, width: 36 }}>
                    {r.pos}
                  </span>
                  <span style={{ fontWeight: 600 }}>{r.name}</span>
                </span>
                <span style={{ fontWeight: 800 }}>{r.pts} очк</span>
              </div>
            ))
          )}
        </div>
        <p style={{ fontSize: 18, color: "#5a6a5a", marginTop: 24 }}>
          kickoff.app · live · embed
        </p>
      </div>
    ),
    { ...size },
  );
}
