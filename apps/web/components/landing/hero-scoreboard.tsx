"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const events = [
  { min: "12'", type: "Гол", team: "DIN", accent: true },
  { min: "34'", type: "Гол", team: "SPA", accent: true },
  { min: "55'", type: "ЖК", team: "SPA", warn: true },
  { min: "67'", type: "Гол", team: "DIN", accent: true },
];

export function HeroScoreboard() {
  const reduce = useReducedMotion();
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [goalPulse, setGoalPulse] = useState(false);
  const [visible, setVisible] = useState(0);
  const [phase, setPhase] = useState("2-й тайм");
  const [clock, setClock] = useState("67:12");

  useEffect(() => {
    const t = setInterval(() => {
      setVisible((v) => {
        const next = v < events.length ? v + 1 : 0;
        if (next === 1) {
          setScore({ home: 1, away: 0 });
          setGoalPulse(true);
        }
        if (next === 2) {
          setScore({ home: 1, away: 1 });
          setGoalPulse(true);
        }
        if (next === 4) {
          setScore({ home: 2, away: 1 });
          setGoalPulse(true);
        }
        if (next === 0) setGoalPulse(false);
        if (next === 0) {
          setScore({ home: 0, away: 0 });
          setPhase("1-й тайм");
          setClock("00:00");
        }
        if (next === 3) {
          setPhase("2-й тайм");
          setClock("52:04");
        }
        if (next === 4) setClock("67:12");
        return next;
      });
    }, 2400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!goalPulse) return;
    const t = setTimeout(() => setGoalPulse(false), 600);
    return () => clearTimeout(t);
  }, [goalPulse]);

  return (
    <div className="landing-scoreboard relative">
      <div className="absolute -inset-4 rounded-[2rem] bg-accent/20 blur-3xl opacity-40" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0a0e12]/90 shadow-[0_0_80px_rgba(0,230,118,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,230,118,0.06)_0%,transparent_40%,transparent_60%,rgba(0,0,0,0.4)_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.5)_2px,rgba(255,255,255,0.5)_3px)]" />

        <div className="relative border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse-live rounded-full bg-danger shadow-[0_0_12px_#ff4757]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-danger">
                Live
              </span>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted">
              {phase}
            </span>
          </div>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted/80">
            Тур 12 · Центральный
          </p>
        </div>

        <div className="relative px-6 py-8">
          <div className="flex items-end justify-between gap-6">
            <div className="flex-1 text-center">
              <p className="font-mono text-xs font-semibold tracking-widest text-muted">
                DIN
              </p>
              <motion.p
                key={`h-${score.home}`}
                className="mt-2 font-mono text-[5.5rem] font-bold leading-none tracking-tighter text-white tabular-nums"
                initial={reduce ? false : { scale: 1.2, color: "#00e676" }}
                animate={{ scale: 1, color: "#ffffff" }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
              >
                {score.home}
              </motion.p>
            </div>
            <div className="pb-6 text-center">
              <p className="font-mono text-3xl font-light text-white/20">:</p>
              <p className="mt-2 font-mono text-sm text-accent">{clock}</p>
            </div>
            <div className="flex-1 text-center">
              <p className="font-mono text-xs font-semibold tracking-widest text-muted">
                SPA
              </p>
              <motion.p
                key={`a-${score.away}`}
                className="mt-2 font-mono text-[5.5rem] font-bold leading-none tracking-tighter text-white tabular-nums"
                initial={reduce ? false : { scale: 1.2, color: "#00e676" }}
                animate={{ scale: 1, color: "#ffffff" }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
              >
                {score.away}
              </motion.p>
            </div>
          </div>
        </div>

        <ul className="relative max-h-[140px] space-y-0 overflow-hidden border-t border-white/5">
          {events.slice(0, visible).map((e, i) => (
            <li
              key={i}
              className="flex animate-[fadeIn_0.5s_ease-out] items-center justify-between border-b border-white/[0.03] px-6 py-3 text-sm last:border-0"
            >
              <span className="font-mono text-xs text-accent">{e.min}</span>
              <span
                className={
                  e.warn ? "font-medium text-warning" : e.accent ? "font-medium" : ""
                }
              >
                {e.type}
              </span>
              <span className="font-mono text-xs text-muted">{e.team}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
