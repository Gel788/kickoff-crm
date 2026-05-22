"use client";

import CountUp from "react-countup";

export function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  return (
    <CountUp
      end={value}
      duration={1.4}
      enableScrollSpy
      scrollSpyOnce
      suffix={suffix}
    />
  );
}
