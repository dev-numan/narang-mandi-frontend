import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '../api/index.js';
import { SITE_NAME } from '../constants/brand.js';
import Seo from '../components/Seo.jsx';
import { getClientId } from '../utils/identity.js';
import { useChatProfile } from '../components/CommunityLayout.jsx';
import { timeAgoUrdu, toUrduNumber } from '../utils/format.js';
import Loader, { EmptyState } from '../components/Loader.jsx';

const EMPTY = { title: '', description: '' };

function NewThreadModal({ displayName, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: (payload) => communityApi.createThread(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['threads'] });
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  const submit = (e) => {
    e.preventDefault();
    setError('');
    mut.mutate({ ...form, authorName: displayName, clientId: getClientId() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="urdu mb-4 text-lg font-bold text-ink">نیا چیٹ روم بنائیں</h3>
        {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div className="space-y-3">
          <input
            dir="rtl"
            required
            placeholder="چیٹ روم کا نام *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
          />
          <textarea
            dir="rtl"
            rows={3}
            placeholder="تفصیل (اختیاری)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
          />
          <p className="urdu text-xs text-gray-400">
            بطور <span className="font-semibold text-ink">{displayName}</span> بنایا جائے گا
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="urdu rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            منسوخ کریں
          </button>
          <button
            type="submit"
            disabled={mut.isPending}
            className="urdu rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {mut.isPending ? 'بن رہا ہے…' : 'شروع کریں'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CommunityPage() {
  const [showNew, setShowNew] = useState(false);
  const { displayName, openProfile } = useChatProfile();

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['threads'],
    queryFn: () => communityApi.threads(),
    refetchInterval: 15000,
  });

  return (
    <>
      <Seo
        title={`${SITE_NAME} | کمیونٹی چیٹ`}
        description="نارنگ منڈی کمیونٹی چیٹ — چیٹ رومز بنائیں اور براہِ راست گفتگو میں شامل ہوں"
        path="/community"
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-brand pb-3">
        <div>
          <h1 className="urdu text-3xl font-bold text-ink">کمیونٹی چیٹ</h1>
          <p className="urdu mt-1 text-sm text-gray-500">شہر کے چیٹ رومز میں براہِ راست گفتگو کریں</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openProfile}
            className="urdu rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            title="نام / زبان تبدیل کریں"
          >
            ⚙ {displayName}
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="urdu rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            + نیا چیٹ روم
          </button>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : threads.length === 0 ? (
        <EmptyState label="ابھی کوئی چیٹ روم موجود نہیں — پہلا روم آپ بنائیں!" />
      ) : (
        <div className="space-y-3">
          {threads.map((t) => (
            <Link
              key={t._id}
              to={`/community/${t.slug}`}
              className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-brand hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="urdu text-lg font-bold text-ink">{t.title}</h2>
                <span className="urdu shrink-0 rounded-full bg-brand/10 px-2 py-0.5 pb-2 text-xs text-brand">
                  {toUrduNumber(t.messageCount)}&nbsp; &nbsp;&nbsp;پیغامات
                </span>
              </div>
              {t.description && <p className="urdu mt-1 line-clamp-2 text-sm text-gray-600">{t.description}</p>}
              <div className="urdu mt-2 flex items-center gap-2 text-xs text-gray-400">
                <span>{t.authorName}</span>
                <span>•</span>
                <span>{timeAgoUrdu(t.lastActivityAt)}</span>
                {t.isLocked && <span className="text-amber-600">• 🔒 بند</span>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showNew && <NewThreadModal displayName={displayName} onClose={() => setShowNew(false)} />}
    </>
  );
}
