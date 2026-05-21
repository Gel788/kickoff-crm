import { Button } from "@/components/kickoff/button";
import { PageHeader } from "@/components/kickoff/page-header";
import { signProtocol, refuseSignature } from "@/lib/actions-integrity";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ClubDelegatePage() {
  const session = await getSession();
  if (!session?.clubId) redirect("/login");

  const fixtures = await prisma.fixture.findMany({
    where: {
      OR: [{ homeClubId: session.clubId }, { awayClubId: session.clubId }],
      status: { in: ["PROTOCOL_REVIEW", "FINISHED", "LIVE"] },
    },
    include: {
      homeClub: true,
      awayClub: true,
      signatures: true,
    },
    orderBy: { scheduledAt: "desc" },
    take: 10,
  });

  const roleForClub = (homeId: string) =>
    homeId === session.clubId ? "DELEGATE_HOME" : "DELEGATE_AWAY";

  return (
    <>
      <PageHeader title="Подпись протокола" description="Делегат клуба" />

      <div className="space-y-6">
        {fixtures.map((f) => {
          const role = roleForClub(f.homeClubId) as "DELEGATE_HOME" | "DELEGATE_AWAY";
          const signed = f.signatures.find((s) => s.role === role);
          return (
            <div
              key={f.id}
              className="rounded-xl border border-border bg-elevated p-6"
            >
              <p className="font-medium">
                {f.homeClub.shortName} — {f.awayClub.shortName}
              </p>
              <p className="text-sm text-muted">
                {f.scheduledAt.toLocaleString("ru-RU")} · {f.homeScore}:{f.awayScore}
              </p>
              {signed ? (
                <p className="mt-2 text-sm text-accent">Подписано</p>
              ) : (
                <div className="mt-4 flex flex-col gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await signProtocol(f.id, role);
                    }}
                  >
                    <Button type="submit" className="w-full">
                      Подписать протокол
                    </Button>
                  </form>
                  <form
                    action={async (fd) => {
                      "use server";
                      await refuseSignature(
                        f.id,
                        role,
                        String(fd.get("reason") ?? "Не согласен"),
                      );
                    }}
                    className="flex gap-2"
                  >
                    <input
                      name="reason"
                      placeholder="Причина отказа"
                      className="flex-1 rounded-lg border border-border bg-base px-2 py-2 text-sm"
                    />
                    <Button type="submit" variant="danger" size="sm">
                      Отказ
                    </Button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
