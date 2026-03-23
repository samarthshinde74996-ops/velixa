"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Sheet { id: string; name: string; prompt: string; createdAt: string; }

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [plan, setPlan] = useState("free");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") fetchSheets();
  }, [status]);

  async function fetchSheets() {
    setLoading(true);
    try {
      const res = await fetch("/api/get-sheets");
      const data = await res.json();
      setSheets(data.sheets ?? []);
      setPlan(data.plan ?? "free");
      setCount(data.sheetsCount ?? 0);
    } finally { setLoading(false); }
  }

  async function deleteSheet(id: string) {
    setDeleting(id);
    try {
      await fetch(`/api/get-sheets?id=${id}`, { method: "DELETE" });
      setSheets((s) => s.filter((sh) => sh.id !== id));
      toast.success("Sheet deleted");
    } finally { setDeleting(null); }
  }

  async function shareSheet(id: string) {
    const res = await fetch("/api/share-sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheetId: id }),
    });
    const data = await res.json();
    if (data.url) {
      navigator.clipboard.writeText(data.url);
      toast.success("Share link copied! 🔗");
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen grid-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin w-8 h-8 text-[#6c63ff] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-[#7a7a9a] font-mono text-[13px]">Loading dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-up">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">
              Hey, {session?.user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-[#7a7a9a] text-[14px]">Your saved spreadsheets</p>
          </div>
          <Link href="/" className="btn btn-primary py-2.5 px-5 self-start sm:self-auto">
            + Generate New Sheet
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 fade-up-delay-1">
          {[
            { label: "Sheets Generated", value: count, icon: "📊" },
            { label: "Sheets Saved", value: sheets.length, icon: "💾" },
            { label: "Current Plan", value: plan.charAt(0).toUpperCase() + plan.slice(1), icon: "⭐" },
            { label: plan === "free" ? "Sheets Left" : "Monthly Limit", value: plan === "free" ? Math.max(0, 5 - count) : "∞", icon: "🔢" },
          ].map((s) => (
            <div key={s.label} className="glow-card p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-display text-2xl font-bold text-white">{s.value}</div>
              <div className="text-[11px] text-[#7a7a9a] font-mono uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Free plan banner */}
        {plan === "free" && (
          <div className="flex items-center justify-between bg-[rgba(108,99,255,0.08)] border border-[rgba(108,99,255,0.25)] rounded-xl p-4 mb-8 fade-up-delay-1">
            <div>
              <p className="text-white font-medium text-[14px]">You're on the Free plan</p>
              <p className="text-[#7a7a9a] text-[12px] mt-0.5">{Math.max(0, 5 - count)} sheets remaining · Upgrade for unlimited</p>
            </div>
            <Link href="/pricing" className="btn btn-primary text-[13px] py-2 px-4 whitespace-nowrap">Upgrade →</Link>
          </div>
        )}

        {/* Sheets grid */}
        <div className="fade-up-delay-2">
          <h2 className="font-display text-lg font-bold text-white mb-4">Saved Sheets ({sheets.length})</h2>

          {sheets.length === 0 ? (
            <div className="glow-card p-12 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="font-display text-lg font-bold text-white mb-2">No saved sheets yet</h3>
              <p className="text-[#7a7a9a] text-[13px] mb-6">Generate a sheet and click "Save" to see it here</p>
              <Link href="/" className="btn btn-primary py-2.5 px-6">Generate your first sheet →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sheets.map((sheet) => (
                <div key={sheet.id} className="glow-card p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#00d4aa] flex items-center justify-center text-white text-sm flex-shrink-0">
                      📊
                    </div>
                    <button onClick={() => deleteSheet(sheet.id)} disabled={deleting === sheet.id}
                      className="text-[#3a3a5a] hover:text-[#ef4444] transition-colors text-lg leading-none ml-auto flex-shrink-0">
                      {deleting === sheet.id ? "…" : "×"}
                    </button>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-[15px] mb-1 truncate">{sheet.name}</h3>
                    <p className="text-[12px] text-[#7a7a9a] line-clamp-2 leading-relaxed">{sheet.prompt}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#2a2a3a]">
                    <span className="text-[11px] text-[#3a3a5a] font-mono">{formatDate(sheet.createdAt)}</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => shareSheet(sheet.id)}
                        className="text-[12px] text-[#00d4aa] hover:underline font-medium">
                        🔗 Share
                      </button>
                      <Link href={`/?prompt=${encodeURIComponent(sheet.prompt)}`}
                        className="text-[12px] text-[#6c63ff] hover:underline font-medium">
                        Regenerate →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}