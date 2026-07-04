import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../api/index.js';

export default function Contact() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get });
  const [sent, setSent] = useState(false);

  return (
    <>
      <Helmet>
        <title>Narang Mandi | رابطہ</title>
      </Helmet>
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-4 border-b-2 border-brand pb-2 text-2xl font-bold text-ink sm:text-3xl">رابطہ</h1>

        {settings?.contactEmail && (
          <p className="mb-4 text-gray-600">
            ای میل: <span className="text-brand">{settings.contactEmail}</span>
          </p>
        )}

        {sent ? (
          <div className="rounded-lg bg-green-50 p-4 text-green-700">
            آپ کا پیغام موصول ہو گیا۔ شکریہ!
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-4"
          >
            <input
              required
              placeholder="آپ کا نام"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-right outline-none focus:border-brand"
            />
            <input
              required
              type="email"
              placeholder="ای میل"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-right outline-none focus:border-brand"
            />
            <textarea
              required
              rows={5}
              placeholder="آپ کا پیغام"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-right outline-none focus:border-brand"
            />
            <button
              type="submit"
              className="rounded-lg bg-brand px-6 py-2 text-white hover:bg-brand-dark"
            >
              بھیجیں
            </button>
          </form>
        )}
      </div>
    </>
  );
}
