"use client";

import { HeroScoreboard } from "@/components/landing/hero-scoreboard";
import { LandingLottieFootball } from "@/components/landing/landing-lottie-football";
import { motion, useReducedMotion } from "framer-motion";

export function LandingHeroVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="relative">
      <div className="absolute -left-8 -top-12 z-0 opacity-90 md:-left-16">
        <LandingLottieFootball size={280} className="hidden sm:block" />
      </div>

      <motion.div
        className="relative z-10"
        initial={reduce ? false : { opacity: 0, y: 40, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
        style={{ transformPerspective: 1200 }}
      >
        <HeroScoreboard />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute -bottom-6 -right-4 z-20 hidden md:block"
        animate={
          reduce
            ? undefined
            : {
                y: [0, -12, 0],
                rotate: [0, 8, 0],
              }
        }
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="landing-floating-ball h-14 w-14" />
      </motion.div>

      <div className="landing-goal-flash pointer-events-none absolute inset-0 z-[5] rounded-[2rem]" />
    </div>
  );
}
