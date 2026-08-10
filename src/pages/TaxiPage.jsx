import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { taxiApi } from '../api/index.js';
import { FEATURES, featureSeoTitle } from '../constants/features.js';
import Seo from '../components/Seo.jsx';
import RideTracker from '../components/RideTracker.jsx';

/// Most people book a little ahead rather than for this exact minute, so the
/// picker opens two hours out instead of on "now" — which would also be an
/// invalid choice by the time they finish typing.
const LEAD_HOURS = 2;

/** `datetime-local` speaks local wall-clock time, so build the value by hand. */
function toLocalInput(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultWhen() {
  const d = new Date();
  d.setHours(d.getHours() + LEAD_HOURS);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
  return toLocalInput(d);
}

const URDU_MONTHS = [
  'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
  'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر',
];

/// Drivers read this on WhatsApp, so it has to be a phrase rather than a
/// timestamp. Server caps whenText at 80 characters; this stays well under.
function formatWhenUrdu(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';

  const h = d.getHours();
  // Before 5am is still رات in speech, not صبح.
  const period = h < 5 ? 'رات' : h < 12 ? 'صبح' : h < 15 ? 'دوپہر' : h < 19 ? 'شام' : 'رات';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const time = `${period} ${hour12}:${String(d.getMinutes()).padStart(2, '0')} بجے`;

  const midnight = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((midnight(d) - midnight(new Date())) / 86_400_000);
  const day =
    days === 0 ? 'آج' : days === 1 ? 'کل' : `${d.getDate()} ${URDU_MONTHS[d.getMonth()]}`;

  return `${day}، ${time}`;
}

const emptyForm = () => ({
  customerName: '',
  customerPhone: '',
  pickupText: '',
  dropoffText: '',
  whenAt: defaultWhen(),
  note: '',
});

/**
 * Focus is drawn in ink, not brand.
 *
 * The brand colour is red, so a brand-coloured focus ring made every field a
 * user was simply typing in look like a field they had got wrong. Red is now
 * reserved for a field that actually failed validation.
 */
const fieldBase =
  'urdu typo-taxi-input w-full rounded-lg border px-3.5 py-3 outline-none transition-colors';
const fieldIdle = 'border-gray-300 focus:border-ink focus:ring-2 focus:ring-ink/10';
const fieldError = 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-2 focus:ring-red-500/15';

const fieldClass = (invalid) => `${fieldBase} ${invalid ? fieldError : fieldIdle}`;

/**
 * Ride requests, and the receipt that follows.
 *
 * Locations are plain text on purpose — people here name a place, they do not
 * drop a pin, and asking for a map would stop most of them before they started.
 */
export default function TaxiPage() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [tracking, setTracking] = useState(null); // { rideCode, phone }
  const [copied, setCopied] = useState(false);

  const mut = useMutation({
    mutationFn: taxiApi.request,
    onSuccess: (res) => {
      setTracking({ rideCode: res.data.rideCode, phone: form.customerPhone });
      // A fresh default rather than EMPTY: the next request should also open two
      // hours from now, not two hours from whenever this page was loaded.
      setForm(emptyForm());
      setErrors({});
    },
    onError: (err) => setSubmitError(err.message),
  });

  // Clearing the field's own error as it is typed in means the red border goes
  // away the moment the problem is fixed, not on the next submit.
  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    setErrors((prev) => (prev[k] ? { ...prev, [k]: undefined } : prev));
  };

  const submit = (e) => {
    e.preventDefault();
    setSubmitError('');

    // Each missing field is named at the field itself; a single lumped message
    // at the bottom left people hunting for which box was the problem.
    const next = {};
    if (!form.pickupText.trim()) next.pickupText = 'یہ خانہ ضروری ہے';
    if (!form.dropoffText.trim()) next.dropoffText = 'یہ خانہ ضروری ہے';
    if (!form.customerName.trim()) next.customerName = 'اپنا نام لکھیں';
    if (!form.customerPhone.trim()) next.customerPhone = 'فون نمبر لکھیں';

    setErrors(next);
    if (Object.keys(next).length) return;

    // The picker is a convenience for the rider; what the driver receives is
    // still the plain Urdu phrase the API has always stored. Clearing the field
    // sends an empty string, which the notification renders as "ابھی".
    const { whenAt, ...rest } = form;
    mut.mutate({ ...rest, whenText: whenAt ? formatWhenUrdu(whenAt) : '' });
  };

  const copyCode = async () => {
    await navigator.clipboard?.writeText(tracking.rideCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Seo
        title={featureSeoTitle(FEATURES.taxi)}
        description={FEATURES.taxi.description}
        path="/taxi"
      />

      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="urdu typo-taxi-page-title mb-1 font-bold text-ink">{FEATURES.taxi.title}</h1>
        <p className="urdu typo-taxi-page-desc mb-6 text-gray-500">{FEATURES.taxi.description}</p>

        {tracking ? (
          <>
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="urdu typo-taxi-section-title mb-3 font-semibold text-green-800">
                آپ کی درخواست ڈرائیوروں کو بھیج دی گئی ہے
              </p>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span
                  dir="ltr"
                  className="typo-taxi-code rounded-lg bg-white px-4 py-2 font-mono font-bold tracking-widest text-ink"
                >
                  {tracking.rideCode}
                </span>
                <button
                  onClick={copyCode}
                  className="urdu typo-taxi-hint rounded-lg border border-green-300 px-4 py-2.5 text-green-800 hover:bg-green-100"
                >
                  {copied ? 'کاپی ہو گیا ✓' : 'کوڈ کاپی کریں'}
                </button>
              </div>
              <p className="urdu typo-taxi-hint text-green-700">
                یہ کوڈ اور اپنا فون نمبر محفوظ رکھیں — انہی سے آپ اپنی سواری دیکھ سکتے ہیں۔
              </p>
            </div>
            <RideTracker rideCode={tracking.rideCode} phone={tracking.phone} />
            <button
              onClick={() => setTracking(null)}
              className="urdu typo-taxi-hint mt-4 py-2 text-brand hover:underline"
            >
              نئی درخواست بھیجیں
            </button>
          </>
        ) : (
          <form onSubmit={submit} noValidate className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <div className="grid gap-4">
              <Field
                label="کہاں سے؟"
                required
                error={errors.pickupText}
                placeholder="مثلاً: نارنگ منڈی ریلوے اسٹیشن"
                value={form.pickupText}
                onChange={set('pickupText')}
              />
              <Field
                label="کہاں تک؟"
                required
                error={errors.dropoffText}
                placeholder="مثلاً: مریدکے چوک"
                value={form.dropoffText}
                onChange={set('dropoffText')}
              />
              <Field
                label="کب؟"
                as="input"
                type="datetime-local"
                dir="ltr"
                min={toLocalInput(new Date())}
                // The native picker lays out its own segments; .urdu would flip
                // them, so direction is forced back to LTR on this control only.
                className="text-left [direction:ltr]"
                value={form.whenAt}
                onChange={set('whenAt')}
              />
              <Field
                label="آپ کا نام"
                required
                error={errors.customerName}
                autoComplete="name"
                value={form.customerName}
                onChange={set('customerName')}
              />
              <Field
                label="فون نمبر"
                required
                error={errors.customerPhone}
                dir="ltr"
                inputMode="tel"
                autoComplete="tel"
                className="text-left"
                placeholder="03001234567"
                value={form.customerPhone}
                onChange={set('customerPhone')}
              />
              <Field
                label="کوئی بات بتانی ہو؟"
                as="textarea"
                rows={3}
                value={form.note}
                onChange={set('note')}
              />
            </div>

            {submitError && (
              <p className="urdu typo-taxi-error mt-4 rounded-lg bg-red-50 px-3 py-2 text-red-600">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={mut.isPending}
              className="urdu typo-taxi-button mt-5 w-full rounded-lg bg-brand py-4 font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
            >
              {mut.isPending ? 'بھیجا جا رہا ہے…' : 'ڈرائیوروں کو بھیجیں'}
            </button>
            <p className="urdu typo-taxi-hint mt-3 text-center text-gray-500">
              ڈرائیور اپنی قیمت بھیجیں گے۔ آپ جو پسند کریں، وہ منتخب کریں۔
            </p>
          </form>
        )}

        {!tracking && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="urdu typo-taxi-section-title mb-3 font-semibold text-ink">
              پہلے سے درخواست بھیج چکے ہیں؟
            </p>
            <TrackByCode onFound={setTracking} />
          </div>
        )}
      </div>
    </>
  );
}

/**
 * One labelled control.
 *
 * The label wraps the control rather than using htmlFor/id, so a caller cannot
 * ship a field whose label is attached to nothing — every tap on the Urdu text
 * still focuses the box beneath it.
 */
function Field({ label, required = false, error, as = 'input', className = '', ...props }) {
  const Control = as;
  return (
    <label className="block">
      <span className="urdu typo-taxi-label mb-1.5 block text-gray-700">
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      <Control
        {...props}
        aria-invalid={error ? 'true' : undefined}
        className={`${fieldClass(Boolean(error))} ${className}`}
      />
      {error && <span className="urdu typo-taxi-error mt-1 block text-red-600">{error}</span>}
    </label>
  );
}

/** Code + phone is the only credential a guest has, so both are required. */
function TrackByCode({ onFound }) {
  const [rideCode, setRideCode] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: () => taxiApi.lookup(rideCode, phone),
    onSuccess: () => onFound({ rideCode, phone }),
    onError: (err) => setError(err.message),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError('');
        mut.mutate();
      }}
      className="flex flex-wrap gap-2"
    >
      {/* Code and phone share a row of their own so the phone field keeps enough
          width to show a full 11-digit number on a 390px screen. */}
      <div className="flex w-full gap-2 sm:flex-1">
        <input
          dir="ltr"
          inputMode="numeric"
          maxLength={8}
          placeholder="کوڈ"
          value={rideCode}
          onChange={(e) => setRideCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
          className="typo-taxi-input w-28 shrink-0 rounded-lg border border-gray-300 px-3 py-3 text-center font-mono tracking-widest outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
        />
        <input
          dir="ltr"
          inputMode="tel"
          autoComplete="tel"
          placeholder="03001234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="typo-taxi-input min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
        />
      </div>
      <button
        type="submit"
        disabled={mut.isPending}
        className="urdu typo-taxi-button w-full rounded-lg bg-ink px-6 py-3.5 font-semibold text-white disabled:opacity-50 sm:w-auto"
      >
        دیکھیں
      </button>
      {error && <p className="urdu typo-taxi-error w-full text-red-600">{error}</p>}
    </form>
  );
}
