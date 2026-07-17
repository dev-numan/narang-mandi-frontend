import { Link } from 'react-router-dom';
import { HOME_H1 } from '../constants/brand.js';

// The digital-hub "front door": prominent cards for every major feature.
// To use a real photo for a card, put an image URL in its `image` field —
// it renders as a soft background behind the icon (gradient stays as fallback).
const FEATURES = [
  { to: '/shops', title: 'دکانیں', subtitle: 'آن لائن خریداری', icon: '🛒', gradient: 'from-brand to-brand-dark', image: '' },
  { to: '/classifieds', title: 'خرید و فروخت', subtitle: 'پرانی نئی چیزیں بیچیں', icon: '🏷️', gradient: 'from-amber-500 to-orange-600', image: '' },
  { to: '/category/local', title: 'تازہ خبریں', subtitle: 'شہر کی تازہ ترین خبریں', icon: '📰', gradient: 'from-rose-600 to-red-700', image: '' },
  { to: '/trains', title: 'ٹرین اوقات', subtitle: 'آمد و رفت کے اوقات', icon: '🚆', gradient: 'from-sky-600 to-blue-700', image: '' },
  { to: '/community', title: 'کمیونٹی چیٹ', subtitle: 'مقامی گفتگو و معلومات', icon: '💬', gradient: 'from-emerald-600 to-green-700', image: '' },
  { to: '/places', title: 'مشہور مقامات', subtitle: 'اہم مقامات و خدمات', icon: '📍', gradient: 'from-violet-600 to-purple-700', image: '' },
];

function FeatureCard({ f }) {
  return (
    <Link
      to={f.to}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${f.gradient} p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-5`}
    >
      {f.image && <img src={f.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
      <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-10 right-4 h-20 w-20 rounded-full bg-white/5" />
      <div className="relative">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl backdrop-blur-sm">
          {f.icon}
        </span>
        <h3 className="urdu text-lg font-bold text-white">{f.title}</h3>
        <p className="urdu mt-0.5 text-xs text-white/80">{f.subtitle}</p>
        <span className="urdu mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/90">
          دیکھیں <span className="transition group-hover:-translate-x-1">←</span>
        </span>
      </div>
    </Link>
  );
}

export default function FeaturesHub() {
  return (
    <section className="mb-8">
      <div className="mb-4 text-center">
        <h2 className="urdu text-2xl font-bold text-ink sm:text-3xl">سب کچھ ایک ہی جگہ</h2>
        <p className="mt-1 text-sm text-gray-500">
          {HOME_H1} — <span className="urdu">نارنگ منڈی ڈیجیٹل ہب — خبریں، خریداری، اشتہارات اور بہت کچھ</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {FEATURES.map((f) => (
          <FeatureCard key={f.to} f={f} />
        ))}
      </div>
    </section>
  );
}
