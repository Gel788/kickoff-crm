import { Button } from "@/components/kickoff/button";
import { HeroScoreboard } from "@/components/landing/hero-scoreboard";
import { LandingHeader } from "@/components/landing/landing-header";
import { LogoMarquee } from "@/components/landing/logo-marquee";
import { MatchdayBento } from "@/components/landing/matchday-bento";
import { MatchdayFlow } from "@/components/landing/matchday-flow";
import { ProductShowcase } from "@/components/landing/product-showcase";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "Live", label: "протокол с поля" },
  { value: "Lock", label: "заявки до свистка" },
  { value: "PDF", label: "официальный протокол" },
  { value: "API", label: "табло на сайт лиги" },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-base">
      <div className="pointer-events-none fixed inset-0 grid-pitch opacity-60" />
      <div className="pointer-events-none fixed inset-0 landing-aurora" />
      <div className="pointer-events-none fixed inset-0 landing-vignette" />

      <LandingHeader />

      <main className="relative z-10">
        {/* Hero — full bleed */}
        <section className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-6 pb-20 pt-28 lg:pt-32">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div className="animate-fade-in">
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
                  Matchday OS
                </span>
              </div>

              <h1 className="font-display text-[clamp(2.75rem,8vw,5.5rem)] font-extrabold leading-[0.95] tracking-tight">
                <span className="block text-white">Матчдень.</span>
                <span className="mt-1 block bg-gradient-to-r from-accent via-emerald-300 to-white bg-clip-text text-transparent">
                  В одном ритме.
                </span>
              </h1>

              <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted md:text-xl">
                Заявки, live-протокол, таблица и PDF — синхронно для лиги, клубов и судей.
                Как трансляция, только для всего тура.
              </p>

              <div className="mt-12 flex flex-wrap items-center gap-4">
                <Link href="/login">
                  <Button size="lg" className="h-14 px-8 text-base shadow-glow">
                    Открыть демо
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/live/demo">
                  <Button variant="outline" size="lg" className="h-14 gap-2 border-white/15 px-8 text-base">
                    <Play className="h-4 w-4 fill-current" />
                    Live-табло
                  </Button>
                </Link>
              </div>
            </div>

            <div className="animate-fade-in-delay lg:translate-y-4">
              <HeroScoreboard />
            </div>
          </div>

          <div className="mt-20 grid grid-cols-2 gap-8 border-t border-white/5 pt-12 md:grid-cols-4">
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
          </div>
        </section>

        <LogoMarquee />
        <MatchdayBento />
        <MatchdayFlow />
        <ProductShowcase />

        {/* CTA */}
        <section className="relative mx-auto max-w-6xl px-6 py-32">
          <div className="landing-cta-glow relative overflow-hidden rounded-[2.5rem] p-[1px]">
            <div className="relative rounded-[2.45rem] bg-[#0a0e12] px-8 py-20 text-center md:px-20 md:py-28">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,230,118,0.15),transparent_55%)]" />
              <p className="relative font-mono text-[11px] uppercase tracking-[0.4em] text-accent">
                Сезон начинается здесь
              </p>
              <h2 className="relative mt-6 font-display text-4xl font-extrabold tracking-tight md:text-6xl">
                Проведите тур
                <br />
                <span className="text-muted">как большой матч</span>
              </h2>
              <p className="relative mx-auto mt-6 max-w-md text-muted">
                Демо-лига уже настроена. Войдите и пройдите матчдень за 10 минут.
              </p>
              <div className="relative mt-10 flex flex-wrap justify-center gap-4">
                <Link href="/login">
                  <Button size="lg" className="h-14 px-10 shadow-glow">
                    Войти в Kickoff
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/o/demo">
                  <Button variant="outline" size="lg" className="h-14 border-white/15 px-10">
                    Страница лиги
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted md:flex-row">
          <span className="font-display text-lg font-bold tracking-tight">
            KICK<span className="text-accent">OFF</span>
          </span>
          <span className="font-mono text-xs">
            © {new Date().getFullYear()} · Операционная система соревнований
          </span>
        </div>
      </footer>
    </div>
  );
}
