"use client";

import { QRCodeSVG } from "qrcode.react";

export function FixtureQr({
  url,
  label,
}: {
  url: string;
  label: string;
}) {
  return (
    <div className="inline-flex flex-col items-center gap-2 rounded-xl border border-border bg-base p-4">
      <QRCodeSVG value={url} size={120} level="M" includeMargin />
      <span className="max-w-[140px] text-center text-xs text-muted">{label}</span>
    </div>
  );
}
