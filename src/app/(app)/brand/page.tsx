import Link from "next/link";
import { ensureChurch } from "@/lib/assistant/runner";
import { updateBrand } from "@/lib/actions/brand";

export const dynamic = "force-dynamic";

export default async function BrandPage() {
  const church = await ensureChurch();

  return (
    <div className="easy max-w-4xl mx-auto pb-24 space-y-8">
      <div>
        <h1 className="text-white font-bold">Your church&rsquo;s brand</h1>
        <p className="text-zinc-400 mt-1">
          This is the only place you set your logo, colors, and contact info.
          Everything — your website, app, signup pages, and even printed
          handouts — uses what you put here. No copy-pasting, no guesswork.
        </p>
      </div>

      {/* Live preview band — always visible at the top so the user can see */}
      {/* every change reflected immediately as they type. */}
      <BrandPreview church={church} />

      <form action={updateBrand} className="space-y-8">
        <Section title="Identity">
          <Field label="Church name" required>
            <input
              name="name"
              defaultValue={church.name}
              required
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
            />
          </Field>
          <Field label="Tagline" hint="A short, friendly subtitle. (Optional)">
            <input
              name="tagline"
              defaultValue={church.tagline ?? ""}
              placeholder="A place to belong."
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
            />
          </Field>
          <Field label="Logo URL" hint="Paste a public link to your logo image. We'll resize it.">
            <input
              name="logoUrl"
              type="url"
              defaultValue={church.logoUrl ?? ""}
              placeholder="https://…"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
            />
          </Field>
          <Field label="Mission statement (optional)">
            <textarea
              name="mission"
              defaultValue={church.mission ?? ""}
              rows={3}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-white"
              placeholder="Loving God. Loving our neighbors. Building one another up."
            />
          </Field>
          <Field label="About us (optional)">
            <textarea
              name="about"
              defaultValue={church.about ?? ""}
              rows={4}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-white"
              placeholder="A few paragraphs about your church's story, beliefs, and people."
            />
          </Field>
        </Section>

        <Section title="Colors" hint="These flow into your website, app, and every signup page.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorField name="primaryColor" label="Primary color" value={church.primaryColor} />
            <ColorField name="accentColor" label="Accent color" value={church.accentColor} />
            <ColorField name="bgColor" label="Page background" value={church.bgColor} />
            <ColorField name="textColor" label="Body text" value={church.textColor} />
          </div>
        </Section>

        <Section title="Where to find you">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Address">
              <input
                name="address"
                defaultValue={church.address ?? ""}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
              />
            </Field>
            <Field label="City">
              <input
                name="city"
                defaultValue={church.city ?? ""}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
              />
            </Field>
            <Field label="State">
              <input
                name="state"
                defaultValue={church.state ?? ""}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
              />
            </Field>
            <Field label="ZIP">
              <input
                name="zip"
                defaultValue={church.zip ?? ""}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
              />
            </Field>
            <Field label="Phone">
              <input
                name="phone"
                type="tel"
                defaultValue={church.phone ?? ""}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
              />
            </Field>
            <Field label="Email">
              <input
                name="email"
                type="email"
                defaultValue={church.email ?? ""}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
              />
            </Field>
            <Field label="Service times (free text)">
              <input
                name="serviceTimes"
                defaultValue={church.serviceTimes ?? ""}
                placeholder="Sundays at 9am & 11am"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
              />
            </Field>
            <Field label="Website (existing, if any)">
              <input
                name="websiteUrl"
                type="url"
                defaultValue={church.websiteUrl ?? ""}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
              />
            </Field>
          </div>
        </Section>

        <Section title="Social links">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Facebook URL">
              <input
                name="facebookUrl"
                type="url"
                defaultValue={church.facebookUrl ?? ""}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
              />
            </Field>
            <Field label="Instagram URL">
              <input
                name="instagramUrl"
                type="url"
                defaultValue={church.instagramUrl ?? ""}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
              />
            </Field>
            <Field label="YouTube URL">
              <input
                name="youtubeUrl"
                type="url"
                defaultValue={church.youtubeUrl ?? ""}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
              />
            </Field>
          </div>
        </Section>

        <Section title="Public website">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="publishSite"
              defaultChecked={church.publishSite}
              className="h-5 w-5 mt-1 rounded"
              style={{ accentColor: church.accentColor }}
            />
            <span className="text-zinc-200 leading-snug">
              Publish our church&rsquo;s website. <br />
              <span className="text-zinc-500 text-sm">
                When this is on, anyone with the link can see your gatherings, sign-ups,
                volunteer requests, and contact info — all styled with your brand.
              </span>
            </span>
          </label>
        </Section>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            className="rounded-xl px-6 py-3 font-semibold text-zinc-950"
            style={{ backgroundColor: church.accentColor }}
          >
            Save brand
          </button>
          <Link
            href="/website"
            className="rounded-xl px-6 py-3 font-semibold border border-zinc-700 text-zinc-200 hover:bg-zinc-800"
          >
            See my website →
          </Link>
        </div>
      </form>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
      <legend className="px-2 text-sm uppercase tracking-wider text-zinc-400">{title}</legend>
      {hint && <p className="text-sm text-zinc-500 -mt-1">{hint}</p>}
      {children}
    </fieldset>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-zinc-300 mb-1">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </span>
      {children}
      {hint && <span className="block mt-1 text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

function ColorField({
  name,
  label,
  value,
}: {
  name: string;
  label: string;
  value: string;
}) {
  return (
    <label className="block rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
      <span className="block text-sm text-zinc-300 mb-2">{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="color"
          name={name}
          defaultValue={value}
          className="h-12 w-16 rounded-lg border border-zinc-700 bg-transparent cursor-pointer"
          aria-label={label}
        />
        <span className="text-sm text-zinc-400 font-mono">{value}</span>
      </div>
    </label>
  );
}

function BrandPreview({
  church,
}: {
  church: {
    name: string;
    tagline: string | null;
    logoUrl: string | null;
    primaryColor: string;
    accentColor: string;
    bgColor: string;
    textColor: string;
  };
}) {
  return (
    <div
      className="rounded-3xl overflow-hidden border-2"
      style={{
        borderColor: church.primaryColor,
      }}
    >
      <div
        className="p-6 sm:p-8"
        style={{
          background: `linear-gradient(135deg, ${church.primaryColor}, ${church.accentColor})`,
          color: "white",
        }}
      >
        <div className="flex items-center gap-4">
          {church.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={church.logoUrl}
              alt={`${church.name} logo`}
              className="h-14 w-14 rounded-xl bg-white/15 object-contain"
            />
          ) : (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 text-xl font-bold"
              aria-hidden
            >
              {church.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-bold text-2xl tracking-tight">{church.name}</p>
            {church.tagline && <p className="opacity-90">{church.tagline}</p>}
          </div>
        </div>
      </div>
      <div
        className="p-5 text-sm"
        style={{ background: church.bgColor, color: church.textColor }}
      >
        <p>This is what your website&rsquo;s header will look like. As you change things below, this updates when you save.</p>
      </div>
    </div>
  );
}
