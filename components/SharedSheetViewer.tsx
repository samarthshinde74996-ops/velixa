"use client";
import { SheetData, resolveFormula } from "@/lib/spreadsheet-utils";

const COLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function SharedSheetViewer({ data }: { data: SheetData }) {
  return (
    <div className="overflow-auto h-full">
      <table className="sheet-table">
        <thead>
          <tr>
            <th className="w-10 text-center text-[9px] text-[#3a3a5a]">#</th>
            {data.columns.map((col, ci) => (
              <th key={ci} style={{ minWidth: col.width ?? 120 }}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#3a3a5a] text-[9px]">{COLS[ci]}</span>
                  <span className="text-[#a0a0c0]">{col.header}</span>
                  {col.type === "formula" && <span className="ml-auto text-[9px] badge badge-green py-0 px-1">fx</span>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.sampleData.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 1 ? "bg-[rgba(26,26,36,0.3)]" : ""}>
              <td className="text-center text-[10px] text-[#3a3a5a] border border-[#2a2a3a] font-mono bg-[#111118]">{ri + 2}</td>
              {data.columns.map((col, ci) => {
                let display = "";
                if (col.type === "formula" && col.formula) {
                  display = resolveFormula(col.formula, ri + 2, row);
                } else {
                  const raw = row[ci];
                  display = col.type === "currency" && raw ? `₹${Number(raw).toLocaleString("en-IN")}` : String(raw ?? "");
                }
                return (
                  <td key={ci}
                    className={`px-3 py-[6px] border border-[rgba(42,42,58,0.5)] text-[13px] font-mono ${col.type === "formula" ? "fx" : col.type === "currency" || col.type === "number" ? "num" : ""}`}
                    style={{ minWidth: col.width ?? 120 }}>
                    {display || <span className="text-[#3a3a5a]">—</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}