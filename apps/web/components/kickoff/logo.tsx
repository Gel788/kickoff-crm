import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-accent-dim">
        <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_#00e676]" />
      </span>
      <span className="font-display text-xl font-bold tracking-tight">
        KICK<span className="text-accent">OFF</span>
      </span>
    </Link>
  );
}
