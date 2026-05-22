"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-elevated border border-border text-white font-sans shadow-xl",
          description: "text-muted",
        },
      }}
      richColors
      closeButton
    />
  );
}
