"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { parseProductsCsv, type ProductImportGroup } from "@/lib/admin/csv-import";

interface ImportResult {
  slug: string;
  status: "created" | "updated" | "error";
  error?: string;
}

export function ImportForm() {
  const [groups, setGroups] = useState<ProductImportGroup[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);

  function handleFile(file: File) {
    setResults(null);
    const reader = new FileReader();
    reader.onload = () => {
      const { groups, errors } = parseProductsCsv(reader.result as string);
      setGroups(groups);
      setParseErrors(errors);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    setImporting(true);
    const response = await fetch("/api/admin/products/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groups }),
    });
    const body = await response.json();
    setImporting(false);

    if (!response.ok) {
      setParseErrors([body.error]);
      return;
    }
    setResults(body.results);
    setGroups([]);
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="text-body-m"
      />

      {parseErrors.length > 0 && (
        <div role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-body-s text-destructive">
          <p className="font-medium">Fix these before importing:</p>
          <ul className="mt-1 list-disc pl-5">
            {parseErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {groups.length > 0 && (
        <div>
          <p className="text-body-s text-muted-foreground">
            {groups.length} product{groups.length === 1 ? "" : "s"} ready to import.
          </p>
          <div className="mt-2 overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full text-left text-body-m">
              <thead className="border-b border-border text-body-s text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Slug</th>
                  <th className="px-4 py-2 font-medium">Category</th>
                  <th className="px-4 py-2 font-medium">Variants</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g.slug} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 text-charcoal">{g.name}</td>
                    <td className="px-4 py-2 text-muted-foreground">{g.slug}</td>
                    <td className="px-4 py-2 text-muted-foreground">{g.categorySlug}</td>
                    <td className="px-4 py-2 tabular-nums text-charcoal">{g.variants.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={handleImport} disabled={importing} className="mt-3 uppercase text-label tracking-wide">
            {importing ? "Importing..." : `Confirm Import (${groups.length})`}
          </Button>
        </div>
      )}

      {results && (
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-body-m font-medium text-charcoal">Import complete</p>
          <ul className="mt-2 space-y-1 text-body-s">
            {results.map((r) => (
              <li key={r.slug} className={r.status === "error" ? "text-destructive" : "text-charcoal"}>
                {r.slug}: {r.status === "error" ? `error: ${r.error}` : r.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
