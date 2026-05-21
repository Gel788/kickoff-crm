import { prisma } from "@/lib/db";
import type { PdfDrawer } from "@/lib/pdf-builder";

export type LeagueBranding = {
  orgName: string;
  slug: string;
  logoUrl: string | null;
};

export async function getLeagueBrandingForFixture(
  fixtureId: string,
): Promise<LeagueBranding | null> {
  const fixture = await prisma.fixture.findUnique({
    where: { id: fixtureId },
    include: {
      round: {
        include: {
          division: {
            include: {
              competition: {
                include: { season: { include: { organization: true } } },
              },
            },
          },
        },
      },
    },
  });
  const org = fixture?.round.division.competition.season.organization;
  if (!org) return null;
  return { orgName: org.name, slug: org.slug, logoUrl: org.logoUrl };
}

export function drawPdfHeader(drawer: PdfDrawer, branding: LeagueBranding) {
  drawer.draw(branding.orgName, 18);
  drawer.draw("KICKOFF — операционная платформа лиги", 9);
  if (branding.logoUrl) {
    drawer.draw(`Брендинг: ${branding.logoUrl}`, 8);
  }
  drawer.y -= 6;
}
