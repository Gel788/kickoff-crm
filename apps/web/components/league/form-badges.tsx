import type { FormResult } from "@/lib/form-guide";
import { cn } from "@/lib/utils";

const STYLES: Record<FormResult, string> = {
  W: "bg-accent/20 text-accent border-accent/30",
  D: "bg-muted/20 text-muted border-border",
  L: "bg-danger/15 text-danger border-danger/30",
};

export function FormBadges({
  form,
  empty = "—",
}: {
  form: FormResult[];
  empty?: string;
}) {
  if (form.length === 0) {
    return <span className="font-mono text-xs text-muted">{empty}</span>;
  }

  return (
    <span className="inline-flex gap-0.5" title={form.join(" ")}>
      {form.map((r, i) => (
        <span
          key={i}
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded border font-mono text-[10px] font-bold",
            STYLES[r],
          )}
        >
          {r}
        </span>
      ))}
    </span>
  );
}
