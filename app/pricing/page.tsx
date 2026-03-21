"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PLANS } from "@/lib/spreadsheet-utils";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(planName: string, price: number) {
    if (!session) { toast.error("Sign in first!"); router.push("/login"); return; }
    if (price === 0) { router.push("/signup"); return; }

    setLoading(planName);
    try {
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) { toast.error(order.error || "Payment setup failed"); return; }

      // Load Razorpay script
      await loadRazorpay();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Velixa",
        description: `${planName} Plan — Monthly`,
        order_id: order.orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, plan: planName }),
          });
          if (verifyRes.ok) {
            toast.success(`🎉 Upgraded to ${planName}! Enjoy unlimited sheets.`);
            router.push("/dashboard");
          } else { toast.error("Payment verification failed"); }
        },
        prefill: { email: session.user?.email ?? "", name: session.user?.name ?? "" },
        theme: { color: "#6c63ff" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Payment failed. Try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-16">

        {/* Header */}
        <div className="text-center mb-16 fade-up">
          <span className="badge badge-accent mb-4 inline-block">Pricing</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Simple, honest pricing
          </h1>
          <p className="text-[#7a7a9a] text-lg max-w-xl mx-auto">
            Start free. Upgrade when you need more. All prices in INR.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 fade-up-delay-1">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`glow-card p-7 flex flex-col ${plan.highlighted ? "plan-highlight" : ""}`}>
              {plan.highlighted && (
                <div className="text-center mb-4">
                  <span className="badge badge-accent">Most Popular</span>
                </div>
              )}
              <h2 className="font-display text-xl font-bold text-white mb-1">{plan.name}</h2>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-4xl font-extrabold text-white">
                  {plan.price === 0 ? "Free" : `₹${plan.price}`}
                </span>
                {plan.price > 0 && <span className="text-[#7a7a9a] text-[14px]">/month</span>}
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-[#a0a0c0]">
                    <span className="text-[#00d4aa] mt-0.5 flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.name, plan.price)}
                disabled={loading === plan.name}
                className={`btn w-full justify-center py-3 ${plan.highlighted ? "btn-primary" : "btn-secondary"}`}
              >
                {loading === plan.name ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Processing…
                  </span>
                ) : plan.price === 0 ? (
                  session ? "Current Plan" : "Get Started Free"
                ) : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="fade-up-delay-2">
          <h2 className="font-display text-2xl font-bold text-center text-white mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { q: "Is the free plan really free?", a: "Yes! 5 AI-generated sheets per month, CSV export, and all templates — no credit card needed." },
              { q: "What's the difference in export?", a: "Free plan gets CSV. Pro and Team get XLSX (Excel), CSV, and PDF export." },
              { q: "Can I cancel anytime?", a: "Yes, you can cancel at any time. Your plan stays active until the end of the billing period." },
              { q: "Is my data secure?", a: "Yes. Sheets are stored securely and only accessible by your account. We never share your data." },
              { q: "Which payment methods are accepted?", a: "All major UPI apps (GPay, PhonePe, Paytm), credit/debit cards, net banking via Razorpay." },
              { q: "Do I get a receipt?", a: "Yes, Razorpay sends a payment receipt to your email after every successful transaction." },
            ].map((item) => (
              <div key={item.q} className="glow-card p-5">
                <h3 className="font-medium text-white text-[14px] mb-2">{item.q}</h3>
                <p className="text-[13px] text-[#7a7a9a] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16 fade-up">
          <p className="text-[#7a7a9a] mb-4 text-[14px]">Still have questions?</p>
          <Link href="/" className="btn btn-primary py-3 px-8 text-[15px]">Try it free — no signup needed →</Link>
        </div>
      </main>
      <Footer />

      {/* Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}

function loadRazorpay(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}
