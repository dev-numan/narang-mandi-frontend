import { useEffect, useState, useCallback } from 'react';

// Branded promotional slides (نارنگ منڈی نیوز). Built in JSX so the Nastaliq
// font and theme colours render crisply. Full literal class strings keep the
// gradient utilities in Tailwind's JIT output.
const SLIDES = [
  {
    id: 'awaaz',
    gradient: 'bg-gradient-to-br from-brand-dark via-brand to-brand-light',
    eyebrow: 'نارنگ منڈی نیوز',
    title: 'سچ کی آواز',
    subtitle: 'آپ کے شہر کی ہر خبر، سب سے پہلے — بے باک، غیر جانبدار، باوقار',
    chips: [],
    accent: 'text-white',
  },
  {
    id: 'trust',
    gradient: 'bg-gradient-to-br from-ink via-ink to-brand-dark',
    eyebrow: 'با اعتماد صحافت',
    title: 'ہر لمحے کی تازہ خبر',
    subtitle: 'سیاست ہو یا کھیل، مقامی واقعات ہوں یا کاروبار — ہم ہر خبر آپ تک پہنچاتے ہیں',
    chips: ['سیاست', 'کھیل', 'مقامی', 'کاروبار', 'تعلیم', 'صحت'],
    accent: 'text-white',
  },
  {
    id: 'city',
    gradient: 'bg-gradient-to-tr from-brand via-brand-dark to-ink',
    eyebrow: 'نارنگ منڈی کی پہچان',
    title: 'آپ کے شہر کی آواز',
    subtitle: 'مقامی خبروں کا سب سے بھروسہ مند ذریعہ — سچائی کے ساتھ، آپ کے ساتھ',
    chips: [],
    accent: 'text-white',
  },
];

function Slide({ slide }) {
  return (
    <div className={`relative h-full w-full overflow-hidden ${slide.gradient}`}>
      {/* Decorative branded shapes */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border border-white/10" />
      {/* big watermark letter */}
      <span className="pointer-events-none absolute -bottom-10 left-6 select-none text-[10rem] font-bold leading-none text-white/5 sm:text-[14rem]">
        ن
      </span>

      <div className={`relative z-10 flex h-full flex-col items-center justify-center px-6 text-center ${slide.accent}`}>
        <span className="mb-3 rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs backdrop-blur-sm sm:mb-6 sm:px-4 sm:text-sm">
          {slide.eyebrow}
        </span>
        <h2 className="pb-2 text-2xl font-bold leading-[1.8] drop-shadow-sm sm:pb-5 sm:text-6xl sm:leading-[1.7]">
          {slide.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-loose text-white/90 sm:mt-8 sm:text-xl">
          {slide.subtitle}
        </p>
        {slide.chips.length > 0 && (
          <div className="mt-6 hidden flex-wrap items-center justify-center gap-2 sm:flex">
            {slide.chips.map((c) => (
              <span
                key={c}
                className="rounded-full bg-white/15 px-3 py-1 text-sm text-white backdrop-blur-sm"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  const count = SLIDES.length;

  const go = useCallback((n) => setIdx(((n % count) + count) % count), [count]);

  useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % count), 5000);
    return () => clearInterval(t);
  }, [count]);

  return (
    <div className="relative h-[240px] w-full overflow-hidden rounded-xl bg-ink sm:h-[420px]">
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === idx ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <Slide slide={s} />
        </div>
      ))}

      {/* RTL: right arrow → previous, left arrow → next */}
      <button
        onClick={() => go(idx + 1)}
        aria-label="اگلی"
        className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-lg text-ink hover:bg-white sm:block"
      >
        ‹
      </button>
      <button
        onClick={() => go(idx - 1)}
        aria-label="پچھلی"
        className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-lg text-ink hover:bg-white sm:block"
      >
        ›
      </button>
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`سلائیڈ ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === idx ? 'w-6 bg-white' : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
