"use client";

import { Button } from "@/components/kickoff/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function CopyShareButton({
  url,
  title,
  text,
  label = "Поделиться",
}: {
  url: string;
  title?: string;
  text?: string;
  label?: string;
}) {
  async function handleClick() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        toast.success("Отправлено");
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Ссылка скопирована");
    } catch {
      toast.error("Не удалось скопировать");
    }
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleClick} className="gap-2">
      <Share2 className="h-4 w-4" />
      {label}
    </Button>
  );
}
