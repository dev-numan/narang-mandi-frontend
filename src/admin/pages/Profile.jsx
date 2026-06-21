import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Loader from '../../components/Loader.jsx';

export default function Profile() {
  const { user, reload } = useAuth();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && !form) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        contactEmail: user.contactEmail || '',
      });
    }
  }, [user, form]);

  const saveMut = useMutation({
    mutationFn: (payload) => authApi.updateMe(payload),
    onSuccess: async () => {
      await reload();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (err) => setError(err.message),
  });

  if (!form) return <Loader label="Loading…" />;

  const submit = (e) => {
    e.preventDefault();
    setError('');
    saveMut.mutate(form);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-ink">My Profile</h1>
      <p className="mb-6 text-sm text-gray-500">
        Your contact details are optional — if you add them, they appear in the author info shown
        with your articles.
      </p>

      {saved && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">Saved ✓</div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={submit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
        <Field label="Name">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={user.role !== 'admin'}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          />
          {user.role !== 'admin' && (
            <p className="mt-1 text-xs text-gray-400">Only an admin can change your name.</p>
          )}
        </Field>

        <Field label="Login email">
          <input
            value={user.email}
            disabled
            className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500"
          />
        </Field>

        <Field label="Contact number (optional)">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="e.g. +92 300 1234567"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
          />
        </Field>

        <Field label="Public contact email (optional)">
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            placeholder="shown with your articles"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
          />
        </Field>

        <button
          type="submit"
          disabled={saveMut.isPending}
          className="rounded-lg bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {saveMut.isPending ? 'Saving…' : 'Save Profile'}
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
