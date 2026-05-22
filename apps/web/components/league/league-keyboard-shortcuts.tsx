"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SHORTCUTS = [
  { keys: "g → d", label: "Дашборд" },
  { keys: "g → c", label: "Календарь" },
  { keys: "g → t", label: "Таблица" },
  { keys: "g → l", label: "Лидерборд" },
  { keys: "g → p", label: "Игроки" },
  { keys: "g → u", label: "Пользователи" },
  { keys: "⌘K", label: "Быстрый поиск" },
  { keys: "?", label: "Эта подсказка" },
];

export function LeagueKeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    let seq: string[] = [];
    let timeout: ReturnType<typeof setTimeout>;

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (
        t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.tagName === "SELECT" ||
        t.isContentEditable
      ) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (key === "?") {
        e.preventDefault();
        setShowHelp((v) => !v);
        return;
      }

      seq.push(key);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        seq = [];
      }, 900);

      if (seq.length === 2) {
        const [a, b] = seq;
        let path: string | null = null;
        if (a === "g") {
          if (b === "d") path = "/league/dashboard";
          if (b === "c") path = "/league/calendar";
          if (b === "t") path = "/league/standings";
          if (b === "l") path = "/league/leaderboard";
          if (b === "p") path = "/league/players";
          if (b === "u") path = "/league/users";
        }
        if (path) {
          e.preventDefault();
          router.push(path);
        }
        seq = [];
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(timeout);
    };
  }, [router]);

  if (!showHelp) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-64 rounded-xl border border-border bg-elevated p-4 shadow-xl"
      role="dialog"
      aria-label="Горячие клавиши"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold">Горячие клавиши</span>
        <button
          type="button"
          className="text-xs text-muted hover:text-foreground"
          onClick={() => setShowHelp(false)}
        >
          Esc
        </button>
      </div>
      <ul className="space-y-1.5 text-xs text-muted">
        {SHORTCUTS.map((s) => (
          <li key={s.keys} className="flex justify-between gap-2">
            <kbd className="font-mono text-accent">{s.keys}</kbd>
            <span>{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
