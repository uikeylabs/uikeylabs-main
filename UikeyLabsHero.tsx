"use client";

import React, { useState, useEffect } from "react";

interface WhatsAppContext {
  industry: string;
  packageInterest: string;
}

export default function UikeyLabsHeroAndWidget() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("Doctor / Clinic");
  const [isWidgetOpen, setIsWidgetOpen] = useState<boolean>(false);
  const [leadName, setLeadName] = useState<string>("");
  const [leadBusiness, setLeadBusiness] = useState<string>("Doctor / Clinic");

  // Official UIKEY LABS Configuration
  const WHATSAPP_NUMBER = "918770912734"; // Official UIKEY LABS WhatsApp Business number (+91 8770912734)
  const OFFICIAL_EMAIL = "contact@uikeylabs.com";

  const industries = [
    { label: "Kirana Shop / Supermarket", metric: "+280% Daily Orders", speed: "0.45s" },
    { label: "Mobile & Electronics Shop", metric: "3.2x Local Inquiries", speed: "0.46s" },
    { label: "Gym & Fitness Center", metric: "+260% New Members", speed: "0.49s" },
    { label: "Salon & Grooming Studio", metric: "+340% Bookings", speed: "0.44s" },
    { label: "Beauty Parlour & Bridal Studio", metric: "4.1x Bridal Leads", speed: "0.47s" },
    { label: "Doctor / Clinic", metric: "+310% OPD Bookings", speed: "0.48s" },
    { label: "School / Coaching", metric: "3.4x Admission Leads", speed: "0.52s" },
    { label: "Real Estate", metric: "42% Lower CPL", speed: "0.55s" },
    { label: "Cafe / Restaurant / Bakery", metric: "+240% Direct Orders", speed: "0.44s" },
    { label: "Clothing / Saree / Boutique", metric: "+290% Walk-ins", speed: "0.46s" },
    { label: "Jewellery / Hotel / Garage", metric: "3.5x High-Ticket Leads", speed: "0.50s" },
  ];

  const buildWhatsAppUrl = (customText?: string) => {
    const baseText =
      customText ||
      `Hi UIKEY LABS! 👋 I saw your FLAT 50% OFF offer on uikeylabs.com. I want a <1.0s high-converting website for my *${selectedIndustry}* business. Please share package details & demo.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(baseText)}`;
  };

  const handleWidgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Hi UIKEY LABS! 👋\n\n*Name:* ${leadName || "Business Owner"}\n*Category:* ${leadBusiness}\n*Offer Code:* UIKEY50 (FLAT 50% OFF)\n\nI want to upgrade my local business with a sub-1-second website. Let's discuss!`;
    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-sans selection:bg-cyan-400 selection:text-[#050811] relative overflow-x-hidden">
      {/* Ambient Cyber Grid & Radial Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(6, 182, 212, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-cyan-500/15 blur-[140px] rounded-full z-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-1/3 -right-32 w-[500px] h-[500px] bg-amber-500/10 blur-[150px] rounded-full z-0"
      />

      {/* TOP HIGH-URGENCY OFFER BANNER */}
      <div className="relative z-30 bg-gradient-to-r from-amber-500/20 via-cyan-500/15 to-amber-500/20 border-b border-amber-400/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-400 text-[#050811] shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse">
              🔥 FLAT 50% OFF
            </span>
            <p className="font-medium text-slate-200">
              Launch Offer for First 15 Local Businesses This Month —{" "}
              <span className="text-cyan-300 font-semibold">
                Sub-1.0s Custom Website + WhatsApp Lead Engine
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <a
              href={`mailto:${OFFICIAL_EMAIL}`}
              className="hidden md:inline-flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition-colors font-mono text-xs"
            >
              <span>✉️</span> {OFFICIAL_EMAIL}
            </a>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:text-amber-200 font-bold underline underline-offset-4 decoration-amber-400/60"
            >
              Claim 50% Slot →
            </a>
          </div>
        </div>
      </div>

      {/* STICKY GLASSMORPHIC NAVBAR */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#050811]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[#050811] font-black text-xl shadow-[0_0_25px_rgba(6,182,212,0.45)] group-hover:scale-105 transition-transform">
              U
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                UIKEY <span className="text-cyan-400">LABS</span>
              </span>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
                uikeylabs.com • Web Engineering
              </span>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#solutions" className="hover:text-cyan-400 transition-colors">
              Industry Solutions
            </a>
            <a href="#speed-architecture" className="hover:text-cyan-400 transition-colors">
              0.6s Speed Tech
            </a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">
              50% Off Packages
            </a>
            <a
              href={`mailto:${OFFICIAL_EMAIL}`}
              className="text-slate-400 hover:text-white font-mono text-xs"
            >
              {OFFICIAL_EMAIL}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#050811] font-extrabold text-xs sm:text-sm shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-all hover:-translate-y-0.5"
            >
              <span>⚡</span> Get Free Live Demo
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 lg:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* LEFT COLUMN: HIGH-CONVERTING HOOK & CTA */}
          <div className="lg:col-span-7 space-y-7">
            {/* Live Telemetry Pill */}
            <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>GOOGLE PAGE SPEED: 99/100 • AVG LOAD TIME: 0.58s</span>
            </div>

            {/* Primary Value Prop Headline (Hinglish + Enterprise Authority) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
              Slow Website Se Customers{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-200 to-amber-300">
                Lose Karna Band Karein.
              </span>{" "}
              Upgrade to{" "}
              <span className="underline decoration-amber-400/80 decoration-wavy underline-offset-8">
                &lt;1.0s
              </span>{" "}
              Web Engineering.
            </h1>

            {/* Sub-headline explaining who it's for and the ROI */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              We engineer ultra-fast, Google #1 ranking websites & automated{" "}
              <span className="text-white font-semibold">WhatsApp Lead Engines</span> for{" "}
              <span className="text-cyan-300 font-semibold">
                Doctors, Schools, Real Estate, Coaching Institutes & Cafes
              </span>
              . Turn local Google searches into daily paying clients—automatically.
            </p>

            {/* Interactive Industry Selector Pills */}
            <div className="space-y-2.5 pt-1">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                👇 Select Your Business To Preview Live Impact & Customize Offer:
              </p>
              <div className="flex flex-wrap gap-2">
                {industries.map((item) => {
                  const active = selectedIndustry === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setSelectedIndustry(item.label);
                        setLeadBusiness(item.label);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                        active
                          ? "bg-cyan-400/15 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                          : "bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dual High-Conversion CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-[#050811] font-black text-base shadow-[0_0_35px_rgba(251,191,36,0.45)] hover:shadow-[0_0_50px_rgba(251,191,36,0.75)] transition-all hover:-translate-y-0.5"
              >
                <span>💬 Claim FLAT 50% OFF for {selectedIndustry}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>

              <a
                href={`mailto:${OFFICIAL_EMAIL}?subject=Website%20Inquiry%20(${encodeURIComponent(
                  selectedIndustry
                )})%20-%20FLAT%2050%25%20OFF`}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-slate-200 font-semibold text-sm transition-all"
              >
                <span>📩</span> Email: {OFFICIAL_EMAIL}
              </a>
            </div>

            {/* Risk Reversal & Trust Micro-Copy */}
            <div className="pt-2 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span>&lt;1.0s Speed Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span>Zero Monthly Lock-in</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span>7-Day Express Delivery</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: LIVE TELEMETRY & ROI BENCHMARK CARD */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-slate-900/75 border border-cyan-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_60px_rgba(6,182,212,0.15)]">
              {/* Floating Offer Tag */}
              <div className="absolute -top-4 right-6 px-4 py-1 rounded-full bg-amber-400 text-[#050811] font-black text-xs uppercase tracking-wider shadow-lg">
                FLAT 50% OFF ACTIVE
              </div>

              <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono uppercase text-cyan-400 block">
                    LIVE BENCHMARK DIAGNOSTIC
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    {selectedIndustry} Funnel Engine
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold">
                  PASSED • CWV 100%
                </span>
              </div>

              {/* Speed Comparison Bars */}
              <div className="space-y-4 my-6">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-cyan-300 font-bold">
                      ⚡ UIKEY LABS Next-Gen Stack
                    </span>
                    <span className="text-emerald-400 font-bold">0.52 Seconds (LCP)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5">
                    <div className="h-full w-[18%] rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-400">
                      🐢 Typical Local WordPress / Wix Agency
                    </span>
                    <span className="text-rose-400 font-bold">6.40 Seconds (68% Bounce)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5">
                    <div className="h-full w-[92%] rounded-full bg-rose-500/70" />
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 my-6">
                <div className="p-4 rounded-2xl bg-[#050811]/80 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Expected Conversion Lift</span>
                  <span className="text-2xl font-black text-amber-400 mt-1 block">
                    {industries.find((i) => i.label === selectedIndustry)?.metric}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#050811]/80 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Verified Load Speed</span>
                  <span className="text-2xl font-black text-cyan-400 mt-1 block">
                    {industries.find((i) => i.label === selectedIndustry)?.speed}
                  </span>
                </div>
              </div>

              {/* Offer Summary Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-slate-900 to-amber-500/10 border border-amber-400/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 line-through block">
                    Standard Agency Fee: ₹29,999
                  </span>
                  <span className="text-lg font-black text-white">
                    Launch Offer:{" "}
                    <span className="text-amber-400">₹14,999</span>{" "}
                    <span className="text-xs font-normal text-slate-300">(All-Inclusive)</span>
                  </span>
                </div>
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#050811] font-extrabold text-xs uppercase tracking-wider transition-colors"
                >
                  Lock 50% Off
                </a>
              </div>

              <div className="mt-4 text-center text-[11px] font-mono text-slate-400">
                Direct Enterprise Desk:{" "}
                <a
                  href={`mailto:${OFFICIAL_EMAIL}`}
                  className="text-cyan-400 hover:underline"
                >
                  {OFFICIAL_EMAIL}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FLOATING WHATSAPP CONVERSION WIDGET (BOTTOM-RIGHT) */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
        {isWidgetOpen && (
          <div className="mb-3 w-[340px] sm:w-[370px] rounded-3xl bg-[#090e1c] border border-cyan-500/40 shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Widget Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#050811] text-cyan-400 font-black flex items-center justify-center text-sm border border-emerald-300/40">
                    UL
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-300 border-2 border-[#050811]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    UIKEY LABS • Growth Desk
                  </h3>
                  <p className="text-[11px] text-emerald-100">
                    Typically replies in &lt; 60 seconds
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWidgetOpen(false)}
                aria-label="Close WhatsApp Concierge"
                className="text-white/80 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            {/* Widget Body */}
            <form onSubmit={handleWidgetSubmit} className="p-5 space-y-4">
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                👋 <strong className="text-white">Namaste!</strong> Claim your{" "}
                <span className="text-amber-400 font-bold">FLAT 50% OFF</span> voucher +
                free 0.5s website mockup on WhatsApp right now.
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                  Your Name / Clinic / Brand Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dr. Sharma / Apex Academy"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050811] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                  Business Category
                </label>
                <select
                  value={leadBusiness}
                  onChange={(e) => setLeadBusiness(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050811] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  {industries.map((ind) => (
                    <option key={ind.label} value={ind.label}>
                      {ind.label}
                    </option>
                  ))}
                  <option value="Other Local Business">Other Local Business</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#050811] font-black text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <span>🚀 Start Instant WhatsApp Chat</span>
              </button>

              <div className="text-center text-[11px] text-slate-400 pt-1">
                Or email specs to{" "}
                <a
                  href={`mailto:${OFFICIAL_EMAIL}`}
                  className="text-cyan-400 hover:underline font-mono"
                >
                  {OFFICIAL_EMAIL}
                </a>
              </div>
            </form>
          </div>
        )}

        {/* Floating Trigger Button with Notification Badge */}
        <button
          type="button"
          onClick={() => setIsWidgetOpen((prev) => !prev)}
          className="group relative flex items-center gap-3 pl-4 pr-5 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[#050811] font-extrabold text-sm shadow-[0_0_35px_rgba(16,185,129,0.55)] hover:scale-105 transition-all"
        >
          <span className="absolute -top-2 -left-1 px-2 py-0.5 rounded-full bg-amber-400 text-[#050811] text-[10px] font-black uppercase tracking-wider shadow">
            50% OFF
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <span>Chat on WhatsApp</span>
        </button>
      </div>
    </div>
  );
}
