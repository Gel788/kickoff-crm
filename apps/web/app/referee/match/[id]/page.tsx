import { RefereeConsole } from "@/components/referee/referee-console";
import { ensureFixtureChecklist } from "@/lib/actions-match";
import { getFixtureDetail } from "@/lib/queries";
import { SquadStatus } from "@prisma/client";
import { notFound } from "next/navigation";

export default async function RefereeMatchPage({
  params,
}: {
  params: { id: string };
}) {
  const fixture = await getFixtureDetail(params.id);
  if (!fixture) notFound();

  await ensureFixtureChecklist(fixture.id);

  const mapSquad = (clubId: string, clubName: string) => {
    const squad = fixture.squads.find((s) => s.clubId === clubId);
    return {
      id: clubId,
      name: clubName,
      players:
        squad?.lines.map((l) => ({
          id: l.registration.player.id,
          regId: l.registrationId,
          name: `${l.registration.player.firstName} ${l.registration.player.lastName}`,
        })) ?? [],
    };
  };

  const homeSquad = fixture.squads.find((s) => s.clubId === fixture.homeClubId);
  const awaySquad = fixture.squads.find((s) => s.clubId === fixture.awayClubId);
  const submitted = (s: typeof homeSquad) =>
    s?.status === SquadStatus.SUBMITTED ||
    s?.status === SquadStatus.APPROVED ||
    s?.status === SquadStatus.LOCKED;

  return (
    <>
      <RefereeConsole
        fixtureId={fixture.id}
        status={fixture.status}
        home={mapSquad(fixture.homeClubId, fixture.homeClub.shortName)}
        away={mapSquad(fixture.awayClubId, fixture.awayClub.shortName)}
        homeScore={fixture.homeScore}
        awayScore={fixture.awayScore}
        matchPhase={fixture.matchPhase}
        kickoffAt={fixture.kickoffAt}
        halftimeAt={fixture.halftimeAt}
        secondHalfAt={fixture.secondHalfAt}
        fullTimeAt={fixture.fullTimeAt}
        checklist={fixture.checklist}
        homeSubmitted={submitted(homeSquad)}
        awaySubmitted={submitted(awaySquad)}
      />
    </>
  );
}
