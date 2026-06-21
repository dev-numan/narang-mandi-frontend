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

// Convert latin digits to Urdu/Eastern-Arabic numerals.
const URDU_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
export function toUrduNumber(n) {
  return String(n ?? '').replace(/[0-9]/g, (d) => URDU_DIGITS[+d]);
}
