/** Canonical English brand — used in titles, header, and SEO signals for Google site names. */
export const SITE_NAME = 'Narang Mandi';
export const SITE_NAME_URDU = 'نارنگ منڈی نیوز';
export const SITE_DOMAIN = 'narangmandi.com';
export const SITE_URL = `https://${SITE_DOMAIN}`;

/** Always returns the canonical site name for display and meta tags. */
export function displaySiteName() {
  return SITE_NAME;
}
