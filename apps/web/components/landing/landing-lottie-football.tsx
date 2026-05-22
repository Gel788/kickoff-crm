"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function LandingLottieFootball({
  className = "",
  size = 320,
}: {
  className?: string;
  size?: number;
}) {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    fetch("/animations/football-kick.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="h-24 w-24 animate-pulse rounded-full bg-accent/10" />
      </div>
    );
  }

  return (
    <div className={className} style={{ width: size, height: size }}>
      <Lottie
        animationData={data}
        loop
        className="h-full w-full drop-shadow-[0_0_40px_rgba(0,230,118,0.35)]"
      />
    </div>
  );
}
