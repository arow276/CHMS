"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Church, Users, Shield, Zap, ArrowRight } from "lucide-react";
import { PLANS, type PlanKey } from "@/lib/plans";

export default function PricingPage() {
  const [interval, setInterval] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(plan: PlanKey) {
    if (plan === "starter") {
      window.location.href = "/login";
      return;
    }

    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch {
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  const planEntries = Object.entries(PLANS) as [PlanKey, (typeof PLANS)[PlanKey]][];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight">Shepherd</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/features" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:block">Features</Link>
            <Link href="/pricing" className="text-sm text-white font-medium hidden sm:block">Pricing</Link>
            <Link href="/about" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:block">About</Link>
            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-full bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 mb-6">
            <Church className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">Simple, transparent pricing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Plans that grow with{" "}
            <span className="bg-gradient-to-r from-amber-400 via-red-400 to-amber-500 bg-clip-text text-transparent">
              your church
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Start free with your first 75 members. Upgrade when you need
            warmth analytics, AI insights, and tools for a growing congregation.
          </p>

          {/* Interval toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full border border-zinc-800 bg-zinc-950">
            <button
              onClick={() => setInterval("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                interval === "monthly"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                interval === "yearly"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Yearly
              <span className="ml-1.5 text-xs text-amber-400 font-semibold">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {planEntries.map(([key, plan]) => {
            const price = interval === "yearly" ? plan.yearlyPrice / 12 : plan.monthlyPrice;
            const isPopular = "popular" in plan && plan.popular;

            return (
              <div
                key={key}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  isPopular
                    ? "border-2 border-amber-500/40 bg-amber-500/[0.03]"
                    : "border border-zinc-800 bg-zinc-950"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-zinc-950 text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    {key === "starter" && <Users className="w-5 h-5 text-zinc-400" />}
                    {key === "growth" && <Zap className="w-5 h-5 text-amber-400" />}
                    {key === "pro" && <Shield className="w-5 h-5 text-red-400" />}
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-zinc-500">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">
                      ${Math.round(price)}
                    </span>
                    <span className="text-zinc-500 text-sm">/month</span>
                  </div>
                  {interval === "yearly" && plan.yearlyPrice > 0 && (
                    <p className="text-xs text-zinc-600 mt-1">
                      ${plan.yearlyPrice}/year, billed annually
                    </p>
                  )}
                  {plan.monthlyPrice === 0 && (
                    <p className="text-xs text-amber-500/70 mt-1">Free forever</p>
                  )}
                </div>

                <button
                  onClick={() => handleCheckout(key)}
                  disabled={loading === key}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all mb-8 flex items-center justify-center gap-2 ${
                    isPopular
                      ? "bg-amber-500 text-zinc-950 hover:bg-amber-400"
                      : key === "pro"
                        ? "bg-zinc-800 text-white hover:bg-zinc-700"
                        : "border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === key ? (
                    "Redirecting..."
                  ) : key === "starter" ? (
                    <>Get Started Free</>
                  ) : (
                    <>
                      Start 14-Day Trial
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => {
                    const isHeading = feature.endsWith(":");
                    return (
                      <li
                        key={feature}
                        className={`flex items-start gap-2.5 text-sm ${
                          isHeading ? "text-zinc-400 font-medium pt-2" : "text-zinc-400"
                        }`}
                      >
                        {!isHeading && (
                          <Check className={`w-4 h-4 mt-0.5 shrink-0 ${
                            isPopular ? "text-amber-400" : "text-zinc-600"
                          }`} />
                        )}
                        <span>{feature}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-24 border-t border-zinc-800/50 pt-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I switch plans later?",
                a: "Absolutely. You can upgrade or downgrade at any time. When upgrading, you'll be prorated for the remainder of your billing cycle. When downgrading, changes take effect at the end of your current period.",
              },
              {
                q: "Is there a contract or commitment?",
                a: "No long-term contracts. Monthly plans can be canceled anytime. Yearly plans are billed annually but you can cancel renewal at any time.",
              },
              {
                q: "What happens when I exceed my member limit?",
                a: "We'll notify you when you're approaching your limit. You won't lose access to existing data — you just won't be able to add new members until you upgrade.",
              },
              {
                q: "Do you offer discounts for churches?",
                a: "Our Starter plan is free forever, specifically designed for smaller congregations. We also offer special pricing for church plants and non-profit organizations — reach out to us.",
              },
              {
                q: "Can I import data from my current system?",
                a: "Yes. Shepherd supports CSV imports on all plans. Growth and Pro plans include direct import connectors for popular platforms like Planning Center, Breeze, CCB, and more.",
              },
              {
                q: "How does the 14-day trial work?",
                a: "You get full access to your chosen plan's features for 14 days. No charge until the trial ends. Cancel anytime during the trial and you won't be billed.",
              },
            ].map((faq) => (
              <div key={faq.q} className="border border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              Not sure which plan is right?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
              Start with Starter for free, explore the features, and upgrade when
              your church is ready. No pressure, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-zinc-950 font-semibold hover:bg-amber-400 transition-colors"
              >
                Start Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:hello@shepherd.church"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-700 text-zinc-300 font-medium hover:border-zinc-500 transition-colors"
              >
                Talk to Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Shepherd</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                People, not paperwork.<br />Relationships, not records.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Product</h4>
              <div className="space-y-2">
                <Link href="/features" className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Features</Link>
                <Link href="/pricing" className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Pricing</Link>
                <Link href="/login" className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Sign In</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Company</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors">About</Link>
                <a href="mailto:hello@shepherd.church" className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Privacy Policy</a>
                <a href="#" className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-800/50 pt-6 text-center">
            <p className="text-xs text-zinc-600">&copy; {new Date().getFullYear()} Shepherd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
