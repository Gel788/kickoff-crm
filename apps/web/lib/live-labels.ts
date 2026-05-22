const PHASE_RU: Record<string, string> = {
  PRE_MATCH: "До начала",
  FIRST_HALF: "1-й тайм",
  HALFTIME: "Перерыв",
  SECOND_HALF: "2-й тайм",
  FULL_TIME: "Финальный свисток",
};

const STATUS_RU: Record<string, string> = {
  SCHEDULED: "Запланирован",
  SQUADS_OPEN: "Заявки",
  SQUADS_SUBMITTED: "Заявки поданы",
  SQUADS_APPROVED: "Заявки ОК",
  SQUADS_LOCKED: "Заявки закрыты",
  LIVE: "LIVE",
  FINISHED: "Завершён",
  PROTOCOL_REVIEW: "Протокол",
  CLOSED: "Закрыт",
  DISPUTED: "Спор",
};

export function livePhaseLabel(phase: string) {
  return PHASE_RU[phase] ?? phase;
}

export function liveStatusLabel(status: string) {
  return STATUS_RU[status] ?? status;
}

export function parseLiveScore(score: string) {
  const parts = score.split(/[:：]/).map((s) => s.trim());
  return {
    home: parts[0] ?? "0",
    away: parts[1] ?? "0",
  };
}
