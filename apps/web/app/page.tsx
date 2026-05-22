import { Button } from "@/components/kickoff/button";
import { BeforeAfter } from "@/components/landing/before-after";
import { EmbedPreview } from "@/components/landing/embed-preview";
import { LandingLenis } from "@/components/landing/landing-lenis";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHeroContent } from "@/components/landing/landing-hero-content";
import { LandingHeroVisual } from "@/components/landing/landing-hero-visual";
import { LandingLiveData } from "@/components/landing/landing-live-data";
import { LandingScrollReveal } from "@/components/landing/landing-scroll-reveal";
import { LiveScoreTicker } from "@/components/landing/live-score-ticker";
import { LandingStadiumBg } from "@/components/landing/landing-stadium-bg";
import { TechMarquee } from "@/components/landing/tech-marquee";
import { LogoMarquee } from "@/components/landing/logo-marquee";
import { MatchdayBento } from "@/components/landing/matchday-bento";
import { MatchdayFlow } from "@/components/landing/matchday-flow";
import { OpenFeaturesGrid } from "@/components/landing/open-features-grid";
import { ProductShowcase } from "@/components/landing/product-showcase";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingTrustStrip } from "@/components/landing/landing-trust-strip";
import { ValueSplit } from "@/components/landing/value-split";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-base">
      <LandingLenis />
      <LandingStadiumBg />
      <div className="pointer-events-none fixed inset-0 z-[1] grid-pitch opacity-50" />
      <div className="pointer-events-none fixed inset-0 z-[1] landing-pitch-lines opacity-40" />
      <div className="pointer-events-none fixed inset-0 z-[1] landing-aurora" />
      <div className="pointer-events-none fixed inset-0 z-[1] landing-vignette" />

      <LandingHeader />

      <main className="relative z-10">
        <section className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-6 pb-20 pt-28 lg:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
            <LandingHeroContent />
            <LandingHeroVisual />
          </div>
        </section>

        <LiveScoreTicker slug="demo" />
        <LandingTrustStrip />
        <TechMarquee />

        <LandingScrollReveal>
          <LogoMarquee />
        </LandingScrollReveal>
        <LandingScrollReveal delay={0.05}>
          <MatchdayBento />
        </LandingScrollReveal>
        <LandingScrollReveal>
          <LandingLiveData />
        </LandingScrollReveal>
        <LandingScrollReveal>
          <OpenFeaturesGrid />
        </LandingScrollReveal>
        <LandingScrollReveal>
          <section className="mx-auto max-w-6xl px-6 py-20">
            <BeforeAfter />
          </section>
        </LandingScrollReveal>
        <LandingScrollReveal>
          <EmbedPreview />
        </LandingScrollReveal>
        <LandingScrollReveal>
          <ValueSplit />
        </LandingScrollReveal>
        <LandingScrollReveal>
          <MatchdayFlow />
        </LandingScrollReveal>
        <LandingScrollReveal>
          <ProductShowcase />
        </LandingScrollReveal>

        <section className="relative mx-auto max-w-6xl px-6 py-32">
          <LandingScrollReveal>
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
          </LandingScrollReveal>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
