"use client";

import { Logo } from "@/components/kickoff/logo";
import { Button } from "@/components/kickoff/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.08] bg-[#06080a]/90 shadow-lg shadow-black/20 backdrop-blur-2xl"
          : "bg-gradient-to-b from-base/80 to-transparent backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="#matchday" className="transition-colors hover:text-white">
            Матчдень
          </a>
          <a href="#demo-data" className="transition-colors hover:text-white">
            Демо-лига
          </a>
          <a href="#opensource" className="transition-colors hover:text-white">
            Open
          </a>
          <Link href="/o/demo" className="transition-colors hover:text-white">
            Публичная лига
          </Link>
          <Link href="/live/demo" className="transition-colors hover:text-white">
            Live
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Вход
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm">Начать</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
