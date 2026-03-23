"use client";
import { useState, useEffect } from "react";

const THEMES = [
  { name: "dark", label: "Dark", color: "#6c63ff" },
  { name: "ocean", label: "Ocean", color: "#0ea5e9" },
  { name: "sunset", label: "Sunset", color: "#f97316" },
  { name: "forest", label: "Forest", color: "#22c55e" },
  { name: "purple", label: "Purple", color: "#a855f7" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("dark");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("velixa-theme") || "dark";
    setTheme(saved);
    document.body.className = `antialiased theme-${saved}`;
  }, []);

  function applyTheme(name: string) {
    setTheme(name);
    setOpen(false);
    localStorage.setItem("velixa-theme", name);
    document.body.className = `antialiased theme-${name}`;
  }

  const current = THEMES.find((t) => t.name === theme)!;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 btn btn-ghost text-[13px] py-1.5 px-3">
        <span className="w-3 h-3 rounded-full" style={{ background: current.color }} />
        <span className="hidden sm:block">{current.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-10 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-2 flex flex-col gap-1 z-50 min-w-[120px] shadow-xl">
          {THEMES.map((t) => (
            <button key={t.name} onClick={() => applyTheme(t.name)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${theme === t.name ? "bg-[var(--surface2)] text-white" : "text-[var(--muted)] hover:text-white hover:bg-[var(--surface2)]"}`}>
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.color }} />
              {t.label}
              {theme === t.name && <span className="ml-auto text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}