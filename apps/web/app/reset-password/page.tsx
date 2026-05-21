import { Button } from "@/components/kickoff/button";
import { Logo } from "@/components/kickoff/logo";
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
    <div className="flex min-h-screen items-center justify-center bg-base px-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-elevated p-8">
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-bold">
          {hasToken ? "Новый пароль" : "Сброс пароля"}
        </h1>
        {hasToken ? (
          <form action={resetPasswordWithToken} className="mt-6 space-y-4">
            <input type="hidden" name="token" value={searchParams.token} />
            <div>
              <label className={labelClass}>Пароль</label>
              <input name="password" type="password" required minLength={6} className={inputClass} />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Сохранить
            </Button>
          </form>
        ) : (
          <form action={requestPasswordReset} className="mt-6 space-y-4">
            <div>
              <label className={labelClass}>Email</label>
              <input name="email" type="email" required className={inputClass} />
            </div>
            <p className="text-xs text-muted">
              В dev-режиме ссылка выводится в консоль сервера.
            </p>
            <Button type="submit" className="w-full" size="lg">
              Отправить ссылку
            </Button>
          </form>
        )}
        <Link href="/login" className="mt-6 block text-center text-sm text-accent hover:underline">
          ← Вход
        </Link>
      </div>
    </div>
  );
}
