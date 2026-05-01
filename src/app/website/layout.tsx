import Link from "next/link";
import { ensureChurch } from "@/lib/assistant/runner";
import { computeTheme } from "@/lib/website/theme";

export const dynamic = "force-dynamic";

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const church = await ensureChurch();
  const theme = computeTheme(church);

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh" }}>
      {/* Top banner: this is "your church website" preview */}
      <div
        className="text-xs px-4 py-2 text-center"
        style={{ background: theme.primarySoft, color: theme.text }}
      >
        <strong>Preview</strong> — this is exactly what people will see when they visit your website.{" "}
        <Link href="/brand" className="underline">Edit brand</Link> ·{" "}
        <Link href="/home" className="underline">Back to admin</Link>
      </div>

      {/* Site header */}
      <header
        className="sticky top-0 z-20 backdrop-blur"
        style={{
          background: `${theme.bg}cc`,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-4 gap-4">
          <Link href="/website" className="flex items-center gap-3">
            {church.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={church.logoUrl}
                alt={`${church.name} logo`}
                className="h-10 w-10 rounded-lg object-contain"
              />
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg font-bold text-lg"
                style={{ background: theme.primary, color: theme.onPrimary }}
              >
                {church.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-bold leading-none text-lg">{church.name}</p>
              {church.tagline && (
                <p className="text-xs" style={{ color: theme.muted }}>
                  {church.tagline}
                </p>
              )}
            </div>
          </Link>
          <nav className="hidden sm:flex items-center gap-6">
            <Link href="/website" className="text-sm hover:opacity-70">Home</Link>
            <Link href="/website/events" className="text-sm hover:opacity-70">What&rsquo;s on</Link>
            <Link href="/website/serve" className="text-sm hover:opacity-70">Serve</Link>
            <Link href="/website/visit" className="text-sm hover:opacity-70">Visit</Link>
            <Link
              href="/website/events"
              className="rounded-full px-4 py-2 text-sm font-semibold"
              style={{ background: theme.primary, color: theme.onPrimary }}
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer
        className="mt-20 px-5 py-12"
        style={{ borderTop: `1px solid ${theme.border}`, background: theme.primarySoft }}
      >
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <p className="font-bold text-lg">{church.name}</p>
            {church.tagline && <p style={{ color: theme.muted }}>{church.tagline}</p>}
          </div>
          <div>
            <p className="font-semibold mb-2">Visit</p>
            {church.address && <p>{church.address}</p>}
            {(church.city || church.state) && (
              <p>{[church.city, church.state, church.zip].filter(Boolean).join(", ")}</p>
            )}
            {church.serviceTimes && (
              <p className="mt-2" style={{ color: theme.muted }}>
                {church.serviceTimes}
              </p>
            )}
          </div>
          <div>
            <p className="font-semibold mb-2">Get in touch</p>
            {church.phone && <p>{church.phone}</p>}
            {church.email && (
              <p>
                <a href={`mailto:${church.email}`} className="underline">
                  {church.email}
                </a>
              </p>
            )}
            <div className="mt-3 flex gap-3">
              {church.facebookUrl && (
                <a href={church.facebookUrl} target="_blank" rel="noreferrer" className="underline">
                  Facebook
                </a>
              )}
              {church.instagramUrl && (
                <a href={church.instagramUrl} target="_blank" rel="noreferrer" className="underline">
                  Instagram
                </a>
              )}
              {church.youtubeUrl && (
                <a href={church.youtubeUrl} target="_blank" rel="noreferrer" className="underline">
                  YouTube
                </a>
              )}
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-xs" style={{ color: theme.muted }}>
          © {new Date().getFullYear()} {church.name}
        </p>
      </footer>
    </div>
  );
}
