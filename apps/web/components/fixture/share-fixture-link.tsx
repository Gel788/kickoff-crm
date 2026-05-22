"use client";

import { Button } from "@/components/kickoff/button";
import { toast } from "sonner";

export function ShareFixtureLink({ url, label }: { url: string; label?: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Ссылка на матч скопирована");
    } catch {
      window.prompt("Ссылка на матч:", url);
    }
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={copy}>
      {label ?? "Ссылка на матч"}
    </Button>
  );
}
