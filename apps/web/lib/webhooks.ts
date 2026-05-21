import { prisma } from "@/lib/db";

export async function dispatchWebhooks(
  organizationId: string,
  event: string,
  payload: Record<string, unknown>,
) {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { organizationId, active: true },
  });

  for (const ep of endpoints) {
    const events = Array.isArray(ep.events)
      ? (ep.events as string[])
      : typeof ep.events === "string"
        ? JSON.parse(ep.events)
        : [];
    if (!events.includes(event) && !events.includes("*")) continue;

    try {
      await fetch(ep.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kickoff-Event": event,
          "X-Kickoff-Signature": ep.secret.slice(0, 8),
        },
        body: JSON.stringify({
          event,
          organizationId,
          payload,
          sentAt: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error("[webhook]", ep.url, e);
    }
  }
}
