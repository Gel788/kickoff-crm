import { prisma } from "@/lib/db";

export type SimilarPlayerHit = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  clubLabel: string;
};

export async function findSimilarPlayers(
  organizationId: string,
  firstName: string,
  lastName: string,
  dateOfBirth: Date,
): Promise<SimilarPlayerHit[]> {
  const candidates = await prisma.player.findMany({
    where: { organizationId, lastName },
    include: {
      registrations: {
        take: 1,
        include: { club: true },
      },
    },
  });

  const fn = firstName.trim().toLowerCase();
  const twoDays = 2 * 24 * 60 * 60 * 1000;

  return candidates
    .filter((p) => {
      const exact =
        p.firstName.toLowerCase() === fn &&
        p.dateOfBirth.getTime() === dateOfBirth.getTime();
      if (exact) return false;

      const prefixMatch =
        p.firstName.toLowerCase().startsWith(fn.slice(0, 3)) ||
        fn.startsWith(p.firstName.toLowerCase().slice(0, 3));
      const dobClose =
        Math.abs(p.dateOfBirth.getTime() - dateOfBirth.getTime()) <= twoDays;

      return prefixMatch && dobClose;
    })
    .map((p) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      dateOfBirth: p.dateOfBirth,
      clubLabel: p.registrations[0]?.club.shortName ?? "—",
    }));
}
