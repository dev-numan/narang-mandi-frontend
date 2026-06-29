// Narang Mandi location map shown above the footer on every public page.
// Uses the keyless Google Maps embed (no API key, no billing required).
const MAP_SRC =
  'https://maps.google.com/maps?q=Narang%20Mandi,%20Sheikhupura,%20Punjab,%20Pakistan&z=14&output=embed';

export default function TownMap() {
  return (
    <section className="border-t border-gray-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <h2 className="urdu mb-3 text-xl font-bold text-ink">نارنگ منڈی کا نقشہ</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <iframe
            title="نارنگ منڈی کا نقشہ"
            src={MAP_SRC}
            className="h-72 w-full md:h-96"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
