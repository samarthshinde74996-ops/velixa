"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SheetData } from "@/lib/spreadsheet-utils";
import { exportToXLSX, exportToCSV } from "@/lib/spreadsheet-utils";

interface BulkSheet {
  prompt: string;
  status: "pending" | "generating" | "done" | "error";
  data?: SheetData;
}

export default function BulkPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [prompts, setPrompts] = useState(["", "", ""]);
  const [sheets, setSheets] = useState<BulkSheet[]>([]);
  const [running, setRunning] = useState(false);

  async function generateAll() {
    if (!session) { toast.error("Sign in to use bulk generation!"); router.push("/login"); return; }

    const validPrompts = prompts.filter((p) => p.trim().length > 3);
    if (validPrompts.length === 0) { toast.error("Add at least one prompt!"); return; }

    setRunning(true);
    const initial: BulkSheet[] = validPrompts.map((p) => ({ prompt: p, status: "pending" }));
    setSheets(initial);

    for (let i = 0; i < validPrompts.length; i++) {
      setSheets((prev) => prev.map((s, idx) => idx === i ? { ...s, status: "generating" } : s));

      try {
        const res = await fetch("/api/generate-sheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: validPrompts[i] }),
        });
        const data = await res.json();
        setSheets((prev) => prev.map((s, idx) => idx === i ? { ...s, status: "done", data } : s));
      } catch {
        setSheets((prev) => prev.map((s, idx) => idx === i ? { ...s, status: "error" } : s));
      }

      // Small delay between requests
      await new Promise((r) => setTimeout(r, 500));
    }

    setRunning(false);
    toast.success("All sheets generated! 🎉");
  }

  function addPrompt() {
    if (prompts.length < 10) setPrompts([...prompts, ""]);
  }

  function updatePrompt(i: number, val: string) {
    setPrompts(prompts.map((p, idx) => idx === i ? val : p));
  }

  function removePrompt(i: number) {
    if (prompts.length > 1) setPrompts(prompts.filter((_, idx) => idx !== i));
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8 fade-up">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⚡</span>
            <h1 className="font-display text-3xl font-bold text-white">Bulk Generation</h1>
            <span className="badge badge-accent">Pro</span>
          </div>
          <p className="text-[#7a7a9a] text-[14px]">Generate multiple spreadsheets at once. Add up to 10 prompts.</p>
        </div>

        {/* Prompt inputs */}
        <div className="glow-card p-6 mb-6 fade-up-delay-1">
          <h2 className="font-display font-bold text-white mb-4 text-[16px]">Your Prompts</h2>
          <div className="flex flex-col gap-3">
            {prompts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[12px] text-[#3a3a5a] font-mono w-5">{i + 1}</span>
                <input
                  value={p}
                  onChange={(e) => updatePrompt(i, e.target.value)}
                  placeholder={`Sheet ${i + 1} prompt... e.g. Salary sheet for 10 employees`}
                  className="input flex-1"
                  disabled={running}
                />
                {prompts.length > 1 && (
                  <button onClick={() => removePrompt(i)}
                    className="text-[#3a3a5a] hover:text-[#ef4444] transition-colors text-lg">×</button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button onClick={addPrompt} disabled={prompts.length >= 10 || running}
              className="btn btn-secondary text-[13px] py-2 px-4">
              + Add prompt
            </button>
            <span className="text-[12px] text-[#7a7a9a] font-mono">{prompts.filter(p => p.trim()).length}/{prompts.length} filled</span>
          </div>
        </div>

        {/* Generate button */}
        <button onClick={generateAll} disabled={running}
          className="btn btn-primary w-full justify-center py-3 text-[15px] mb-8 fade-up-delay-1">
          {running ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Generating {sheets.filter(s => s.status === "done").length}/{sheets.length} sheets…
            </span>
          ) : "⚡ Generate All Sheets"}
        </button>

        {/* Results */}
        {sheets.length > 0 && (
          <div className="flex flex-col gap-4 fade-up">
            <h2 className="font-display font-bold text-white text-[16px]">
              Results ({sheets.filter(s => s.status === "done").length}/{sheets.length} done)
            </h2>
            {sheets.map((sheet, i) => (
              <div key={i} className="glow-card p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    {sheet.status === "pending" && <span className="w-2 h-2 rounded-full bg-[#3a3a5a]" />}
                    {sheet.status === "generating" && <span className="w-2 h-2 rounded-full bg-[#fbbf24] pulse-dot" />}
                    {sheet.status === "done" && <span className="w-2 h-2 rounded-full bg-[#00d4aa]" />}
                    {sheet.status === "error" && <span className="w-2 h-2 rounded-full bg-[#ef4444]" />}
                    <div>
                      <p className="text-white font-medium text-[14px]">{sheet.data?.name ?? `Sheet ${i + 1}`}</p>
                      <p className="text-[#7a7a9a] text-[12px] truncate max-w-xs">{sheet.prompt}</p>
                    </div>
                  </div>

                  {sheet.status === "done" && sheet.data && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#7a7a9a] font-mono">{sheet.data.rows} rows</span>
                      <button onClick={() => exportToCSV(sheet.data!)}
                        className="btn btn-secondary text-[11px] py-1.5 px-3 font-mono">↓ CSV</button>
                      <button onClick={() => exportToXLSX(sheet.data!)}
                        className="btn btn-secondary text-[11px] py-1.5 px-3 font-mono">↓ XLSX</button>
                    </div>
                  )}

                  {sheet.status === "generating" && (
                    <span className="text-[12px] text-[#fbbf24] font-mono">Generating…</span>
                  )}
                  {sheet.status === "error" && (
                    <span className="text-[12px] text-[#ef4444] font-mono">Failed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}