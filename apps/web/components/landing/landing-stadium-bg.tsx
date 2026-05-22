"use client";

/** Атмосфера стадиона: прожекторы, мячики, частицы — без тяжёлого WebGL. */
export function LandingStadiumBg() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="landing-spotlight landing-spotlight-a" />
      <div className="landing-spotlight landing-spotlight-b" />

      <div className="landing-ball landing-ball-1" />
      <div className="landing-ball landing-ball-2" />
      <div className="landing-ball landing-ball-3" />

      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={i}
          className="landing-particle"
          style={{
            left: `${(i * 17 + 5) % 100}%`,
            top: `${(i * 23 + 10) % 100}%`,
            animationDelay: `${i * 0.35}s`,
            animationDuration: `${4 + (i % 5)}s`,
          }}
        />
      ))}

      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-base via-base/80 to-transparent" />
    </div>
  );
}
