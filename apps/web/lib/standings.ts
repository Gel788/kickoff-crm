import type { PointsConfig } from "@/lib/season-rules";
import { Fixture, FixtureStatus } from "@prisma/client";

const DEFAULT_POINTS: PointsConfig = { win: 3, draw: 1, loss: 0 };

export type StandingRow = {
  clubId: string;
  clubName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

export function computeStandings(
  fixtures: Pick<Fixture, "homeClubId" | "awayClubId" | "homeScore" | "awayScore" | "status">[],
  clubNames: Map<string, string>,
  points: PointsConfig = DEFAULT_POINTS,
): StandingRow[] {
  const map = new Map<string, StandingRow>();

  const ensure = (clubId: string) => {
    if (!map.has(clubId)) {
      map.set(clubId, {
        clubId,
        clubName: clubNames.get(clubId) ?? clubId,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
      });
    }
    return map.get(clubId)!;
  };

  for (const f of fixtures) {
    if (f.status !== FixtureStatus.CLOSED) continue;
    const home = ensure(f.homeClubId);
    const away = ensure(f.awayClubId);
    home.played++;
    away.played++;
    home.gf += f.homeScore;
    home.ga += f.awayScore;
    away.gf += f.awayScore;
    away.ga += f.homeScore;

    if (f.homeScore > f.awayScore) {
      home.won++;
      home.points += points.win;
      away.lost++;
      away.points += points.loss;
    } else if (f.homeScore < f.awayScore) {
      away.won++;
      away.points += points.win;
      home.lost++;
      home.points += points.loss;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += points.draw;
      away.points += points.draw;
    }
  }

  return Array.from(map.values())
    .map((r) => ({ ...r, gd: r.gf - r.ga }))
    .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
}
