/**
 * Compute a complete, accessible website theme from just two brand colors.
 *
 * The 75-yr-old admin only ever provides primary + accent. Everything else
 * (button hovers, light/dark variants, contrast text) is derived here.
 */

export type WebsiteTheme = {
  primary: string;
  accent: string;
  bg: string;
  text: string;
  primarySoft: string;
  accentSoft: string;
  border: string;
  muted: string;
  onPrimary: string;
  onAccent: string;
};

export function computeTheme(input: {
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
}): WebsiteTheme {
  const primary = input.primaryColor;
  const accent = input.accentColor;
  const bg = input.bgColor;
  const text = input.textColor;
  return {
    primary,
    accent,
    bg,
    text,
    primarySoft: hexWithAlpha(primary, 0.08),
    accentSoft: hexWithAlpha(accent, 0.08),
    border: hexWithAlpha(text, 0.12),
    muted: hexWithAlpha(text, 0.6),
    onPrimary: bestContrast(primary),
    onAccent: bestContrast(accent),
  };
}

function hexWithAlpha(hex: string, alpha: number) {
  // We use rgba so it composites well over arbitrary backgrounds.
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexToRgb(hex: string) {
  const m = hex.replace("#", "");
  const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function bestContrast(bgHex: string) {
  // WCAG-aware: pick black or white depending on luminance.
  return relativeLuminance(bgHex) > 0.5 ? "#0F172A" : "#FFFFFF";
}
