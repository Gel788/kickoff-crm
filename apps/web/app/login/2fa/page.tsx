import { AuthPageShell } from "@/components/kickoff/auth-page-shell";
import { Button } from "@/components/kickoff/button";
import { inputClass, labelClass } from "@/components/kickoff/ui";
import { verifyTwoFactorLogin } from "@/lib/actions-2fa";

export default function TwoFactorLoginPage({
  searchParams,
}: {
  searchParams: { token?: string; error?: string };
}) {
  return (
    <AuthPageShell
      title="Двухфакторный вход"
      subtitle="Введите 6 цифр из приложения-аутентификатора"
    >
      <form action={verifyTwoFactorLogin} className="space-y-4">
        <input type="hidden" name="token" value={searchParams.token ?? ""} />
        <div>
          <label className={labelClass}>Код</label>
          <input
            name="code"
            required
            className={inputClass}
            autoComplete="one-time-code"
            placeholder="000000"
          />
        </div>
        {searchParams.error === "1" && (
          <p className="text-sm text-danger">Неверный код</p>
        )}
        <Button type="submit" className="w-full" size="lg">
          Продолжить
        </Button>
      </form>
    </AuthPageShell>
  );
}
