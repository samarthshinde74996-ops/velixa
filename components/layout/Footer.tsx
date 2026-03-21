import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#2a2a3a] bg-[#111118] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#00d4aa] flex items-center justify-center text-white font-bold text-sm font-display">S</div>
              <span className="font-display font-bold text-lg text-white">Velixa</span>
            </div>
            <p className="text-[13px] text-[#7a7a9a] leading-relaxed">AI-powered spreadsheet generator. Describe it, we build it.</p>
          </div>
          <div>
            <h4 className="text-[12px] text-[#7a7a9a] uppercase tracking-wider font-mono mb-4">Product</h4>
            <div className="flex flex-col gap-2">
              {[{ href: "/", l: "Generator" }, { href: "/pricing", l: "Pricing" }, { href: "/dashboard", l: "Dashboard" }].map((i) => (
                <Link key={i.href} href={i.href} className="text-[13px] text-[#a0a0c0] hover:text-white transition-colors">{i.l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[12px] text-[#7a7a9a] uppercase tracking-wider font-mono mb-4">Account</h4>
            <div className="flex flex-col gap-2">
              {[{ href: "/login", l: "Sign In" }, { href: "/signup", l: "Sign Up" }].map((i) => (
                <Link key={i.href} href={i.href} className="text-[13px] text-[#a0a0c0] hover:text-white transition-colors">{i.l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[12px] text-[#7a7a9a] uppercase tracking-wider font-mono mb-4">Legal</h4>
            <div className="flex flex-col gap-2">
              {["Privacy Policy", "Terms of Service"].map((l) => (
                <span key={l} className="text-[13px] text-[#3a3a5a] cursor-default">{l}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[#2a2a3a] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[#3a3a5a] font-mono">© 2025 Velixa. Built for India 🇮🇳</p>
          <p className="text-[12px] text-[#3a3a5a] font-mono">Powered by samarth · Made with ❤️</p>
        </div>
      </div>
    </footer>
  );
}
