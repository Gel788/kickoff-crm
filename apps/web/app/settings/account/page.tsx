import { Button } from "@/components/kickoff/button";
import { FlashBanner } from "@/components/kickoff/flash-banner";
import { PageHeader } from "@/components/kickoff/page-header";
import { Card, inputClass, labelClass } from "@/components/kickoff/ui";
import {
  beginTwoFactorSetup,
  confirmTwoFactorSetup,
  disableTwoFactor,
} from "@/lib/actions-2fa";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Secret, TOTP } from "otpauth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AccountSettingsPage({
  searchParams,
}: {
  searchParams: { flash?: string; setup?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/login");

  const setupUri =
    searchParams.setup === "1" && user.totpSecret && !user.twoFactorEnabled
      ? new TOTP({
          issuer: "Kickoff",
          label: session.email,
          secret: Secret.fromBase32(user.totpSecret),
          algorithm: "SHA1",
          digits: 6,
          period: 30,
        }).toString()
      : null;

  return (
    <div className="min-h-screen bg-base p-8">
      <PageHeader title="Аккаунт" description={session.email} />
      <FlashBanner flash={searchParams.flash} />

      <Card className="max-w-md">
        <h3 className="font-display font-bold">Двухфакторная аутентификация</h3>
        <p className="mt-2 text-sm text-muted">
          Статус: {user.twoFactorEnabled ? "включена" : "выключена"}
        </p>

        {!user.twoFactorEnabled && !user.totpSecret && (
          <form action={beginTwoFactorSetup} className="mt-4">
            <Button type="submit" size="sm">
              Настроить 2FA
            </Button>
          </form>
        )}

        {!user.twoFactorEnabled && user.totpSecret && (
          <form action={confirmTwoFactorSetup} className="mt-4 space-y-3">
            {setupUri && (
              <p className="text-xs text-muted break-all">
                <code>{setupUri}</code>
              </p>
            )}
            <div>
              <label className={labelClass}>Код из приложения</label>
              <input name="code" required className={inputClass} placeholder="123456" />
            </div>
            <Button type="submit" size="sm">
              Подтвердить 2FA
            </Button>
          </form>
        )}

        {user.twoFactorEnabled && (
          <form action={disableTwoFactor} className="mt-4 space-y-3">
            <input name="code" required className={inputClass} placeholder="Код для отключения" />
            <Button type="submit" size="sm" variant="outline">
              Отключить 2FA
            </Button>
          </form>
        )}
      </Card>

      <Link href="/league/dashboard" className="mt-6 inline-block text-sm text-accent hover:underline">
        ← В кабинет
      </Link>
    </div>
  );
}
