// Urdu date formatting helpers.
const URDU_MONTHS = [
  'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
  'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر',
];

export function formatUrduDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${URDU_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// Format a classifieds price in Rupees, e.g. 50000 → "Rs 50,000".
export function formatPrice(price) {
  if (price == null || price === '') return '';
  const n = Number(price);
  if (Number.isNaN(n)) return '';
  return `Rs ${n.toLocaleString('en-US')}`;
}

// Convert a stored "HH:MM" 24-hour time to a 12-hour AM/PM label.
// e.g. "13:36" → "1:36 PM", "08:00" → "8:00 AM", "00:21" → "12:21 AM".
export function toAmPm(hhmm) {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm.trim())) return hhmm || '';
  const [h, m] = hhmm.trim().split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

// Short Urdu "time ago" label (e.g. ابھی، ۵ منٹ پہلے، ۳ گھنٹے پہلے).
export function timeAgoUrdu(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return 'ابھی';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${toUrduNumber(mins)} منٹ پہلے`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${toUrduNumber(hours)} گھنٹے پہلے`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${toUrduNumber(days)} دن پہلے`;
  return formatUrduDate(value);
}

// Numbers are shown with standard English (Latin) digits everywhere on the
// site, even within Urdu text. Kept as a passthrough so existing call sites
// don't need to change.
export function toUrduNumber(n) {
  return String(n ?? '');
}
