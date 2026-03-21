"use client";
import { useState } from "react";
import { SheetData } from "@/lib/spreadsheet-utils";
import toast from "react-hot-toast";

export default function ChatEditor({ data, onUpdate }: { data: SheetData; onUpdate: (d: SheetData) => void }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);

  async function sendMessage() {
    if (!msg.trim() || loading) return;
    const userMsg = msg.trim();
    setMsg("");
    setHistory((h) => [...h, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/edit-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, currentSheet: data }),
      });
      const result = await res.json();
      if (result.sheet) {
        onUpdate(result.sheet);
        setHistory((h) => [...h, { role: "ai", content: result.message || "Done! Sheet updated" }]);
        toast.success("Sheet updated!");
      } else {
        setHistory((h) => [...h, { role: "ai", content: "Could not update." }]);
      }
    } catch {
      setHistory((h) => [...h, { role: "ai", content: "Something went wrong." }]);
    } finally { setLoading(false); }
  }

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#6c63ff] text-white shadow-lg flex items-center justify-center text-xl hover:bg-[#7c73ff] transition-all z-50">
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-[#111118] border border-[#2a2a3a] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden" style={{ height: 400 }}>
          <div className="px-4 py-3 bg-[#1a1a24] border-b border-[#2a2a3a] flex items-center gap-2">
            <span className="text-[#6c63ff] font-bold">✦</span>
            <span className="font-bold text-white text-[14px]">Edit with AI</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            {history.length === 0 && (
              <div className="text-center py-4">
                <p className="text-[12px] text-[#7a7a9a] mb-3">Ask me to edit your sheet!</p>
                {["Add a bonus column", "Change tax to 15%", "Add 10 more rows"].map((s) => (
                  <button key={s} onClick={() => setMsg(s)}
                    className="block w-full text-left text-[11px] text-[#6c63ff] bg-[rgba(108,99,255,0.1)] border border-[rgba(108,99,255,0.2)] rounded-lg px-3 py-1.5 mb-2 hover:bg-[rgba(108,99,255,0.2)]">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {history.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[12px] ${m.role === "user" ? "bg-[#6c63ff] text-white" : "bg-[#1a1a24] text-[#a0a0c0] border border-[#2a2a3a]"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#1a1a24] border border-[#2a2a3a] px-3 py-2 rounded-xl flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#6c63ff] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#6c63ff] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#6c63ff] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-[#2a2a3a] flex gap-2">
            <input value={msg} onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
              placeholder="Add a bonus column..."
              className="flex-1 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-[12px] text-white outline-none focus:border-[#6c63ff] placeholder-[#3a3a5a]" />
            <button onClick={sendMessage} disabled={loading || !msg.trim()}
              className="btn btn-primary py-2 px-3 text-[12px]">→</button>
          </div>
        </div>
      )}
    </>
  );
}