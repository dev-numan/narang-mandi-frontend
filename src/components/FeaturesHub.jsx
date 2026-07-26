import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HUB_HEADLINE } from '../constants/brand.js';
import { FEATURES_LIST } from '../constants/features.js';

function CardInner({ f }) {
  const cta = f.comingSoon ? 'Jald dekhein' : 'Open';

  return (
    <>
      {f.image && (
        <>
          <img
            src={f.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 transition group-hover:from-black/85" />
        </>
      )}
      {!f.image && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      )}
      {f.comingSoon && (
        <span className="absolute left-3 top-3 rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
          Jald aa raha hai
        </span>
      )}
      <span
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-ink shadow-md transition duration-300 group-hover:scale-110 group-hover:bg-brand group-hover:text-white"
        aria-hidden
      >
        →
      </span>
      <div className="relative flex min-h-[9rem] flex-col justify-end gap-1.5 sm:min-h-[10rem]" dir="ltr">
        <h3 className="typo-feature-card-title font-extrabold leading-tight text-white">
          {f.title}
        </h3>
        {f.description && (
          <p className="urdu typo-feature-card-desc line-clamp-2 leading-relaxed text-white/90" dir="rtl">
            {f.description}
          </p>
        )}
        <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-ink shadow-sm transition group-hover:bg-brand group-hover:text-white sm:text-sm">
          {cta}
          <span className="transition group-hover:translate-x-0.5" aria-hidden>
            →
          </span>
        </span>
      </div>
    </>
  );
}

function FeatureCard({ f, onComingSoon }) {
  const className = `group relative block cursor-pointer overflow-hidden rounded-2xl ${
    f.image ? 'bg-gray-900' : `bg-gradient-to-br ${f.gradient}`
  } p-4 text-left shadow-md ring-1 ring-black/5 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-brand/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:p-5`;

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
        <p className="urdu leading-relaxed text-gray-600">
          {feature?.title} کی سہولت پر کام جاری ہے — جلد نارنگ منڈی ڈیجیٹل ہب پر دستیاب ہوگی۔
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-brand px-6 py-2.5 font-semibold text-white transition hover:bg-brand-dark"
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
        <p className="mt-1 text-sm text-gray-500" dir="ltr">
          {HUB_HEADLINE} — Narang Mandi Digital Hub — khabrein, khareedari, ishteharat aur bohat kuch
        </p>
      </div>
      <div dir="ltr" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {FEATURES_LIST.map((f) => (
          <FeatureCard key={f.to} f={f} onComingSoon={() => setComingSoon(f)} />
        ))}
      </div>

      {comingSoon && <ComingSoonModal feature={comingSoon} onClose={() => setComingSoon(null)} />}
    </section>
  );
}
