import { useEffect, useRef } from 'react';

// AdSense publisher ID — matches the loader script in index.html.
const AD_CLIENT = 'ca-pub-7101610225390728';

/**
 * A single AdSense display unit.
 *
 * Auto ads (enabled in the AdSense dashboard) need no markup at all — they use
 * the loader script in index.html. This component is for *manual* units, which
 * let you pin an ad to a specific spot once you have real slot IDs.
 *
 * AdSense only issues a data-ad-slot ID after the account is approved, so the
 * slot IDs live in env vars and every slot renders nothing until one is set.
 * That keeps unfilled <ins> placeholders off the page during review — an empty
 * ad frame counts against you as "ads without content".
 *
 *   client/.env → VITE_AD_SLOT_ARTICLE=1234567890
 */
export default function AdSlot({ slot, format = 'auto', className = '', style }) {
  const ref = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!slot || pushed.current || !ref.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // Loader blocked (ad blocker / offline) — leave the slot empty.
    }
  }, [slot]);

  if (!slot) return null;

  return (
    <div className={className} aria-hidden="true">
      <ins
        ref={ref}
        className="adsbygoogle"
        style={style || { display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
