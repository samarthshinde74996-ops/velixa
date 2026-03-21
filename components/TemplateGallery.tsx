"use client";
import { TEMPLATES } from "@/lib/spreadsheet-utils";

export default function TemplateGallery({ onSelect, loading }: { onSelect: (p: string) => void; loading?: boolean }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#2a2a3a]" />
        <span className="text-[11px] text-[#7a7a9a] uppercase tracking-widest font-mono px-3">Quick Templates</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#2a2a3a]" />
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {TEMPLATES.map((t, i) => (
          <button key={i} onClick={() => onSelect(t.prompt)} disabled={loading}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111118] border border-[#2a2a3a] hover:border-[#6c63ff] hover:bg-[rgba(108,99,255,0.08)] transition-all text-[13px] text-[#a0a0c0] hover:text-[#f0f0f8] disabled:opacity-50">
            <span>{t.emoji}</span><span className="font-medium">{t.label}</span>
            <svg className="w-3 h-3 text-[#3a3a5a] group-hover:text-[#6c63ff] group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>
        ))}
      </div>
    </div>
  );
}
