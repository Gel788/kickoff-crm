"use client";

import { Button } from "@/components/kickoff/button";
import { loginAction } from "@/lib/actions";
import { requestMagicLinkAction } from "@/lib/actions-magic";
import { cn } from "@/lib/utils";
import { KeyRound, Link2, Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const DEMO_ACCOUNTS = [
  { label: "Лига", email: "operator@kickoff.app", hint: "оператор" },
  { label: "Клуб", email: "coach@kickoff.app", hint: "заявки" },
  { label: "Судья", email: "referee@kickoff.app", hint: "протокол" },
  { label: "Опекун", email: "parent@kickoff.app", hint: "согласие" },
] as const;

const DEMO_PASSWORD = "demo123";

export function LoginPanel({
  error,
  magic,
}: {
  error?: string;
  magic?: string;
}) {
  const [tab, setTab] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("operator@kickoff.app");
  const [password, setPassword] = useState(DEMO_PASSWORD);

  return (
    <div className="auth-card relative w-full max-w-md">
      <div className="pointer-events-none absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-accent/30 via-transparent to-info/20 opacity-60" />
      <div className="relative rounded-[1.3rem] border border-white/[0.08] bg-[#0c1014]/95 p-8 shadow-2xl backdrop-blur-2xl sm:p-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
              Kickoff
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">
              Вход в систему
            </h1>
            <p className="mt-1 text-sm text-muted">
              Лига, клуб, судья или опекун — один портал
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
            <Shield className="h-5 w-5 text-accent" />
          </div>
        </div>

        <div className="mb-6 flex rounded-xl border border-border/80 bg-base/60 p-1">
          <button
            type="button"
            onClick={() => setTab("password")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all",
              tab === "password"
                ? "bg-accent-dim text-accent shadow-sm"
                : "text-muted hover:text-white",
            )}
          >
            <KeyRound className="h-4 w-4" />
            Пароль
          </button>
          <button
            type="button"
            onClick={() => setTab("magic")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all",
              tab === "magic"
                ? "bg-accent-dim text-accent shadow-sm"
                : "text-muted hover:text-white",
            )}
          >
            <Link2 className="h-4 w-4" />
            Ссылка
          </button>
        </div>

        {tab === "password" && (
          <form action={loginAction} className="space-y-4">
            <div>
              <label className="kickoff-label">Email</label>
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="kickoff-input"
              />
            </div>
            <div>
              <label className="kickoff-label">Пароль</label>
              <input
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="kickoff-input"
              />
            </div>
            {error === "1" && (
              <p className="text-sm text-danger">Неверный email или пароль</p>
            )}
            <Button type="submit" className="w-full" size="lg">
              Войти в кабинет
            </Button>
          </form>
        )}

        {tab === "magic" && (
          <div className="space-y-4">
            {magic === "sent" && (
              <p className="rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent">
                Если аккаунт есть — проверьте почту (ссылка 15 мин)
              </p>
            )}
            {magic === "invalid" && (
              <p className="rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
                Ссылка устарела или неверна
              </p>
            )}
            <form action={requestMagicLinkAction} className="space-y-4">
              <div>
                <label className="kickoff-label">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="email@club.ru"
                  className="kickoff-input"
                />
              </div>
              <Button type="submit" variant="outline" className="w-full" size="lg">
                Отправить ссылку для входа
              </Button>
            </form>
            <p className="text-center text-xs text-muted">
              Нужен RESEND_API_KEY в production
            </p>
          </div>
        )}

        <div className="mt-8">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted">
            Демо-аккаунты · пароль {DEMO_PASSWORD}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => {
                  setEmail(d.email);
                  setPassword(DEMO_PASSWORD);
                  setTab("password");
                }}
                className="rounded-xl border border-border/70 bg-base/50 px-3 py-2.5 text-left transition-all hover:border-accent/30 hover:bg-accent/5"
              >
                <span className="block text-sm font-medium">{d.label}</span>
                <span className="block font-mono text-[10px] text-muted">{d.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6 text-sm">
          <Link href="/reset-password" className="text-accent hover:underline">
            Забыли пароль?
          </Link>
          <Link href="/" className="text-muted hover:text-white">
            ← Главная
          </Link>
        </div>
      </div>
    </div>
  );
}
