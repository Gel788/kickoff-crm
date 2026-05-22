const libs = [
  "Lottie",
  "Framer Motion",
  "Fuse.js",
  "Recharts",
  "Sonner",
  "Embla",
  "CountUp",
  "SSE Live",
  "html-to-image",
  "iCal",
  "Prisma",
  "Next.js",
];

export function TechMarquee() {
  const items = [...libs, ...libs];
  return (
    <section className="overflow-hidden border-y border-white/5 py-4">
      <div className="flex animate-marquee-slow gap-8 whitespace-nowrap px-4">
        {items.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
