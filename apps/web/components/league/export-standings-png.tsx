"use client";

import { Button } from "@/components/kickoff/button";
import * as htmlToImage from "html-to-image";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function ExportStandingsPng({ targetId }: { targetId: string }) {
  async function exportPng() {
    const el = document.getElementById(targetId);
    if (!el) {
      toast.error("Таблица не найдена");
      return;
    }
    try {
      const dataUrl = await htmlToImage.toPng(el, {
        backgroundColor: "#0a0e12",
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `kickoff-standings-${Date.now()}.png`;
      a.click();
      toast.success("PNG сохранён");
    } catch {
      toast.error("Не удалось экспортировать");
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={exportPng} className="gap-2">
      <Download className="h-4 w-4" />
      Скачать PNG
    </Button>
  );
}
