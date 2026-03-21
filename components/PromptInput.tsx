"use client";
import { useState, useRef, useEffect } from "react";

const EXAMPLES = [
  "Salary sheet for 25 employees with PF and tax...",
  "Monthly expense tracker for a startup...",
  "Student attendance with percentage formula...",
  "Freelancer invoice with GST calculation...",
  "Inventory tracker with stock alerts...",
];

export default function PromptInput({ onGenerate, loading, initial = "" }: { onGenerate: (p: string) => void; loading: boolean; initial?: string }) {
  const [prompt, setPrompt] = useState(initial);
  const [phIdx, setPhIdx] = useState(0);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { const t = setInterval(() => setPhIdx((i) => (i + 1) % EXAMPLES.length), 3000); return () => clearInterval(t); }, []);
  useEffect(() => { if (initial) setPrompt(initial); }, [initial]);
  useEffect(() => {
    if (ref.current) { ref.current.style.height = "auto"; ref.current.style.height = `${Math.min(ref.current.scrollHeight, 160)}px`; }
  }, [prompt]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="neon-border bg-[#111118] p-1">
        <textarea ref={ref} value={prompt} onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (prompt.trim()) onGenerate(prompt.trim()); } }}
          placeholder={EXAMPLES[phIdx]} disabled={loading} rows={2}
          className="w-full bg-transparent text-[#f0f0f8] placeholder-[#3a3a5a] text-[15px] px-4 pt-4 pb-12 resize-none outline-none leading-relaxed disabled:opacity-60"
          style={{ minHeight: 72 }} />
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 pointer-events-none" style={{ position: "relative" }}>
          <span className="text-[11px] text-[#3a3a5a] font-mono pointer-events-none">
            {loading ? <span className="text-[#6c63ff] flex items-center gap-1.5"><span className="pulse-dot w-1.5 h-1.5 bg-[#6c63ff] rounded-full inline-block" />Generating…</span> : "⌘ Enter to generate"}
          </span>
          <button onClick={() => prompt.trim() && onGenerate(prompt.trim())} disabled={!prompt.trim() || loading}
            className="btn btn-primary text-[13px] py-2 px-5 pointer-events-auto">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Building…
              </span>
            ) : <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Generate
            </span>}
          </button>
        </div>
      </div>
    </div>
  );
}
