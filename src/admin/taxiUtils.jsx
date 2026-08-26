/**
 * Shared formatting for the taxi admin screens.
 *
 * The panel is an operations tool for Narang Mandi, so every clock reading is
 * shown in Pakistan time regardless of where the browser thinks it is — an
 * admin comparing a ride log against a phone call needs the times to match what
 * the driver saw.
 */

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;

const shifted = (value) => new Date(new Date(value).getTime() + PKT_OFFSET_MS);

/// `26 Aug, 11:32 PM` — the format used in ride headers and log rows.
export function pktDateTime(value) {
  if (!value) return '—';
  const d = shifted(value);
  const date = d.toISOString().slice(0, 10);
  const [, m, day] = date.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${Number(day)} ${months[Number(m) - 1]}, ${pktTime(value)}`;
}

/// `11:32 PM`
export function pktTime(value) {
  if (!value) return '—';
  const d = shifted(value);
  const h = d.getUTCHours();
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${mm} ${period}`;
}

/**
 * A duration in seconds as `1m 53s` / `2h 14m`.
 *
 * Sub-minute precision is kept deliberately: the interesting question on this
 * data is how many *seconds* passed between a bid landing and the customer
 * walking away, and a value rounded to minutes loses exactly that.
 */
export function duration(seconds) {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
}

/// Elapsed time between two timestamps, formatted.
export const gap = (from, to) => duration((new Date(to) - new Date(from)) / 1000);

/// How long ago something happened.
export const ago = (value) => duration((Date.now() - new Date(value)) / 1000);

/// `Rs 4,500`
export const money = (n) => (n ? `Rs ${Number(n).toLocaleString('en-US')}` : '—');

/**
 * Local number as WhatsApp expects it: `03001234567` → `923001234567`.
 *
 * Mirrors `toWhatsAppNumber` on the server. Returns null when the number cannot
 * be one, so callers render plain text instead of a dead link.
 */
export function waNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return null;
  let national = digits;
  if (digits.startsWith('92')) national = digits.slice(2);
  else if (digits.startsWith('0')) national = digits.slice(1);
  if (national.length !== 10 || !national.startsWith('3')) return null;
  return `92${national}`;
}

/// Phones are stored without the leading zero, which reads wrong to an operator.
export const displayPhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '—';
  const national = digits.startsWith('92') ? digits.slice(2) : digits.replace(/^0/, '');
  return national.length === 10 ? `0${national.slice(0, 3)} ${national.slice(3)}` : phone;
};

export const RIDE_STATUS_STYLES = {
  open: 'bg-sky-100 text-sky-700',
  assigned: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-200 text-gray-600',
};

/// True when a ride is still `open` but its TTL has already passed. The sweep is
/// lazy, so a row can sit in this state until some read triggers it.
export const isExpired = (ride) =>
  ride.status === 'open' && ride.expiresAt && new Date(ride.expiresAt) < new Date();

export function StatusPill({ status, expired }) {
  const label = expired ? 'expired' : status;
  const cls = expired ? 'bg-orange-100 text-orange-700' : RIDE_STATUS_STYLES[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {label}
    </span>
  );
}
