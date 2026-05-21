import { Button } from "@/components/kickoff/button";
import { openDispute, resolveDispute, signProtocol } from "@/lib/actions-integrity";

export function IntegrityPanel({
  fixtureId,
  homeClubId,
  signatures,
  disputes,
  canLeague,
}: {
  fixtureId: string;
  homeClubId: string;
  signatures: {
    role: string;
    refused: boolean;
    refuseReason: string | null;
    user: { name: string };
  }[];
  disputes: {
    id: string;
    reason: string;
    status: string;
    club: { shortName: string };
    resolution: string | null;
  }[];
  canLeague: boolean;
}) {
  const sig = (role: string) => signatures.find((s) => s.role === role);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-elevated p-6">
        <h3 className="font-display font-bold">Подписи протокола</h3>
        <ul className="mt-4 space-y-2 text-sm">
          {["REFEREE", "DELEGATE_HOME", "DELEGATE_AWAY"].map((role) => {
            const s = sig(role);
            const labels: Record<string, string> = {
              REFEREE: "Судья",
              DELEGATE_HOME: "Делегат хозяев",
              DELEGATE_AWAY: "Делегат гостей",
            };
            return (
              <li key={role} className="flex justify-between">
                <span className="text-muted">{labels[role]}</span>
                <span>
                  {s
                    ? s.refused
                      ? `Отказ: ${s.refuseReason}`
                      : `✓ ${s.user.name}`
                    : "—"}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <form
            action={async () => {
              "use server";
              await signProtocol(fixtureId, "REFEREE");
            }}
          >
            <Button type="submit" size="sm" variant="outline">
              Подпись судьи
            </Button>
          </form>
          <form
            action={async () => {
              "use server";
              await signProtocol(fixtureId, "DELEGATE_HOME");
            }}
          >
            <Button type="submit" size="sm" variant="ghost">
              Делегат хозяев
            </Button>
          </form>
          <form
            action={async () => {
              "use server";
              await signProtocol(fixtureId, "DELEGATE_AWAY");
            }}
          >
            <Button type="submit" size="sm" variant="ghost">
              Делегат гостей
            </Button>
          </form>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-elevated p-6">
        <h3 className="font-display font-bold">Споры</h3>
        {disputes.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Споров нет</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {disputes.map((d) => (
              <li key={d.id} className="rounded-lg border border-border p-4 text-sm">
                <p className="font-medium">{d.club.shortName}</p>
                <p className="text-muted">{d.reason}</p>
                <p className="mt-1 font-mono text-xs">{d.status}</p>
                {canLeague && d.status === "OPEN" && (
                  <div className="mt-3 flex gap-2">
                    <form
                      action={async () => {
                        "use server";
                        await resolveDispute(d.id, "Принято лигой", true);
                      }}
                    >
                      <Button type="submit" size="sm">
                        Принять
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await resolveDispute(d.id, "Отклонено", false);
                      }}
                    >
                      <Button type="submit" size="sm" variant="danger">
                        Отклонить
                      </Button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        <form
          className="mt-4 space-y-2"
          action={async (fd) => {
            "use server";
            await openDispute(
              fixtureId,
              homeClubId,
              String(fd.get("reason") ?? ""),
            );
          }}
        >
          <textarea
            name="reason"
            placeholder="Причина спора (клуб)"
            className="w-full rounded-lg border border-border bg-base px-3 py-2 text-sm"
            rows={2}
          />
          <Button type="submit" size="sm" variant="outline">
            Открыть спор
          </Button>
        </form>
      </div>
    </div>
  );
}
