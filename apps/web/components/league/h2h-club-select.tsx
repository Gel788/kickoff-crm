"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function H2hClubSelect({
  clubs,
  clubAId,
  clubBId,
}: {
  clubs: { id: string; name: string }[];
  clubAId?: string;
  clubBId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: "a" | "b", value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`/league/compare?${p.toString()}`);
  }

  return (
    <div className="mb-8 flex flex-wrap items-end gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Клуб 1</span>
        <select
          value={clubAId ?? ""}
          onChange={(e) => update("a", e.target.value)}
          className="rounded-xl border border-border bg-elevated px-3 py-2"
        >
          <option value="">—</option>
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <span className="pb-2 font-mono text-muted">vs</span>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Клуб 2</span>
        <select
          value={clubBId ?? ""}
          onChange={(e) => update("b", e.target.value)}
          className="rounded-xl border border-border bg-elevated px-3 py-2"
        >
          <option value="">—</option>
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
