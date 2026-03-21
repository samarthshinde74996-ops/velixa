"use client";
import { useState } from "react";
import { SheetData, exportToCSV, exportToXLSX, exportToPDF } from "@/lib/spreadsheet-utils";
import toast from "react-hot-toast";

export default function ExportButtons({ data, onRegen, onImprove, loading, canExportAll }: {
  data: SheetData; onRegen: () => void; onImprove: () => void; loading?: boolean; canExportAll?: boolean;
}) {
  const [exp, setExp] = useState<string | null>(null);

  async function handleExport(type: "xlsx" | "csv" | "pdf") {
    if (type !== "csv" && !canExportAll) {
      toast.error("Upgrade to Pro for XLSX & PDF export!");
      return;
    }
    setExp(type);
    try {
      if (type === "xlsx") await exportToXLSX(data);
      if (type === "csv") exportToCSV(data);
      if (type === "pdf") exportToPDF(data);
      toast.success(`Exported as ${type.toUpperCase()}!`);
    } finally {
      setTimeout(() => setExp(null), 1000);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] text-[#7a7a9a] font-mono uppercase tracking-wider hidden sm:block">Export</span>
      {(["xlsx", "csv", "pdf"] as const).map((t) => (
        <button key={t} onClick={() => handleExport(t)} disabled={exp === t}
          className={`btn btn-secondary text-[11px] py-1.5 px-3 font-mono uppercase tracking-wider ${!canExportAll && t !== "csv" ? "opacity-60" : ""}`}>
          {exp === t ? <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : "↓"}
          {t}{!canExportAll && t !== "csv" && <span className="text-[9px] text-[#fbbf24] ml-1">PRO</span>}
        </button>
      ))}
      <div className="w-px h-5 bg-[#2a2a3a]" />
      <button onClick={onRegen} disabled={loading} className="btn btn-ghost text-[12px] py-1.5 px-3">↺ Regen</button>
      <button onClick={onImprove} disabled={loading} className="btn btn-ghost text-[12px] py-1.5 px-3 text-[#6c63ff] hover:bg-[rgba(108,99,255,0.1)]">✦ Improve</button>
    </div>
  );
}
