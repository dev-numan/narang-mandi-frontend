import { useState } from 'react';

/**
 * The drivers a customer can ring themselves once the bidding window has passed.
 *
 * Two presentations of the same list: expanded with an apology when nobody bid
 * at all, and tucked behind a chevron when some did — in that case the bids
 * above are the main event and this is the escape hatch.
 */
export default function DriverFallbackList({ drivers, hadBids }) {
  const [open, setOpen] = useState(!hadBids);

  if (!drivers?.length) {
    return (
      <p className="urdu mt-4 text-sm text-gray-500">
        اس وقت کوئی ڈرائیور دستیاب نہیں۔
      </p>
    );
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      {hadBids ? (
        <button
          onClick={() => setOpen((v) => !v)}
          className="urdu flex w-full items-center justify-between text-sm font-semibold text-ink"
        >
          <span>دوسرے ڈرائیوروں سے رابطہ کریں</span>
          <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
        </button>
      ) : (
        <p className="urdu mb-3 text-sm font-semibold text-amber-700">
          کسی ڈرائیور نے جواب نہیں دیا — براہِ کرم خود رابطہ کریں
        </p>
      )}

      {open && (
        <div className="mt-3 grid gap-2">
          {drivers.map((d) => (
            <DriverRow key={d._id} driver={d} />
          ))}
        </div>
      )}
    </div>
  );
}

function DriverRow({ driver }) {
  // wa.me wants E.164 without the +; local numbers are written 03xxxxxxxxx.
  const waNumber = String(driver.whatsapp || driver.phone || '').replace(/\D/g, '');
  const wa = waNumber ? `92${waNumber.slice(-10)}` : '';

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3">
      <div className="min-w-0">
        <p className="urdu truncate font-semibold text-ink">
          {driver.name || 'ڈرائیور'}
          {driver.isVerified && <span className="mr-1 text-xs text-green-600"> ✓</span>}
        </p>
        <p className="urdu truncate text-xs text-gray-500">
          {[driver.vehicleType, driver.vehicleNumber].filter(Boolean).join(' · ') || '—'}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        {driver.phone && (
          <a
            href={`tel:${driver.phone}`}
            dir="ltr"
            className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white"
          >
            ✆
          </a>
        )}
        {wa && (
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
