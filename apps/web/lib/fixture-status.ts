import { FixtureStatus } from "@prisma/client";
import { MatchStatus } from "@/components/kickoff/badge";

export function fixtureStatusToBadge(status: FixtureStatus): MatchStatus {
  const map: Partial<Record<FixtureStatus, MatchStatus>> = {
    SCHEDULED: "scheduled",
    SQUADS_OPEN: "squads_open",
    SQUADS_SUBMITTED: "squads_open",
    SQUADS_APPROVED: "squads_open",
    SQUADS_LOCKED: "squads_open",
    LIVE: "live",
    FINISHED: "review",
    PROTOCOL_REVIEW: "review",
    CLOSED: "closed",
    DISPUTED: "review",
  };
  return map[status] ?? "scheduled";
}

export const FIXTURE_STATUS_LABELS: Record<FixtureStatus, string> = {
  SCHEDULED: "Запланирован",
  SQUADS_OPEN: "Заявки открыты",
  SQUADS_SUBMITTED: "Заявки поданы",
  SQUADS_APPROVED: "Заявки утверждены",
  SQUADS_LOCKED: "Заявки закрыты",
  LIVE: "Идёт матч",
  FINISHED: "Завершён",
  PROTOCOL_REVIEW: "Проверка протокола",
  CLOSED: "Закрыт",
  DISPUTED: "Спор",
};
