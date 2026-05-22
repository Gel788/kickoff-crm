import ical, { ICalCalendarMethod } from "ical-generator";

type IcalFixture = {
  id: string;
  scheduledAt: Date;
  homeName: string;
  awayName: string;
  venue: string | null;
  status: string;
};

export function buildFixturesIcal(
  fixtures: IcalFixture[],
  calendarName: string,
  appUrl: string,
) {
  const cal = ical({
    name: calendarName,
    method: ICalCalendarMethod.PUBLISH,
    prodId: { company: "Kickoff", product: "League Calendar" },
  });

  for (const f of fixtures) {
    const end = new Date(f.scheduledAt.getTime() + 2 * 60 * 60 * 1000);
    cal.createEvent({
      id: `fixture-${f.id}@kickoff`,
      start: f.scheduledAt,
      end,
      summary: `${f.homeName} — ${f.awayName}`,
      description: `Статус: ${f.status}`,
      location: f.venue ?? undefined,
      url: `${appUrl}/league/fixtures/${f.id}`,
    });
  }

  return cal.toString();
}
