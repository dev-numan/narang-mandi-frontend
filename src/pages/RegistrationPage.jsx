import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { registrationsApi } from '../api/index.js';
import { SITE_NAME } from '../constants/brand.js';
import { REGISTRATION_TYPES } from '../constants/registration.js';
import Seo from '../components/Seo.jsx';

const EMPTY = { name: '', contact: '', businessName: '', hasLicense: 'no', image: '' };

export default function RegistrationPage() {
  const { type } = useParams();
  const meta = REGISTRATION_TYPES[type];
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);

  const { mutate, isPending, isSuccess, error, reset } = useMutation({
    mutationFn: () =>
      registrationsApi.submit({
        type,
        name: form.name,
        contact: form.contact,
        businessName: form.businessName,
        hasLicense: type === 'driver' && form.hasLicense === 'yes',
        image: form.image,
      }),
  });

  if (!meta) return <Navigate to="/" replace />;

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await registrationsApi.uploadImage(file);
      setForm((f) => ({ ...f, image: url }));
    } catch {
      /* optional image */
    } finally {
      setUploading(false);
    }
  };

  const errorText =
    error?.response?.status === 429
      ? 'بہت زیادہ درخواستیں بھیجی گئیں۔ براہِ کرم کچھ دیر بعد کوشش کریں۔'
      : error
        ? 'درخواست بھیجنے میں مسئلہ آیا۔ براہِ کرم دوبارہ کوشش کریں۔'
        : '';

  const overlay =
    type === 'driver'
      ? 'linear-gradient(90deg, rgba(17,24,39,0.25) 0%, rgba(69,10,10,0.35) 45%, rgba(0,0,0,0.55) 100%)'
      : 'linear-gradient(90deg, rgba(127,29,29,0.25) 0%, rgba(185,28,28,0.35) 45%, rgba(69,10,10,0.55) 100%)';

  return (
    <>
      <Seo
        title={`${meta.seoTitle} — ${SITE_NAME}`}
        description={meta.seoDescription}
        path={meta.path}
      />

      <div className="mx-auto max-w-3xl">
        <Link to="/" className="urdu mb-4 inline-block text-sm text-brand hover:underline">
          ← صفحۂ اول
        </Link>

        {/* Hero strip matching the homepage banner */}
        <div
          className={`relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-l ${meta.gradient} p-6 text-white shadow-sm sm:p-8`}
          style={
            meta.bgImage
              ? {
                  backgroundImage: `${overlay}, url(${meta.bgImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: meta.bgPosition || 'center',
                }
              : undefined
          }
        >
          <div className="relative">
            <span className="urdu mb-2 inline-block rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-extrabold text-brand-dark">
              {meta.badge}
            </span>
            <h1 className="urdu text-2xl font-bold leading-snug sm:text-3xl">{meta.title}</h1>
            <p className="urdu mt-2 text-sm text-white/90 sm:text-base">{meta.subtitle}</p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {meta.perks.map((p) => (
                <li key={p} className="urdu flex items-center gap-1 text-sm text-white/90">
                  <span className="text-yellow-300">✓</span> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8" dir="rtl">
          <h2 className="urdu mb-6 text-xl font-bold text-ink">{meta.pageTitle}</h2>

          {isSuccess ? (
            <div className="urdu rounded-xl bg-green-50 p-6 text-center leading-loose text-green-700">
              <p className="text-lg font-semibold">آپ کی رجسٹریشن موصول ہو گئی — شکریہ!</p>
              <p className="mt-2 text-sm">ہماری ٹیم جلد آپ سے رابطہ کرے گی۔</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/"
                  className="urdu rounded-lg bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-dark"
                >
                  صفحۂ اول پر جائیں
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setForm(EMPTY);
                    reset();
                  }}
                  className="urdu rounded-lg border border-gray-300 px-6 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  نئی درخواست
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutate();
              }}
              className="space-y-4"
            >
              {errorText && (
                <div className="urdu rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorText}</div>
              )}

              <div>
                <label className="urdu mb-1 block text-sm font-semibold text-gray-600">نام</label>
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="آپ کا نام"
                  className="urdu w-full rounded-lg border border-gray-300 px-4 py-2.5 text-right outline-none focus:border-brand"
                  {...field('name')}
                />
              </div>

              <div>
                <label className="urdu mb-1 block text-sm font-semibold text-gray-600">رابطہ نمبر</label>
                <input
                  required
                  minLength={6}
                  maxLength={40}
                  placeholder="03xx-xxxxxxx"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-right outline-none focus:border-brand"
                  dir="ltr"
                  {...field('contact')}
                />
              </div>

              <div>
                <label className="urdu mb-1 block text-sm font-semibold text-gray-600">
                  {meta.businessLabel}
                </label>
                <input
                  maxLength={120}
                  placeholder={meta.businessPlaceholder}
                  className="urdu w-full rounded-lg border border-gray-300 px-4 py-2.5 text-right outline-none focus:border-brand"
                  {...field('businessName')}
                />
              </div>

              {type === 'driver' && (
                <div>
                  <label className="urdu mb-1 block text-sm font-semibold text-gray-600">
                    ڈرائیونگ لائسنس موجود ہے؟
                  </label>
                  <div className="flex gap-6">
                    {[
                      { v: 'yes', label: 'جی ہاں' },
                      { v: 'no', label: 'نہیں' },
                    ].map((opt) => (
                      <label
                        key={opt.v}
                        className="urdu flex cursor-pointer items-center gap-2 text-gray-700"
                      >
                        <input
                          type="radio"
                          name="hasLicense"
                          value={opt.v}
                          checked={form.hasLicense === opt.v}
                          onChange={(e) => setForm((f) => ({ ...f, hasLicense: e.target.value }))}
                          className="accent-brand"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="urdu mb-1 block text-sm font-semibold text-gray-600">
                  {meta.imageLabel} (اختیاری)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand"
                />
                {uploading && (
                  <p className="urdu mt-1 text-xs text-gray-500">تصویر اپلوڈ ہو رہی ہے…</p>
                )}
                {form.image && !uploading && (
                  <img src={form.image} alt="" className="mt-2 h-36 w-full rounded-lg object-cover" />
                )}
              </div>

              <button
                type="submit"
                disabled={isPending || uploading}
                className="urdu w-full rounded-xl bg-brand px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
              >
                {isPending ? 'بھیجا جا رہا ہے…' : 'رجسٹر کریں'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
