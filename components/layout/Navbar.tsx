"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (p: string) => pathname === p;

  return (
    <nav className="sticky top-0 z-50 border-b border-[#2a2a3a] bg-[rgba(10,10,15,0.85)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.jpeg" alt="Velixa" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-display font-bold text-lg text-white">Velixa</span>
          <span className="badge badge-accent hidden sm:inline">Beta</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { href: "/", label: "Home" },
            { href: "/pricing", label: "Pricing" },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={`px-4 py-2 rounded-lg text-[14px] transition-colors ${isActive(item.href) ? "text-white bg-[#1a1a24]" : "text-[#7a7a9a] hover:text-white hover:bg-[#1a1a24]"}`}>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />

          {session ? (
            <>
              <Link href="/dashboard" className="btn btn-secondary text-[13px] py-2 px-4 hidden sm:flex">
                Dashboard
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })}
                className="btn btn-ghost text-[13px] py-2 px-3">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost text-[13px] py-2 px-4 hidden sm:flex">
                Sign in
              </Link>
              <Link href="/signup" className="btn btn-primary text-[13px] py-2 px-4">
                Get Started
              </Link>
            </>
          )}

          {/* Mobile menu */}
          <button className="md:hidden btn btn-ghost p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#2a2a3a] bg-[#111118] px-4 py-3 flex flex-col gap-2">
          <Link href="/" className="text-[14px] text-[#a0a0c0] py-2" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/pricing" className="text-[14px] text-[#a0a0c0] py-2" onClick={() => setMenuOpen(false)}>Pricing</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="text-[14px] text-[#a0a0c0] py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-left text-[14px] text-[#ef4444] py-2">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-[14px] text-[#a0a0c0] py-2" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link href="/signup" className="text-[14px] text-[#6c63ff] py-2 font-semibold" onClick={() => setMenuOpen(false)}>Get Started Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}