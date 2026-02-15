import { GraphVisualization, DatabaseTable } from "@/components/GraphVisualization";
import { PromptDemo, NavigationDemo } from "@/components/PromptDemo";
import { WarmthSpectrum } from "@/components/WarmthSpectrum";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight">Shepherd</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/features" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:block">
              Features
            </a>
            <a href="/pricing" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:block">
              Pricing
            </a>
            <a href="/about" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:block">
              About
            </a>
            <a
              href="/pricing"
              className="text-sm font-medium px-4 py-2 rounded-full bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] rounded-full bg-red-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-xs text-amber-400 font-medium">Church Relationship System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Know your{" "}
            <span className="bg-gradient-to-r from-amber-400 via-red-400 to-amber-500 bg-clip-text text-transparent">
              people
            </span>
            ,<br />
            not just their data
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The first church relationship system that feels like talking to an
            executive assistant — not navigating a database. Understand who&apos;s
            connected, who&apos;s drifting, and who needs you this week.
          </p>

          <div className="flex items-center justify-center gap-4">
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-zinc-950 font-semibold hover:bg-amber-400 transition-colors"
            >
              Start Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="/features"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-700 text-zinc-300 font-medium hover:border-zinc-500 transition-colors"
            >
              See all features
            </a>
          </div>
        </div>
      </section>

      {/* ─── The Problem ─── */}
      <section id="problem" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Church management was built for <span className="text-zinc-500">filing cabinets</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
              In traditional systems, people and events are disconnected pieces of
              information to file away. A name in one table, an attendance record in
              another, a donation in a third. No connection. No story. No warmth.
            </p>
          </div>

          {/* Comparison cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Traditional */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 3v18" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Church Management System</h3>
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  "People stored as rows in a database",
                  "Navigate menus to find information",
                  "Attendance is a checkbox — present or absent",
                  "\"Status\" is a dropdown: Member, Visitor, Inactive",
                  "Reports tell you what happened",
                  "You search for answers",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-zinc-500">
                    <span className="text-zinc-700 mt-0.5">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Shepherd */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-amber-400 uppercase tracking-wider">Church Relationship System</h3>
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  "People are connected nodes in a living graph",
                  "Ask questions in plain English — like a staff assistant",
                  "Engagement is a warmth signal — a full picture of connection",
                  "\"Warmth\" is computed: hot, warm, lukewarm, cool, cold",
                  "Insights tell you what's about to happen",
                  "Answers find you before you ask",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-amber-200/80">
                    <span className="text-amber-500 mt-0.5">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interface Comparison ─── */}
      <section id="interface" className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Stop navigating. Start <span className="bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent">asking</span>.
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Other systems make you hunt through menus, filters, and pages
              to find what you need. Shepherd lets you just ask — and it
              answers like a trusted executive assistant who knows everyone.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Traditional nav */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center">
                  <span className="text-zinc-500 text-xs">✕</span>
                </div>
                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">The old way</h3>
              </div>
              <NavigationDemo />
            </div>

            {/* Prompt interface */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-400 text-xs">✦</span>
                </div>
                <h3 className="text-sm font-medium text-amber-400 uppercase tracking-wider">The Shepherd way</h3>
              </div>
              <PromptDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Graph vs. Database ─── */}
      <section id="graph" className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Relationships aren&apos;t rows.{" "}
              <span className="bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent">
                They&apos;re connections.
              </span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
              In traditional systems, Sarah is row #001. In Shepherd, Sarah is
              a person connected to a Life Group, mentoring two newcomers, leading
              worship on Sundays — and her warmth tells you she&apos;s thriving.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Database side */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">What they see: rows</h3>
              </div>
              <DatabaseTable />
              <p className="text-xs text-zinc-600 mt-3 text-center">
                Name, email, phone, status. That&apos;s it. No relationships. No story.
              </p>
            </div>

            {/* Graph side */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-medium text-amber-400 uppercase tracking-wider">What we see: a living network</h3>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.02] p-4">
                <GraphVisualization />
              </div>
              <p className="text-xs text-amber-500/60 mt-3 text-center">
                Every node is a person, group, or event. Every line is a real connection. Color tells you warmth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Warmth Section ─── */}
      <section id="warmth" className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Every person has a{" "}
              <span className="bg-gradient-to-r from-blue-400 via-amber-400 to-red-500 bg-clip-text text-transparent">
                temperature
              </span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Warmth isn&apos;t a label you assign. It&apos;s a living signal computed from
              attendance patterns, group involvement, relationship depth, and life
              events. When someone starts drifting, you&apos;ll know — before they&apos;re gone.
            </p>
          </div>

          <WarmthSpectrum />

          {/* How warmth works */}
          <div className="grid sm:grid-cols-3 gap-6 mt-16">
            <div className="rounded-xl border border-zinc-800 p-5">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold mb-1">Engagement Signals</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Attendance frequency, group participation, volunteering, event involvement — all weighted and tracked over time.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 p-5">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold mb-1">Trajectory Detection</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Not just where they are, but where they&apos;re headed. Spot cooling trends weeks before someone disappears.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 p-5">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold mb-1">Life-Aware</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Lost a loved one? New baby? Just married? Life events shift warmth context and surface pastoral care opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Anticipatory Intelligence ─── */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              It tells you what you need to know —{" "}
              <span className="bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent">
                before you ask
              </span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
              A great executive assistant doesn&apos;t wait for you to ask.
              Shepherd surfaces the things that matter most, right when they matter.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              {
                icon: "🔔",
                title: "Sunday Follow-Up",
                body: "3 first-time visitors attended yesterday. None have been contacted yet. Here are their names and who invited them.",
              },
              {
                icon: "📉",
                title: "Cooling Alert",
                body: "Tom Wallace hasn't been seen in 4 weeks and recently experienced a family loss. This may need pastoral attention.",
              },
              {
                icon: "🌱",
                title: "Growth Opportunity",
                body: "Sarah Chen has visited 4 Sundays in a row but isn't connected to a group yet. She'd be a great fit for the Tuesday women's study.",
              },
              {
                icon: "👥",
                title: "Group Health",
                body: "The Thursday Life Group has lost 3 of 8 members in the last month. Overall group warmth dropped from 74 to 51.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 hover:border-amber-500/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{card.icon}</span>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200 mb-1">{card.title}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">{card.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section id="cta" className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-3xl" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
              Your people deserve more<br />than a spreadsheet
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Start free with up to 75 members. No credit card required.
              Upgrade when you need AI insights, warmth analytics, and more.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-amber-500 text-zinc-950 font-semibold text-lg hover:bg-amber-400 transition-colors"
              >
                See Plans &amp; Pricing
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="/about"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-zinc-700 text-zinc-300 font-medium hover:border-zinc-500 transition-colors"
              >
                Our Story
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
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
                <a href="/features" className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Features</a>
                <a href="/pricing" className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Pricing</a>
                <a href="/login" className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Sign In</a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Company</h4>
              <div className="space-y-2">
                <a href="/about" className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors">About</a>
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
            <p className="text-xs text-zinc-600">&copy; 2025 Shepherd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
