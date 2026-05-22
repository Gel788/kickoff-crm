"use client";

import { Button } from "@/components/kickoff/button";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "Live", label: "протокол с поля" },
  { value: "Lock", label: "заявки до свистка" },
  { value: "PDF", label: "официальный протокол" },
  { value: "API", label: "табло на сайт лиги" },
];

export function LandingHeroContent() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.1, delayChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 32 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div
        variants={item}
        className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 backdrop-blur-md"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
          Matchday OS
        </span>
      </motion.div>

      <motion.h1
        variants={item}
        className="font-display text-[clamp(2.75rem,8vw,5.5rem)] font-extrabold leading-[0.95] tracking-tight"
      >
        <span className="block text-white">Матчдень.</span>
        <motion.span
          className="mt-1 block bg-gradient-to-r from-accent via-emerald-300 to-white bg-clip-text text-transparent"
          animate={
            reduce
              ? undefined
              : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% auto" }}
        >
          В одном ритме.
        </motion.span>
      </motion.h1>

      <motion.p
        variants={item}
        className="mt-8 max-w-lg text-lg leading-relaxed text-muted md:text-xl"
      >
        Заявки, live-протокол, таблица и PDF — синхронно для лиги, клубов и судей.
        Как трансляция, только для всего тура.
      </motion.p>

      <motion.div variants={item} className="mt-12 flex flex-wrap items-center gap-4">
        <Link href="/login">
          <Button size="lg" className="h-14 px-8 text-base shadow-glow">
            Открыть демо
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/live/demo">
          <Button
            variant="outline"
            size="lg"
            className="h-14 gap-2 border-white/15 px-8 text-base"
          >
            <Play className="h-4 w-4 fill-current" />
            Live-табло
          </Button>
        </Link>
      </motion.div>

      <motion.div
        variants={item}
        className="mt-20 grid grid-cols-2 gap-8 border-t border-white/5 pt-12 md:grid-cols-4"
      >
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-display text-2xl font-bold text-white md:text-3xl">
              {s.value}
            </p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted">
              {s.label}
            </p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
