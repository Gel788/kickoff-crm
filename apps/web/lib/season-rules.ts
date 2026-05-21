import { prisma } from "@/lib/db";

export type PointsConfig = {
  win: number;
  draw: number;
  loss: number;
};

export function pointsFromRegulationRules(rules: unknown): PointsConfig {
  const r = rules as Record<string, unknown> | null;
  return {
    win: Number(r?.pointsWin ?? 3),
    draw: Number(r?.pointsDraw ?? 1),
    loss: Number(r?.pointsLoss ?? 0),
  };
}

export async function getSeasonPointsConfig(seasonId: string): Promise<PointsConfig> {
  const reg = await prisma.seasonRegulation.findUnique({
    where: { seasonId },
    select: { rules: true },
  });
  return pointsFromRegulationRules(reg?.rules);
}
