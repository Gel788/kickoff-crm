export function rowsToCsv<T extends Record<string, unknown>>(
  data: T[],
  headers: { key: keyof T; label: string }[],
): string {
  const headerRow = headers.map((h) => h.label).join(",");
  const dataRows = data.map((row) =>
    headers
      .map((h) => {
        const value = row[h.key];
        if (value === null || value === undefined) return "";
        let s = String(value);
        if (s.includes(",") || s.includes("\n") || s.includes('"')) {
          s = `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      })
      .join(","),
  );
  return [headerRow, ...dataRows].join("\n");
}
