/** Canonical English brand — used in titles, header, and SEO signals for Google site names. */
export const SITE_NAME = 'Narang Mandi';
export const SITE_NAME_URDU = 'نارنگ منڈی';
/** Matches page title keywords for SEO (All-in-One Digital Hub). */
export const HUB_HEADLINE = 'All-in-One Digital Hub';
/** Homepage H1 — aligned with meta title. */
export const HOME_H1 = `${SITE_NAME} — ${HUB_HEADLINE}`;
export const SITE_DOMAIN = 'narangmandi.com';
export const SITE_URL = `https://${SITE_DOMAIN}`;

/** Always returns the canonical site name for display and meta tags. */
export function displaySiteName() {
  return SITE_NAME;
}
