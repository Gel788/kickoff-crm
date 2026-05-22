import { prisma } from "@/lib/db";
import Fuse from "fuse.js";

export type SimilarPlayerHit = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  clubLabel: string;
  score?: number;
};

export async function findSimilarPlayers(
  organizationId: string,
  firstName: string,
  lastName: string,
  dateOfBirth: Date,
): Promise<SimilarPlayerHit[]> {
  const exact = await prisma.player.findFirst({
    where: {
      organizationId,
      lastName,
      firstName,
      dateOfBirth,
    },
  });

  const candidates = await prisma.player.findMany({
    where: { organizationId },
    include: {
      registrations: {
        take: 1,
        include: { club: true },
      },
    },
    take: 500,
  });

  const fuse = new Fuse(candidates, {
    keys: [
      { name: "firstName", weight: 0.4 },
      { name: "lastName", weight: 0.5 },
    ],
    threshold: 0.35,
    includeScore: true,
  });

  const query = `${firstName} ${lastName}`.trim();
  const hits = fuse.search(query);

  const twoDays = 2 * 24 * 60 * 60 * 1000;

  return hits
    .filter((h) => {
      if (exact && h.item.id === exact.id) return false;
      const p = h.item;
      const sameDob = p.dateOfBirth.getTime() === dateOfBirth.getTime();
      const closeDob =
        Math.abs(p.dateOfBirth.getTime() - dateOfBirth.getTime()) <= twoDays;
      const sameLast =
        p.lastName.toLowerCase() === lastName.trim().toLowerCase();
      return (h.score ?? 1) < 0.4 || (sameLast && closeDob) || sameDob;
    })
    .slice(0, 5)
    .map((h) => ({
      id: h.item.id,
      firstName: h.item.firstName,
      lastName: h.item.lastName,
      dateOfBirth: h.item.dateOfBirth,
      clubLabel: h.item.registrations[0]?.club.shortName ?? "—",
      score: h.score,
    }));
}
