"use client";

import { Button } from "@/components/kickoff/button";
import { useState } from "react";

export function CopyWhatsAppButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "Скопировано ✓" : "Скопировать в WhatsApp"}
    </Button>
  );
}
