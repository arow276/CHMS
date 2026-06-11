import Link from "next/link";
import {
  Heart,
  Users,
  BarChart3,
  MessageSquare,
  Calendar,
  Upload,
  Layers,
  Bell,
  ShieldCheck,
  Sparkles,
  Home,
  Network,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function FeaturesPage() {
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
            <Link href="/features" className="text-sm text-white font-medium hidden sm:block">Features</Link>
            <Link href="/pricing" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:block">Pricing</Link>
            <Link href="/about" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:block">About</Link>
            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-full bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">Everything your church needs</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Features built for{" "}
            <span className="bg-gradient-to-r from-amber-400 via-red-400 to-amber-500 bg-clip-text text-transparent">
              real ministry
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Shepherd isn&apos;t just another database with a church skin. Every feature
            is designed around how ministry actually works — relationships,
            engagement, and proactive care.
          </p>
        </div>
      </section>

      {/* Core Feature: Warmth System */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/20 bg-red-500/5 mb-6">
              <Heart className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-red-400 font-medium">Signature Feature</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              The Warmth System
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
              A living, breathing measure of every person&apos;s connection to your
              church. Not a label you assign — a signal computed from real engagement.
            </p>
          </div>

          {/* Warmth levels */}
          <div className="grid grid-cols-5 gap-3 max-w-3xl mx-auto mb-12">
            {[
              { level: "Hot", color: "bg-red-500", textColor: "text-red-400", desc: "Deeply connected" },
              { level: "Warm", color: "bg-amber-500", textColor: "text-amber-400", desc: "Actively engaged" },
              { level: "Lukewarm", color: "bg-zinc-500", textColor: "text-zinc-400", desc: "Loosely connected" },
              { level: "Cool", color: "bg-indigo-500", textColor: "text-indigo-400", desc: "Drifting away" },
              { level: "Cold", color: "bg-blue-500", textColor: "text-blue-400", desc: "Disconnected" },
            ].map((w) => (
              <div key={w.level} className="text-center">
                <div className={`w-full h-2 rounded-full ${w.color} mb-3`} />
                <div className={`text-sm font-semibold ${w.textColor}`}>{w.level}</div>
                <div className="text-xs text-zinc-600 mt-0.5">{w.desc}</div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: <BarChart3 className="w-5 h-5 text-amber-400" />,
                title: "Engagement Scoring",
                description: "Attendance frequency, group participation, volunteering, and event involvement — all weighted, tracked, and computed into a single warmth score.",
              },
              {
                icon: <Bell className="w-5 h-5 text-amber-400" />,
                title: "Cooling Alerts",
                description: "Get notified when someone's warmth starts dropping. Catch disengagement weeks before they stop coming, so you can reach out at the right moment.",
              },
              {
                icon: <Sparkles className="w-5 h-5 text-amber-400" />,
                title: "Trajectory Detection",
                description: "See not just where someone is, but where they're headed. Upward trends, plateaus, and declines are all tracked and surfaced automatically.",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Liturgy Builder */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 mb-6">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs text-purple-400 font-medium">For Liturgical Churches</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">
                The Liturgy Builder
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-6">
                Pick any Sunday — Shepherd already knows where it falls in the
                church year: season, feast, color, lectionary cycle, even the
                Byzantine tone of the week. Choose your tradition and rite, and
                it drafts a complete, print-ready order of service with propers,
                rubrics, hymn suggestions, and an altar guild checklist.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Built on each tradition's real service books — not generic templates",
                  "A liturgical calendar engine that computes Easter, feasts, and colors for any date",
                  "Copyright-aware: quotes public-domain texts, cites licensed ones",
                  "Edit every element, then print a clean bulletin",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <span className="text-purple-400 mt-0.5">&#10095;</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                {[
                  "Episcopal (BCP 1979)",
                  "ACNA (BCP 2019)",
                  "LCMS (LSB)",
                  "ELCA (ELW)",
                  "WELS (CW21)",
                  "Roman Catholic",
                  "Eastern Orthodox",
                  "United Methodist",
                  "PC(USA)",
                  "Convergence",
                ].map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Bulletin mock */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-100 text-zinc-900 p-8 shadow-2xl" style={{ fontFamily: "Georgia, serif" }}>
              <div className="mx-auto mb-3 h-1 w-20 rounded-full bg-purple-600" />
              <div className="text-center mb-6">
                <div className="text-lg font-bold">The Holy Eucharist: Rite Two</div>
                <div className="text-xs text-zinc-600 mt-1">The Fifth Sunday in Lent · Year C</div>
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-center font-bold border-b border-zinc-300 pb-1.5 mb-3 text-zinc-700">
                The Word of God
              </div>
              <div className="space-y-2.5 text-[13px]">
                <p className="italic text-[11px]" style={{ color: "#9f1239" }}>
                  The people standing, the Celebrant says
                </p>
                <div className="grid grid-cols-[5.5rem_1fr] gap-2">
                  <span className="text-[10px] uppercase tracking-wide text-zinc-500 pt-0.5">Celebrant</span>
                  <span>Bless the Lord who forgives all our sins.</span>
                </div>
                <div className="grid grid-cols-[5.5rem_1fr] gap-2">
                  <span className="text-[10px] uppercase tracking-wide text-zinc-500 pt-0.5">People</span>
                  <span className="font-semibold">His mercy endures for ever.</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="font-semibold">The Collect of the Day</span>
                  <span className="text-[10px] text-zinc-500">BCP p. 219</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">The First Lesson</span>
                  <span className="text-[10px] text-zinc-500">Isaiah 43:16–21</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span><span className="mr-1">♪</span>Sequence Hymn</span>
                  <span className="text-[10px] text-zinc-500">H82 474</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">The Holy Gospel</span>
                  <span className="text-[10px] text-zinc-500">John 12:1–8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 mb-6">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-amber-400 font-medium">AI-Powered</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">
                Ask, don&apos;t navigate
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-6">
                Shepherd&apos;s AI assistant understands your church. Ask questions in
                plain English and get instant answers — no menus, no filters, no
                learning curve.
              </p>
              <ul className="space-y-3">
                {[
                  "\"Who hasn't been to church in 3 weeks?\"",
                  "\"Show me visitors from last month who joined a group\"",
                  "\"Which groups are losing members?\"",
                  "\"Who should I follow up with this week?\"",
                ].map((q) => (
                  <li key={q} className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <span className="text-amber-500 mt-0.5">&#10095;</span>
                    <span className="italic">{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Demo card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
                <span className="text-xs text-zinc-500 font-medium">Shepherd AI</span>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-zinc-900 p-3 text-sm text-zinc-400">
                  Who needs follow-up this week?
                </div>
                <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-4 text-sm text-zinc-300 leading-relaxed">
                  <p className="mb-3">Based on engagement patterns, I&apos;d recommend reaching out to these 4 people:</p>
                  <ul className="space-y-2 text-xs text-zinc-400">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <strong className="text-zinc-300">Tom Wallace</strong> — Absent 4 weeks, recently had a family loss
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <strong className="text-zinc-300">Maria Gonzales</strong> — Was weekly, now biweekly
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <strong className="text-zinc-300">Sarah Chen</strong> — 4 visits, not in a group yet
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <strong className="text-zinc-300">David Park</strong> — Left small group, attendance declining
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Feature Grid */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything you need to manage &amp; care
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
              From people management to event tracking, Shepherd covers the
              fundamentals — and goes far beyond them.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="w-5 h-5 text-blue-400" />,
                title: "People Management",
                description: "Comprehensive profiles with contact info, family connections, group memberships, attendance history, and warmth timeline — all in one place.",
              },
              {
                icon: <Home className="w-5 h-5 text-green-400" />,
                title: "Household Tracking",
                description: "Link family members together, track household warmth, and see the full picture of family engagement across your church.",
              },
              {
                icon: <Layers className="w-5 h-5 text-purple-400" />,
                title: "Groups & Small Groups",
                description: "Manage life groups, ministries, teams, and classes. Track group health, member participation, and identify groups that need attention.",
              },
              {
                icon: <Calendar className="w-5 h-5 text-amber-400" />,
                title: "Events & Attendance",
                description: "Schedule services, events, and meetings. Track attendance with simple check-in, and watch how it feeds into warmth scoring.",
              },
              {
                icon: <Network className="w-5 h-5 text-red-400" />,
                title: "Relationship Graph",
                description: "Visualize your church as a living network of connections — not a flat list. See how people, groups, and events are interconnected.",
              },
              {
                icon: <Upload className="w-5 h-5 text-cyan-400" />,
                title: "Import & Migration",
                description: "Migrate from Planning Center, Breeze, CCB, Elvanto, and 5 more platforms. Or import from CSV. Your data transfers seamlessly.",
              },
              {
                icon: <Bell className="w-5 h-5 text-amber-400" />,
                title: "Smart Notifications",
                description: "Automated alerts for cooling members, first-time visitors, milestone events, and pastoral care opportunities — delivered when they matter.",
              },
              {
                icon: <BarChart3 className="w-5 h-5 text-emerald-400" />,
                title: "Dashboard & Analytics",
                description: "At-a-glance church health: warmth distribution, attendance trends, group vitality, and actionable insights — not just charts.",
              },
              {
                icon: <ShieldCheck className="w-5 h-5 text-zinc-400" />,
                title: "Privacy & Security",
                description: "Bank-level encryption, role-based access controls, and GDPR-ready data handling. Your congregation's data stays safe and private.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Migrate from anywhere
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed mb-12">
            Already using a church management system? Shepherd connects directly
            with the most popular platforms for seamless data migration.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              "Planning Center",
              "Breeze",
              "Church Community Builder",
              "Elvanto",
              "Fellowship One",
              "Rock RMS",
              "Ministry Platform",
              "CSV / Excel",
              "More coming soon",
            ].map((platform) => (
              <div
                key={platform}
                className="px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-400"
              >
                {platform}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-3xl" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
              See Shepherd in action
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Start free with up to 75 members. No credit card. No commitment.
              Just better tools for the people you serve.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-amber-500 text-zinc-950 font-semibold text-lg hover:bg-amber-400 transition-colors"
              >
                View Plans
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-zinc-700 text-zinc-300 font-medium hover:border-zinc-500 transition-colors"
              >
                Our Story
              </Link>
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
