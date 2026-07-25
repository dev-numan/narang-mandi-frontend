import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HUB_HEADLINE } from '../constants/brand.js';

// The digital-hub "front door": prominent cards for every major feature.
// To use a real photo for a card, put an image URL in its `image` field —
// it renders as a soft background behind the icon (gradient stays as fallback).
// Cards with `comingSoon: true` don't navigate yet — they pop a "coming soon"
// modal so we can showcase the feature before it launches.
const FEATURES = [
  { to: '/shops', title: 'دکانیں', subtitle: 'آن لائن خریداری', icon: '🛒', gradient: 'from-brand to-brand-dark', image: '/feature-shops.png', comingSoon: true },
  { to: '/taxi', title: 'آن لائن ٹیکسی', subtitle: 'شہر تا شہر بکنگ', icon: '🚕', gradient: 'from-yellow-500 to-amber-600', image: '/feature-taxi.png', comingSoon: true },
  { to: '/classifieds', title: 'خرید و فروخت', subtitle: 'پرانی نئی چیزیں بیچیں', icon: '🏷️', gradient: 'from-amber-500 to-orange-600', image: '/feature-classifieds.png' },
  { to: '/category/local', title: 'تازہ خبریں', subtitle: 'شہر کی تازہ ترین خبریں', icon: '📰', gradient: 'from-rose-600 to-red-700', image: '/feature-news.png' },
  { to: '/trains', title: 'ٹرین اوقات', subtitle: 'آمد و رفت کے اوقات', icon: '🚆', gradient: 'from-sky-600 to-blue-700', image: '/feature-trains.png' },
  { to: '/community', title: 'کمیونٹی چیٹ', subtitle: 'مقامی گفتگو و معلومات', icon: '💬', gradient: 'from-emerald-600 to-green-700', image: '/feature-community.png' },
  { to: '/places', title: 'مشہور مقامات', subtitle: 'اہم مقامات و خدمات', icon: '📍', gradient: 'from-violet-600 to-purple-700', image: '/feature-places.png' },
];

function CardInner({ f }) {
  return (
    <>
      {f.image && (
        <>
          <img src={f.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/35" />
        </>
      )}
      <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-10 right-4 h-20 w-20 rounded-full bg-white/5" />
      {f.comingSoon && (
        <span className="urdu absolute left-3 top-3 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
          جلد آ رہا ہے
        </span>
      )}
      <div className="relative">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl backdrop-blur-sm">
          {f.icon}
        </span>
        <h3 className="urdu text-lg font-bold text-white">{f.title}</h3>
        <p className="urdu mt-0.5 text-xs text-white/80">{f.subtitle}</p>
        <span className="urdu mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/90">
          {f.comingSoon ? 'بہت جلد' : 'دیکھیں'} <span className="transition group-hover:-translate-x-1">←</span>
        </span>
      </div>
    </>
  );
}

function FeatureCard({ f, onComingSoon }) {
  const className = `group relative overflow-hidden rounded-2xl ${
    f.image ? 'bg-gray-900' : `bg-gradient-to-br ${f.gradient}`
  } p-4 text-right shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-5`;

  if (f.comingSoon) {
    return (
      <button type="button" onClick={onComingSoon} className={className}>
        <CardInner f={f} />
      </button>
    );
  }
  return (
    <Link to={f.to} className={className}>
      <CardInner f={f} />
    </Link>
  );
}

function ComingSoonModal({ feature, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-4xl">
          {feature?.icon || '⏳'}
        </div>
        <h3 className="urdu mb-2 text-2xl font-bold text-ink">بہت جلد آ رہا ہے</h3>
        <p className="urdu leading-loose text-gray-600">
          {feature?.title} کی سہولت پر کام جاری ہے — بہت جلد نارنگ منڈی ڈیجیٹل ہب پر دستیاب ہوگی۔ انتظار کریں!
        </p>
        <button
          type="button"
          onClick={onClose}
          className="urdu mt-6 w-full rounded-lg bg-brand px-6 py-2.5 font-semibold text-white transition hover:bg-brand-dark"
        >
          ٹھیک ہے
        </button>
      </div>
    </div>
  );
}

export default function FeaturesHub() {
  const [comingSoon, setComingSoon] = useState(null);

  return (
    <section className="mb-8">
      <div className="mb-4 text-center">
        <p className="mt-1 text-sm text-gray-500">
          {HUB_HEADLINE} — <span className="urdu">نارنگ منڈی ڈیجیٹل ہب — خبریں، خریداری، اشتہارات اور بہت کچھ</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {FEATURES.map((f) => (
          <FeatureCard key={f.to} f={f} onComingSoon={() => setComingSoon(f)} />
        ))}
      </div>

      {comingSoon && <ComingSoonModal feature={comingSoon} onClose={() => setComingSoon(null)} />}
    </section>
  );
}
