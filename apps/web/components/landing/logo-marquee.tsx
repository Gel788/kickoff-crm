const leagues = [
  "Московская лига U15",
  "Кубок города",
  "Регион U13",
  "Лига развития",
  "Турнир выходного дня",
  "Федерация U18",
];

export function LogoMarquee() {
  const items = [...leagues, ...leagues];
  return (
    <section className="overflow-hidden border-y border-border/50 bg-elevated/30 py-8">
      <div className="flex animate-marquee gap-12 whitespace-nowrap">
        {items.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="font-mono text-sm uppercase tracking-widest text-muted/80"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
