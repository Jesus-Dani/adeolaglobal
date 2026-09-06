function escapeCsvField(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: Record<string, string | number>[], headers: string[]): string {
  const headerLine = headers.join(",");
  const lines = rows.map((row) => headers.map((h) => escapeCsvField(row[h] ?? "")).join(","));
  return [headerLine, ...lines].join("\n");
}

export function csvResponseHeaders(filename: string): HeadersInit {
  return {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${filename}"`,
  };
}
