import { Button } from "@/components/kickoff/button";
import { Logo } from "@/components/kickoff/logo";
import { inputClass, labelClass } from "@/components/kickoff/ui";
import { verifyTwoFactorLogin } from "@/lib/actions-2fa";

export default function TwoFactorLoginPage({
  searchParams,
}: {
  searchParams: { token?: string; error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-elevated p-8">
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-bold">Код 2FA</h1>
        <form action={verifyTwoFactorLogin} className="mt-6 space-y-4">
          <input type="hidden" name="token" value={searchParams.token ?? ""} />
          <div>
            <label className={labelClass}>6 цифр</label>
            <input name="code" required className={inputClass} autoComplete="one-time-code" />
          </div>
          {searchParams.error === "1" && (
            <p className="text-sm text-danger">Неверный код</p>
          )}
          <Button type="submit" className="w-full" size="lg">
            Продолжить
          </Button>
        </form>
      </div>
    </div>
  );
}
