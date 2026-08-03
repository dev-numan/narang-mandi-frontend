// Text helpers shared by the reader-facing article page and the admin editor.
//
// These mirror server/src/scripts/lib/articleText.js rule for rule. The client
// cannot import server code, so the duplication is deliberate — if you change a
// rule here, change it there too, and keep both covered by the same fixtures.
//
// Background: article bodies were pasted from Word into ReactQuill, which left
// `&nbsp;` between every word. Those non-breaking spaces stop Urdu text wrapping
// on narrow screens, so the body overflows horizontally on a phone.

// LRM, RLM, ALM, ZWNJ, ZWJ — shaping-significant in Urdu. Preserved in content,
// dropped only when normalising for comparison.
const BIDI_CONTROLS = /[\u200E\u200F\u061C\u200C\u200D]/g;
const NBSP_FAMILY = /&nbsp;|&#160;|&#xa0;|\u00A0|\u202F/gi;
const URDU_DIACRITICS = /[\u064B-\u0652\u0670]/g;

// Word emits Arabic letter forms; titles were typed with Urdu ones. Folded so
// the two still compare equal.
const ARABIC_FOLD = [
  [/[يیى]/g, 'ی'],
  [/[كک]/g, 'ک'],
  [/[ةہه]/g, 'ہ'],
  [/[أإآا]/g, 'ا'],
];

// Apply fn to text between tags only — never to href/src/style attribute values.
function mapTextNodes(html, fn) {
  return String(html)
    .split(/(<[^>]*>)/)
    .map((seg) => (seg.startsWith('<') && seg.endsWith('>') ? seg : fn(seg)))
    .join('');
}

/**
 * Non-breaking spaces become real spaces so Urdu wraps normally.
 *
 * Deliberately does NOT decode &amp; / &lt; / &gt; — this output is HTML that
 * goes on to DOMPurify, and decoding would turn a stored "&lt;script&gt;" into
 * live markup.
 */
export function normalizeNbsp(html) {
  return mapTextNodes(html, (t) => t.replace(NBSP_FAMILY, ' ').replace(/[ \t]{2,}/g, ' '));
}

export function stripTags(input) {
  return String(input || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(NBSP_FAMILY, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .split(/\s+/)
    .filter(Boolean)
    .join(' ');
}

// Byline / dateline markers — present in the title on some articles and the body
// on others, so they must be folded away before comparing the two.
const BYLINE_MARKER = /\(\s*(?:SahibMeo|نامہ\s*نگار|سٹاف\s*رپورٹر)\s*\)/gi;

/** Aggressive normalisation for equality tests only — never rendered. */
export function normText(input) {
  let t = stripTags(input).replace(BYLINE_MARKER, ' ').replace(BIDI_CONTROLS, '').replace(URDU_DIACRITICS, '');
  for (const [re, to] of ARABIC_FOLD) t = t.replace(re, to);
  t = t.replace(/[^\p{L}\p{N}\s]/gu, ' ');
  return t.normalize('NFC').split(/\s+/).filter(Boolean).join(' ');
}

/**
 * True when the excerpt merely repeats the body's opening OR the headline.
 *
 * The title case matters as much as the body case: the page renders the title as
 * an <h1> with the excerpt as a standfirst right beneath it, so an excerpt that
 * restates the title prints the same sentence twice on screen.
 */
export function isExcerptDuplicated(excerpt, content, title = '') {
  const e = normText(excerpt);
  if (!e) return false;
  if (normText(content).includes(e)) return true;
  const t = normText(title);
  return Boolean(t) && (t.includes(e) || e.includes(t));
}

/** Search engines truncate past ~160 chars; keep JSON-LD and meta in step. */
export function capDescription(s, max = 200) {
  const t = stripTags(s);
  return t.length <= max ? t : `${t.slice(0, max - 3).replace(/\s+\S*$/, '')}…`;
}
