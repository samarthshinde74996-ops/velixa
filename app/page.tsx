"use client";
import SheetChart from "@/components/SheetChart";
import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PromptInput from "@/components/PromptInput";
import SpreadsheetViewer from "@/components/SpreadsheetViewer";
import ExportButtons from "@/components/ExportButtons";
import ChatEditor from "@/components/ChatEditor";
import TemplateGallery from "@/components/TemplateGallery";
import { SheetData } from "@/lib/spreadsheet-utils";


type AppState = "landing" | "loading" | "sheet";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [state, setState] = useState<AppState>("landing");
  const [sheet, setSheet] = useState<SheetData | null>(null);
  const [prompt, setPrompt] = useState("");
  const [saving, setSaving] = useState(false);

  const generate = useCallback(async (p: string) => {
    setPrompt(p);
    setState("loading");

    const res = await fetch("/api/generate-sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: p }),
    });

    const data = await res.json();

    if (data.limitReached) {
      toast.error("Free plan limit reached! Upgrade to Pro.");
      router.push("/pricing");
      setState("landing");
      return;
    }

    if (!res.ok) {
      toast.error(data.error || "Generation failed. Try again.");
      setState("landing");
      return;
    }

    setSheet(data);
    setState("sheet");
    toast.success("Sheet generated!");
  }, [router]);

  const handleSave = async () => {
    if (!session) { toast.error("Sign in to save sheets!"); router.push("/login"); return; }
    if (!sheet) return;
    setSaving(true);
    try {
      const res = await fetch("/api/save-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: sheet.name, prompt, data: sheet }),
      });
      if (res.ok) toast.success("Sheet saved to dashboard!");
      else toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col grid-bg">
      <Navbar />

      {/* ── LANDING ── */}
      {(state === "landing" || state === "loading") && (
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          {/* Hero */}
          <div className="text-center mb-12 max-w-3xl fade-up">
            <div className="inline-flex items-center gap-2 bg-[rgba(108,99,255,0.1)] border border-[rgba(108,99,255,0.3)] rounded-full px-4 py-1.5 mb-8">
              <span className="pulse-dot w-1.5 h-1.5 bg-[#00d4aa] rounded-full" />
              <span className="text-[12px] text-[#a0a0c0] font-mono">AI-Powered Spreadsheet Generator</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl font-extrabold leading-tight mb-5">
              <span className="gradient-text">Describe it.</span><br />
              <span className="text-white">We'll build it.</span>
            </h1>

            <p className="text-[#7a7a9a] text-lg leading-relaxed max-w-xl mx-auto mb-8">
              Type what you need in plain English. Get a complete spreadsheet with formulas, sample data, and export options — in seconds.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-10 mb-10">
              {[["~2s", "Generation"], ["95%", "Accuracy"], ["3", "Export formats"]].map(([n, l]) => (
                <div key={l} className="text-center">
                  <div className="font-display text-2xl font-bold text-white">{n}</div>
                  <div className="text-[11px] text-[#7a7a9a] uppercase tracking-wider mt-0.5 font-mono">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="w-full max-w-3xl px-4 fade-up-delay-1">
            <PromptInput onGenerate={generate} loading={state === "loading"} />
          </div>

          {/* Templates */}
          <div className="w-full max-w-3xl px-4 mt-10 fade-up-delay-2">
            <TemplateGallery onSelect={generate} loading={state === "loading"} />
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mt-12 max-w-lg fade-up-delay-3">
            {["✦ Indian INR formatting", "✦ Auto formulas", "✦ Editable cells", "✦ Excel export", "✦ Save to dashboard"].map((f) => (
              <span key={f} className="text-[11px] text-[#7a7a9a] font-mono px-3 py-1.5 rounded-full bg-[#111118] border border-[#2a2a3a]">{f}</span>
            ))}
          </div>

          {/* How it works */}
          <section className="w-full max-w-4xl px-4 mt-24 fade-up-delay-4">
            <h2 className="font-display text-2xl font-bold text-center text-white mb-10">How it works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Describe your sheet", desc: "Type what you need in plain English. Be as specific or vague as you like.", icon: "✏️" },
                { step: "02", title: "AI builds it instantly", desc: "Claude AI generates columns, formulas, and sample data tailored to your request.", icon: "⚡" },
                { step: "03", title: "Edit and export", desc: "Tweak any cell, add rows, then export as XLSX, CSV, or PDF — ready to use.", icon: "📤" },
              ].map((item) => (
                <div key={item.step} className="glow-card p-6">
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <div className="text-[11px] text-[#6c63ff] font-mono mb-2">{item.step}</div>
                  <h3 className="font-display font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-[13px] text-[#7a7a9a] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          {!session && (
            <div className="mt-20 text-center fade-up">
              <p className="text-[#7a7a9a] mb-4">Save your sheets and access them anytime</p>
              <Link href="/signup" className="btn btn-primary text-[15px] py-3 px-8">
                Create free account →
              </Link>
            </div>
          )}
        </main>
      )}

      {/* ── SHEET VIEW ── */}
      {state === "sheet" && sheet && (
        <main className="flex-1 flex flex-col min-h-0" style={{ height: "calc(100vh - 64px)" }}>
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#111118] border-b border-[#2a2a3a] flex-wrap gap-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#00d4aa]" />
              <span className="font-display font-bold text-[15px] text-white">{sheet.name}</span>
              <span className="text-[11px] text-[#7a7a9a] font-mono hidden sm:block">{sheet.rows} rows · {sheet.columns.length} cols</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <ExportButtons
                data={sheet}
                onRegen={() => generate(prompt)}
                onImprove={() => generate(`Improve and add more detail to: ${prompt}`)}
                canExportAll={true}
              />
              <button onClick={handleSave} disabled={saving || !session} className="btn btn-secondary text-[12px] py-1.5 px-3">
                {saving ? "Saving…" : session ? "💾 Save" : "Sign in to save"}
              </button>
              <button onClick={() => setState("landing")} className="btn btn-ghost text-[12px] py-1.5 px-3">← New</button>
            </div>
          </div>

          {/* Sheet */}
<div className="flex-1 min-h-0 overflow-hidden bg-[#0d0d14] flex flex-col">
  <div className="flex-1 min-h-0 overflow-hidden">
    <SpreadsheetViewer data={sheet} onDataChange={setSheet} />
  </div>
  <SheetChart data={sheet} />
</div>

          <ChatEditor data={sheet} onUpdate={setSheet} />{/* Bottom prompt bar */}
          <div className="px-4 py-3 bg-[#111118] border-t border-[#2a2a3a] flex-shrink-0">
            <PromptInput onGenerate={generate} loading={false} />
          </div>
        </main>
      )}

      {state === "landing" && <Footer />}
    </div>
  );
}
