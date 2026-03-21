"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", { ...form, redirect: false });
      if (res?.error) toast.error("Invalid email or password");
      else { toast.success("Welcome back!"); router.push("/dashboard"); }
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setGLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#00d4aa] flex items-center justify-center text-white font-bold font-display">S</div>
        <span className="font-display font-bold text-xl text-white">Velixa</span>
      </Link>

      <div className="w-full max-w-md glow-card p-8 fade-up">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-[#7a7a9a] text-[14px] mb-8">Sign in to your account</p>

        <button onClick={handleGoogle} disabled={gLoading}
          className="btn btn-secondary w-full justify-center py-3 mb-6 gap-3">
          {gLoading ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-[#2a2a3a]"/>
          <span className="text-[11px] text-[#3a3a5a] font-mono">OR</span>
          <div className="h-px flex-1 bg-[#2a2a3a]"/>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] text-[#7a7a9a] mb-2 font-mono uppercase tracking-wider">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-[12px] text-[#7a7a9a] mb-2 font-mono uppercase tracking-wider">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input" placeholder="••••••••" required />
          </div>
          <div className="text-right">
            <Link href="/forgot-password" className="text-[12px] text-[#6c63ff] hover:underline">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-3">
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#2a2a3a] text-center">
          <p className="text-[13px] text-[#7a7a9a]">No account?{" "}
            <Link href="/signup" className="text-[#6c63ff] hover:underline font-medium">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
