export const SITE_NAME = "ClassMetric";

/**
 * The public address of the site. Set NEXT_PUBLIC_SITE_URL once the real
 * domain is known. On Vercel the production address is picked up automatically.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/** Full address of a page on this site, for example absoluteUrl("/about"). */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}