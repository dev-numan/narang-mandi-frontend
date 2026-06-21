import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import ImageUploader from '../components/ImageUploader.jsx';
import Loader from '../../components/Loader.jsx';

export default function SettingsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [form, setForm] = useState(null);
  const [tickerInput, setTickerInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const { data } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get });

  useEffect(() => {
    if (data && !form) {
      setForm({
        siteName: data.siteName || '',
        logo: data.logo || '',
        tagline: data.tagline || '',
        contactEmail: data.contactEmail || '',
        socialLinks: {
          facebook: data.socialLinks?.facebook || '',
          youtube: data.socialLinks?.youtube || '',
          twitter: data.socialLinks?.twitter || '',
          whatsapp: data.socialLinks?.whatsapp || '',
        },
      });
      setTickerInput((data.breakingTicker || []).join('\n'));
    }
  }, [data, form]);

  const saveMut = useMutation({
    mutationFn: (payload) => settingsApi.update(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (err) => setError(err.message),
  });

  if (!form) return <Loader label="Loading…" />;

  const submit = (e) => {
    e.preventDefault();
    setError('');
    // Editors can only manage social media links.
    if (!isAdmin) {
      saveMut.mutate({ socialLinks: form.socialLinks });
      return;
    }
    const breakingTicker = tickerInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    saveMut.mutate({ ...form, breakingTicker });
  };

  const setSocial = (key, value) =>
    setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: value } }));

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-ink">
        {isAdmin ? 'Site Settings' : 'Social Media'}
      </h1>

      {saved && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">Saved ✓</div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={submit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
        {isAdmin && (
          <>
            <Field label="Site name (Urdu)">
              <input
                dir="rtl"
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
              />
            </Field>
            <Field label="Tagline">
              <input
                dir="rtl"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
              />
            </Field>
            <Field label="Contact email">
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
              />
            </Field>

            <ImageUploader label="Logo" value={form.logo} onChange={(url) => setForm({ ...form, logo: url })} />
          </>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {['facebook', 'youtube', 'twitter', 'whatsapp'].map((k) => (
            <Field key={k} label={k[0].toUpperCase() + k.slice(1)}>
              <input
                value={form.socialLinks[k]}
                onChange={(e) => setSocial(k, e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                placeholder="https://…"
              />
            </Field>
          ))}
        </div>

        {isAdmin && (
          <Field label="Breaking ticker lines (one per line)">
            <textarea
              dir="rtl"
              rows={3}
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value)}
              className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
            />
          </Field>
        )}

        <button
          type="submit"
          disabled={saveMut.isPending}
          className="rounded-lg bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {saveMut.isPending ? 'Saving…' : isAdmin ? 'Save Settings' : 'Save Social Links'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
