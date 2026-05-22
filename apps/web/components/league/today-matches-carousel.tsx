"use client";

import type { MatchStatus } from "@/components/kickoff/badge";
import { MatchCard } from "@/components/kickoff/match-card";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";

export type TodayMatchItem = {
  id: string;
  home: string;
  away: string;
  score?: string;
  time: string;
  venue?: string;
  status: MatchStatus;
};

export function TodayMatchesCarousel({ matches }: { matches: TodayMatchItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: matches.length > 2,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (matches.length === 0) return null;

  return (
    <div className="relative">
      {matches.length > 1 && (
        <div className="mb-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            className="rounded-lg border border-border p-2 text-muted hover:text-white"
            aria-label="Назад"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="rounded-lg border border-border p-2 text-muted hover:text-white"
            aria-label="Вперёд"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5">
          {matches.map((m) => (
            <div key={m.id} className="min-w-[min(100%,320px)] flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_32%]">
              <MatchCard
                home={m.home}
                away={m.away}
                score={m.score}
                time={m.time}
                venue={m.venue}
                status={m.status}
                href={`/league/fixtures/${m.id}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
