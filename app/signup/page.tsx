"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }

      // Auto sign in
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      toast.success("Account created! Welcome to Velixa 🎉");
      router.push("/dashboard");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#00d4aa] flex items-center justify-center text-white font-bold text-base font-display">S</div>
        <span className="font-display font-bold text-xl text-white">Velixa</span>
      </Link>

      <div className="w-full max-w-md glow-card p-8 fade-up">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Create your account</h1>
        <p className="text-[#7a7a9a] text-[14px] mb-2">Free forever · 5 sheets/month on free plan</p>

        {/* Plan highlight */}
        <div className="flex items-center gap-2 bg-[rgba(0,212,170,0.08)] border border-[rgba(0,212,170,0.2)] rounded-xl p-3 mb-8">
          <span className="text-[#00d4aa] text-lg">✓</span>
          <div>
            <p className="text-[13px] text-white font-medium">Free plan includes:</p>
            <p className="text-[12px] text-[#7a7a9a]">5 AI-generated sheets · CSV export · All templates</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] text-[#7a7a9a] mb-2 font-mono uppercase tracking-wider">Full Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input" placeholder="Arjun Sharma" required />
          </div>
          <div>
            <label className="block text-[12px] text-[#7a7a9a] mb-2 font-mono uppercase tracking-wider">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-[12px] text-[#7a7a9a] mb-2 font-mono uppercase tracking-wider">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input" placeholder="Min. 6 characters" required minLength={6} />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center mt-2 py-3">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating account…
              </span>
            ) : "Create free account →"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#2a2a3a] text-center">
          <p className="text-[13px] text-[#7a7a9a]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#6c63ff] hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
