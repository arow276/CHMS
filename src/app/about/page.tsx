import Link from "next/link";
import { Heart, Users, Eye, Shield, BookOpen, ChevronRight } from "lucide-react";

export default function AboutPage() {
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
            <Link href="/pricing" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:block">Pricing</Link>
            <Link href="/about" className="text-sm text-white font-medium hidden sm:block">About</Link>
            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-full bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[300px] h-[300px] rounded-full bg-red-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 mb-8">
            <Heart className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">Our Story</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Built by people who{" "}
            <span className="bg-gradient-to-r from-amber-400 via-red-400 to-amber-500 bg-clip-text text-transparent">
              love the church
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            We&apos;ve been pastors, ministry leaders, and volunteers. We know the
            pain of losing someone through the cracks. Shepherd exists because
            every church deserves tools that care about people as much as they do.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">
                Our Mission
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Church management software has existed for decades, but it was
                built with an enterprise mindset — databases, spreadsheets,
                and forms. People became rows. Relationships became foreign keys.
              </p>
              <p className="text-zinc-400 leading-relaxed mb-4">
                We believe there&apos;s a better way. Shepherd is the first
                <strong className="text-zinc-200"> church relationship system</strong> —
                built from the ground up to understand that ministry is about
                connection, not data entry.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                Our mission is to help every church know their people deeply,
                respond to needs proactively, and never let someone drift away
                without anyone noticing.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: "1,200+", label: "Churches on Waitlist" },
                { number: "75", label: "Free Member Limit" },
                { number: "5", label: "Warmth Levels" },
                { number: "9", label: "Platform Connectors" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-center"
                >
                  <div className="text-2xl font-bold text-amber-400 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-xs text-zinc-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              What We Believe
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
              These values shape every feature we build and every decision we make.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Heart className="w-5 h-5 text-red-400" />,
                title: "People First",
                description:
                  "Software should serve relationships, not the other way around. Every feature starts with the question: does this help a pastor care for their people?",
              },
              {
                icon: <Eye className="w-5 h-5 text-amber-400" />,
                title: "Proactive, Not Reactive",
                description:
                  "The best care happens before a crisis. Shepherd surfaces insights early — cooling trends, missed connections, growth opportunities — so you can act before it's too late.",
              },
              {
                icon: <Users className="w-5 h-5 text-blue-400" />,
                title: "Built for Every Church",
                description:
                  "Whether you're 30 people in a living room or 3,000 across campuses, Shepherd scales with you. Our free tier isn't a demo — it's a genuine tool for small churches.",
              },
              {
                icon: <Shield className="w-5 h-5 text-green-400" />,
                title: "Privacy & Trust",
                description:
                  "Church data is sacred. We use bank-level encryption, never sell data, and give churches full control over their information. Your congregation's data belongs to you.",
              },
              {
                icon: <BookOpen className="w-5 h-5 text-purple-400" />,
                title: "Simple by Design",
                description:
                  "Ministry leaders are busy. Shepherd should feel like talking to a knowledgeable assistant, not wrestling with enterprise software. If it takes training, we've failed.",
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                ),
                title: "Warmth Over Metrics",
                description:
                  "Engagement isn't a KPI — it's a signal of belonging. Our warmth system captures the nuance of human connection, not just attendance checkboxes.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-base font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Story */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Why We Built Shepherd
            </h2>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-8 sm:p-10">
            <blockquote className="text-lg text-zinc-300 leading-relaxed mb-6">
              &ldquo;I was a youth pastor for six years. Every Monday, I&apos;d open
              our church management system and scroll through names, trying to
              remember who I hadn&apos;t seen in a while. One day, I realized a
              family had stopped coming three months ago — and no one had
              noticed. They were going through a divorce.
            </blockquote>
            <blockquote className="text-lg text-zinc-300 leading-relaxed mb-6">
              That&apos;s the moment I knew church software was broken. It could
              tell me their mailing address, but not that they were hurting.
              It tracked their giving, but not their connection.
            </blockquote>
            <blockquote className="text-lg text-zinc-300 leading-relaxed mb-8">
              Shepherd is the tool I wish I&apos;d had. It watches over your
              congregation the way a good shepherd watches over a flock — not
              with spreadsheets, but with genuine awareness.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                S
              </div>
              <div>
                <div className="text-sm font-semibold">The Shepherd Team</div>
                <div className="text-xs text-zinc-500">Pastors, builders, and believers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
            Ready to know your people?
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join the growing community of churches choosing relationships over records.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-amber-500 text-zinc-950 font-semibold text-lg hover:bg-amber-400 transition-colors"
            >
              View Plans
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-zinc-700 text-zinc-300 font-medium hover:border-zinc-500 transition-colors"
            >
              See Features
            </Link>
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
