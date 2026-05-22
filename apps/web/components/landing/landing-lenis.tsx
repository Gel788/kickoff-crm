"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export function LandingLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    let raf = 0;
    function frame(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
