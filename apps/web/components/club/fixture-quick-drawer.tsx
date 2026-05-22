"use client";

import { Button } from "@/components/kickoff/button";
import { format } from "@/lib/format";
import { Drawer } from "vaul";
import Link from "next/link";
import { useState } from "react";

export type ClubFixturePreview = {
  id: string;
  home: string;
  away: string;
  scheduledAt: string;
  status: string;
  venue?: string | null;
};

export function FixtureQuickDrawer({
  fixtures,
}: {
  fixtures: ClubFixturePreview[];
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ClubFixturePreview | null>(null);

  if (fixtures.length === 0) return null;

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
        {fixtures.slice(0, 4).map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              setActive(f);
              setOpen(true);
            }}
            className="rounded-lg border border-border bg-elevated px-3 py-2 text-left text-xs hover:border-accent/40"
          >
            <span className="font-medium">
              {f.home} — {f.away}
            </span>
            <span className="mt-0.5 block font-mono text-muted">
              {format.shortDate(new Date(f.scheduledAt))}
            </span>
          </button>
        ))}
      </div>

      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[90] bg-black/50" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-[91] mx-auto max-h-[85vh] rounded-t-2xl border border-border bg-elevated outline-none">
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-border" />
            {active && (
              <div className="p-6 pb-10">
                <p className="font-mono text-xs text-accent">Ближайший матч</p>
                <h3 className="mt-2 font-display text-2xl font-bold">
                  {active.home} — {active.away}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {format.datetime(new Date(active.scheduledAt))}
                </p>
                {active.venue && (
                  <p className="mt-1 text-sm text-muted">{active.venue}</p>
                )}
                <p className="mt-1 font-mono text-xs text-muted">{active.status}</p>
                <div className="mt-6 flex gap-3">
                  <Link href={`/league/fixtures/${active.id}`} className="flex-1">
                    <Button className="w-full" size="sm">
                      Карточка матча
                    </Button>
                  </Link>
                  <Link href="/club" className="flex-1">
                    <Button className="w-full" size="sm" variant="outline">
                      Заявка
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
