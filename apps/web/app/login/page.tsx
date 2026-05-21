import { Button } from "@/components/kickoff/button";
import { FlashBanner } from "@/components/kickoff/flash-banner";
import { Logo } from "@/components/kickoff/logo";
import { loginAction } from "@/lib/actions";
import Link from "next/link";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; flash?: string };
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 grid-pitch gradient-hero" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div>
            <p className="font-display text-4xl font-bold leading-tight">
              Операционная
              <br />
              <span className="text-accent">система лиги</span>
            </p>
            <p className="mt-4 max-w-sm text-muted">
              Демо: operator@kickoff.app / demo123
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center bg-elevated/30 px-8 py-12 backdrop-blur-sm lg:bg-transparent">
        <div className="mx-auto w-full max-w-sm rounded-2xl border border-border/60 bg-elevated/80 p-8 shadow-card backdrop-blur-xl lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-2xl font-bold">Вход в лигу</h1>
          <div className="mt-4">
            <FlashBanner flash={searchParams.flash} />
          </div>
          <form action={loginAction} className="mt-8 space-y-4">
            <div>
              <label className="kickoff-label">Email</label>
              <input
                name="email"
                type="email"
                required
                defaultValue="operator@kickoff.app"
                className="kickoff-input"
              />
            </div>
            <div>
              <label className="kickoff-label">Пароль</label>
              <input
                name="password"
                type="password"
                required
                defaultValue="demo123"
                className="kickoff-input"
              />
            </div>
            {searchParams.error === "1" && (
              <p className="text-sm text-danger">Неверный email или пароль</p>
            )}
            <Button type="submit" className="w-full" size="lg">
              Войти
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            <Link href="/reset-password" className="text-accent hover:underline">
              Забыли пароль?
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-muted">
            referee@kickoff.app · coach@kickoff.app — тот же пароль
          </p>
          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/" className="text-accent hover:underline">
              ← На главную
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
