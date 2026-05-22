import { AuthPageShell } from "@/components/kickoff/auth-page-shell";
import { Button } from "@/components/kickoff/button";
import { inputClass, labelClass } from "@/components/kickoff/ui";
import { requestPasswordReset, resetPasswordWithToken } from "@/lib/actions-auth-reset";
import Link from "next/link";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const hasToken = Boolean(searchParams.token);

  return (
    <AuthPageShell
      title={hasToken ? "Новый пароль" : "Сброс пароля"}
      subtitle={
        hasToken
          ? "Задайте новый пароль для входа"
          : "Ссылка придёт на email (в dev — в консоль сервера)"
      }
    >
      {hasToken ? (
        <form action={resetPasswordWithToken} className="space-y-4">
          <input type="hidden" name="token" value={searchParams.token} />
          <div>
            <label className={labelClass}>Пароль</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className={inputClass}
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            Сохранить
          </Button>
        </form>
      ) : (
        <form action={requestPasswordReset} className="space-y-4">
          <div>
            <label className={labelClass}>Email</label>
            <input name="email" type="email" required className={inputClass} />
          </div>
          <Button type="submit" className="w-full" size="lg">
            Отправить ссылку
          </Button>
        </form>
      )}
      <Link
        href="/login"
        className="mt-6 block text-center text-sm text-accent hover:underline"
      >
        ← Вход
      </Link>
    </AuthPageShell>
  );
}
