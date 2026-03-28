"use client";
import { useState, useCallback, useRef } from "react";
import { SheetData, resolveFormula } from "@/lib/spreadsheet-utils";

const COLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function SpreadsheetViewer({ data, onDataChange }: { data: SheetData; onDataChange?: (d: SheetData) => void }) {
  const [tabs, setTabs] = useState([{ name: data.name, rows: data.sampleData }]);
  const [activeTab, setActiveTab] = useState(0);
  const [editCell, setEditCell] = useState<{ r: number; c: number } | null>(null);
  const [editVal, setEditVal] = useState("");
  const history = useRef<(string | number)[][][]>([data.sampleData]);
  const historyIdx = useRef(0);

  const rows = tabs[activeTab]?.rows ?? [];

  function updateRows(newRows: (string | number)[][], saveHistory = true) {
    if (saveHistory) {
      history.current = history.current.slice(0, historyIdx.current + 1);
      history.current.push(newRows);
      historyIdx.current = history.current.length - 1;
    }
    setTabs((prev) => prev.map((t, i) => i === activeTab ? { ...t, rows: newRows } : t));
    onDataChange?.({ ...data, sampleData: newRows });
  }

  function undo() {
    if (historyIdx.current <= 0) return;
    historyIdx.current--;
    const prev = history.current[historyIdx.current];
    setTabs((t) => t.map((tab, i) => i === activeTab ? { ...tab, rows: prev } : tab));
  }

  function redo() {
    if (historyIdx.current >= history.current.length - 1) return;
    historyIdx.current++;
    const next = history.current[historyIdx.current];
    setTabs((t) => t.map((tab, i) => i === activeTab ? { ...tab, rows: next } : tab));
  }

  function addTab() {
    const newTab = { name: `Sheet ${tabs.length + 1}`, rows: data.sampleData };
    setTabs([...tabs, newTab]);
    setActiveTab(tabs.length);
  }

  function deleteTab(idx: number) {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter((_, i) => i !== idx);
    setTabs(newTabs);
    setActiveTab(Math.min(activeTab, newTabs.length - 1));
  }

  function commit(r: number, c: number) {
    const newRows = rows.map((row, ri) =>
      ri === r ? row.map((cell, ci) => ci === c ? (isNaN(Number(editVal)) ? editVal : Number(editVal)) : cell) : row
    );
    updateRows(newRows);
    setEditCell(null);
  }

  function addRow() {
    const empty = data.columns.map((col) => col.type === "formula" ? "" : col.type === "number" || col.type === "currency" ? 0 : "");
    updateRows([...rows, empty]);
  }

  const renderCell = useCallback((col: (typeof data.columns)[0], ri: number, ci: number) => {
    const row = rows[ri];
    const isEditing = editCell?.r === ri && editCell?.c === ci;

    if (col.type === "formula" && col.formula) {
      const val = resolveFormula(col.formula, ri + 2, row);
      return (
        <td key={ci} className="fx px-2 sm:px-3 py-[6px] border border-[rgba(42,42,58,0.5)] text-right font-mono text-[11px] sm:text-[12px]" style={{ minWidth: col.width ?? 100 }}>
          {val}
        </td>
      );
    }

    const raw = row[ci];
    const isNum = col.type === "number" || col.type === "currency";
    let display = raw !== "" && raw != null ? (col.type === "currency" ? `₹${Number(raw).toLocaleString("en-IN")}` : isNum ? Number(raw).toLocaleString("en-IN") : String(raw)) : "";

    if (isEditing) return (
      <td key={ci} className="p-0 border border-[#6c63ff]">
        <input autoFocus value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onBlur={() => commit(ri, ci)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Tab") commit(ri, ci); if (e.key === "Escape") setEditCell(null); }}
          className="px-2 py-[6px] bg-[rgba(108,99,255,0.1)] text-white outline-none font-mono text-[11px] sm:text-[12px]"
          style={{ width: col.width ?? 100 }} />
      </td>
    );

    return (
      <td key={ci}
        onDoubleClick={() => { setEditCell({ r: ri, c: ci }); setEditVal(String(raw ?? "")); }}
        className={`px-2 sm:px-3 py-[6px] border border-[rgba(42,42,58,0.5)] cursor-text hover:bg-[rgba(108,99,255,0.05)] text-[11px] sm:text-[12px] font-mono ${isNum ? "num" : ""}`}
        style={{ minWidth: col.width ?? 100 }}>
        {display || <span className="text-[#3a3a5a]">—</span>}
      </td>
    );
  }, [rows, editCell, editVal]);

  return (
    <div className="flex flex-col h-full">
      {/* Undo/Redo Toolbar */}
      <div className="flex items-center gap-2 px-2 sm:px-4 py-2 bg-[#111118] border-b border-[#2a2a3a] flex-shrink-0 overflow-x-auto">
        <button onClick={undo} title="Undo"
          className="btn btn-ghost text-[11px] sm:text-[12px] py-1 px-2 font-mono whitespace-nowrap"
          disabled={historyIdx.current <= 0}>
          ↩ Undo
        </button>
        <button onClick={redo} title="Redo"
          className="btn btn-ghost text-[11px] sm:text-[12px] py-1 px-2 font-mono whitespace-nowrap"
          disabled={historyIdx.current >= history.current.length - 1}>
          ↪ Redo
        </button>
        <div className="w-px h-4 bg-[#2a2a3a] mx-1" />
        <span className="text-[10px] text-[#3a3a5a] font-mono whitespace-nowrap">
          {historyIdx.current > 0 ? `${historyIdx.current} change${historyIdx.current > 1 ? "s" : ""}` : "No changes"}
        </span>
      </div>

      {/* Formula bar */}
      <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 bg-[#111118] border-b border-[#2a2a3a] text-[10px] sm:text-[11px] font-mono flex-shrink-0">
        <span className="text-[#7a7a9a] w-6 sm:w-8">{editCell ? `${COLS[editCell.c]}${editCell.r + 2}` : "A1"}</span>
        <span className="w-px h-4 bg-[#2a2a3a]" />
        <span className="text-[#6c63ff] flex-1 truncate">{editCell ? editVal : (data.columns[0]?.formula ?? data.columns[0]?.header ?? "")}</span>
        <span className="text-[#3a3a5a] whitespace-nowrap">{rows.length}r × {data.columns.length}c</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="sheet-table">
          <thead>
            <tr>
              <th className="w-8 sm:w-10 text-center text-[9px] text-[#3a3a5a]">#</th>
              {data.columns.map((col, ci) => (
                <th key={ci} style={{ minWidth: col.width ?? 100 }}>
                  <div className="flex items-center gap-1">
                    <span className="text-[#3a3a5a] text-[9px] hidden sm:block">{COLS[ci]}</span>
                    <span className="text-[#a0a0c0] text-[10px] sm:text-[11px] truncate">{col.header}</span>
                    {col.type === "formula" && <span className="ml-auto text-[9px] badge badge-green py-0 px-1 hidden sm:block">fx</span>}
                    {(col.type === "currency" || col.type === "number") && <span className="ml-auto text-[9px] badge badge-accent py-0 px-1 hidden sm:block">₹</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 1 ? "bg-[rgba(26,26,36,0.3)]" : ""}>
                <td className="text-center text-[10px] text-[#3a3a5a] border border-[#2a2a3a] font-mono bg-[#111118] select-none">{ri + 2}</td>
                {data.columns.map((col, ci) => renderCell(col, ri, ci))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet tabs */}
      <div className="flex items-center gap-1 px-2 sm:px-4 py-2 bg-[#111118] border-t border-[#2a2a3a] flex-shrink-0 overflow-x-auto">
        {tabs.map((tab, i) => (
          <div key={i}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-mono cursor-pointer transition-all whitespace-nowrap ${activeTab === i ? "bg-[#6c63ff] text-white" : "bg-[#1a1a24] text-[#7a7a9a] hover:text-white"}`}
            onClick={() => setActiveTab(i)}>
            {tab.name}
            {tabs.length > 1 && (
              <span onClick={(e) => { e.stopPropagation(); deleteTab(i); }}
                className="ml-1 text-[10px] opacity-60 hover:opacity-100">×</span>
            )}
          </div>
        ))}
        <button onClick={addRow} className="text-[10px] sm:text-[11px] text-[#7a7a9a] hover:text-[#6c63ff] transition-colors font-mono flex items-center gap-1 ml-2 whitespace-nowrap">+ Row</button>
        <button onClick={addTab} className="text-[10px] sm:text-[11px] text-[#7a7a9a] hover:text-[#00d4aa] transition-colors font-mono flex items-center gap-1 ml-auto whitespace-nowrap">+ Sheet</button>
      </div>
    </div>
  );
}