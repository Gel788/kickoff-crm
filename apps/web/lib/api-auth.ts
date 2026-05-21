import { createHash } from "crypto";
import { prisma } from "@/lib/db";

export function hashApiKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export async function resolveOrgByApiKey(
  authHeader: string | null,
): Promise<{ organizationId: string; slug: string } | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const key = authHeader.slice(7).trim();
  if (!key.startsWith("ko_")) return null;
  const prefix = key.slice(0, 12);
  const hash = hashApiKey(key);

  const record = await prisma.apiKey.findFirst({
    where: { keyPrefix: prefix, keyHash: hash, active: true },
    include: { organization: true },
  });
  if (!record) return null;

  await prisma.apiKey.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    organizationId: record.organizationId,
    slug: record.organization.slug,
  };
}
