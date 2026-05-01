import { ensureChurch } from "@/lib/assistant/runner";
import { computeTheme } from "@/lib/website/theme";

export const dynamic = "force-dynamic";

export default async function PublicVisitPage() {
  const church = await ensureChurch();
  const theme = computeTheme(church);
  const fullAddress = [church.address, church.city, church.state, church.zip]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Plan a visit</h1>
      <p className="mt-2 text-lg" style={{ color: theme.muted }}>
        We&rsquo;d love to see you. Here&rsquo;s everything you need.
      </p>

      <dl className="mt-10 space-y-6">
        {church.serviceTimes && (
          <Row label="When we gather" value={church.serviceTimes} theme={theme} />
        )}
        {fullAddress && <Row label="Where to find us" value={fullAddress} theme={theme} />}
        {church.phone && (
          <Row
            label="Phone"
            value={
              <a href={`tel:${church.phone}`} className="underline">
                {church.phone}
              </a>
            }
            theme={theme}
          />
        )}
        {church.email && (
          <Row
            label="Email"
            value={
              <a href={`mailto:${church.email}`} className="underline">
                {church.email}
              </a>
            }
            theme={theme}
          />
        )}
      </dl>

      {church.about && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-3">About us</h2>
          <p className="leading-relaxed whitespace-pre-line">{church.about}</p>
        </section>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  theme,
}: {
  label: string;
  value: React.ReactNode;
  theme: { border: string; muted: string };
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ border: `1px solid ${theme.border}` }}
    >
      <dt className="text-xs uppercase tracking-wider" style={{ color: theme.muted }}>
        {label}
      </dt>
      <dd className="mt-1 text-lg">{value}</dd>
    </div>
  );
}
