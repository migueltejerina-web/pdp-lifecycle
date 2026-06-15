/**
 * Canonical public origin for absolute asset URLs (emails, HTML in Storage, etc.).
 * Prefer NEXT_PUBLIC_APP_URL in production so deck HTML opened from Supabase loads /public assets.
 */

function normalizeAppOrigin(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const s = raw.trim();
  if (s.startsWith("http://") || s.startsWith("https://")) {
    return s.replace(/\/+$/, "");
  }
  return `https://${s.replace(/\/+$/, "")}`;
}

/**
 * Base URL of the deployed app (no trailing slash).
 */
export function getAppOrigin(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    process.env.VERCEL_URL ||
    "";
  return normalizeAppOrigin(fromEnv) ?? "http://localhost:3000";
}

/** Absolute URL for a path under `public/` (e.g. `/brand/logos/...`). */
export function publicAssetUrl(publicPath: string): string {
  const origin = getAppOrigin();
  const p = publicPath.startsWith("/") ? publicPath : `/${publicPath}`;
  return `${origin}${p}`;
}
