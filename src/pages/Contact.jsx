import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { contactApi, settingsApi } from '../api/index.js';
import { SITE_NAME } from '../constants/brand.js';
import Seo from '../components/Seo.jsx';
import {
  CONTACT_WHATSAPP_DISPLAY,
  CONTACT_WHATSAPP_URL,
  whatsAppMessageUrl,
} from '../constants/contact.js';

function ContactCard({ icon, label, children }) {
  return (
    <div className="flex gap-4 rounded-xl border border-gray-100 bg-gray-50 p-5">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-2xl">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="mb-1 text-sm font-semibold text-gray-500">{label}</p>
        {children}
      </div>
    </div>
  );
}

export default function Contact() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get });
  const email = settings?.contactEmail || 'info@narangmandi.com';
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: contactApi.send,
  });

  const errorText =
    error?.response?.status === 429
      ? 'بہت زیادہ پیغامات بھیجے گئے۔ براہِ کرم کچھ دیر بعد کوشش کریں۔'
      : error
        ? 'پیغام بھیجنے میں مسئلہ آیا۔ براہِ کرم دوبارہ کوشش کریں یا واٹس ایپ پر رابطہ کریں۔'
        : '';

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <>
      <Seo
        title={`${SITE_NAME} | رابطہ`}
        description={`${SITE_NAME} سے رابطہ کریں — واٹس ایپ ${CONTACT_WHATSAPP_DISPLAY} یا ای میل ${email}`}
        path="/contact"
      />

      <div className="mx-auto max-w-3xl">
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <h1 className="mb-2 border-b-2 border-brand pb-2 text-2xl font-bold text-ink sm:text-3xl">
            رابطہ
          </h1>
          <p className="text-gray-600 leading-loose">
            خبریں، اشتہارات، یا کسی بھی سوال کے لیے {SITE_NAME} ٹیم سے براہِ راست رابطہ کریں۔
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ContactCard icon="💬" label="واٹس ایپ">
            <a
              href={CONTACT_WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="text-lg font-bold text-brand hover:underline"
              dir="ltr"
            >
              {CONTACT_WHATSAPP_DISPLAY}
            </a>
            <p className="mt-2 text-sm text-gray-500">فوری جواب کے لیے واٹس ایپ پر پیغام بھیجیں</p>
            <a
              href={whatsAppMessageUrl('السلام علیکم، میں Narang Mandi سے رابطہ کرنا چاہتا/چاہتی ہوں۔')}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1da851]"
            >
              <span>واٹس ایپ پر پیغام بھیجیں</span>
            </a>
          </ContactCard>

          <ContactCard icon="✉️" label="ای میل">
            <a href={`mailto:${email}`} className="break-all text-lg font-bold text-brand hover:underline">
              {email}
            </a>
            <p className="mt-2 text-sm text-gray-500">تفصیلی درخواستوں کے لیے ای میل کریں</p>
          </ContactCard>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-xl font-bold text-ink">پیغام بھیجیں</h2>

          {isSuccess ? (
            <div className="rounded-lg bg-green-50 p-4 text-green-700">
              آپ کا پیغام موصول ہو گیا۔ شکریہ! ہم جلد آپ سے رابطہ کریں گے۔ فوری رابطے کے لیے
              واٹس ایپ استعمال کریں۔
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutate(form);
              }}
              className="space-y-4"
            >
              {errorText && (
                <div className="rounded-lg bg-red-50 p-4 text-red-700">{errorText}</div>
              )}
              <input
                required
                minLength={2}
                maxLength={80}
                placeholder="آپ کا نام"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-right outline-none focus:border-brand"
                {...field('name')}
              />
              <input
                required
                type="email"
                maxLength={120}
                placeholder="ای میل"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-right outline-none focus:border-brand"
                dir="ltr"
                {...field('email')}
              />
              <textarea
                required
                rows={5}
                minLength={10}
                maxLength={4000}
                placeholder="آپ کا پیغام"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-right outline-none focus:border-brand"
                {...field('message')}
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-brand px-6 py-2 text-white hover:bg-brand-dark disabled:opacity-60"
                >
                  {isPending ? 'بھیجا جا رہا ہے…' : 'بھیجیں'}
                </button>
                <a
                  href={whatsAppMessageUrl('السلام علیکم،')}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-[#25D366] px-6 py-2 text-[#25D366] hover:bg-green-50"
                >
                  واٹس ایپ پر بھیجیں
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
