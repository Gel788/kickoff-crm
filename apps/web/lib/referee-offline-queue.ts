"use client";

export type QueuedRefereeEvent = {
  id: string;
  fixtureId: string;
  type: string;
  minute: number;
  teamClubId: string;
  registrationId?: string;
  secondaryRegId?: string;
  createdAt: number;
};

const KEY = "kickoff_referee_queue";

function readAll(): QueuedRefereeEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as QueuedRefereeEvent[];
  } catch {
    return [];
  }
}

function writeAll(items: QueuedRefereeEvent[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getPendingForFixture(fixtureId: string) {
  return readAll().filter((e) => e.fixtureId === fixtureId);
}

export function enqueueRefereeEvent(
  fixtureId: string,
  ev: Omit<QueuedRefereeEvent, "id" | "fixtureId" | "createdAt">,
) {
  const item: QueuedRefereeEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fixtureId,
    createdAt: Date.now(),
    ...ev,
  };
  writeAll([...readAll(), item]);
  return item;
}

export function removeQueuedEvent(id: string) {
  writeAll(readAll().filter((e) => e.id !== id));
}

export function clearFixtureQueue(fixtureId: string) {
  writeAll(readAll().filter((e) => e.fixtureId !== fixtureId));
}
