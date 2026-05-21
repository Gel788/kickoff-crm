import { RefereeSlot } from "@prisma/client";

export const REFEREE_SLOT_ORDER: RefereeSlot[] = [
  "CHIEF",
  "ASSISTANT_1",
  "ASSISTANT_2",
  "FOURTH",
];

export const REFEREE_SLOT_LABELS: Record<RefereeSlot, string> = {
  CHIEF: "Главный судья",
  ASSISTANT_1: "Первый помощник",
  ASSISTANT_2: "Второй помощник",
  FOURTH: "Резервный (4-й)",
};

export type RefereeAssignmentWithUser = {
  slot: RefereeSlot;
  user: { id: string; name: string | null; email: string };
};

export function chiefAssignment<T extends RefereeAssignmentWithUser>(
  assignments: T[],
): T | undefined {
  return assignments.find((a) => a.slot === "CHIEF");
}
