import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registrationsApi } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Pagination from '../../components/Pagination.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

function formatDate(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'shop', label: 'Shops' },
  { key: 'driver', label: 'Drivers' },
];

const TYPE_META = {
  shop: { label: 'Shop', icon: '🛒', badge: 'bg-brand/10 text-brand', business: 'Shop name' },
  driver: { label: 'Driver', icon: '🚕', badge: 'bg-amber-100 text-amber-700', business: 'Vehicle' },
};

export default function Registrations() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [preview, setPreview] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['registrations', type, page],
    queryFn: () => registrationsApi.list({ page, limit: 20, ...(type ? { type } : {}) }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['registrations'] });
  const markRead = useMutation({ mutationFn: registrationsApi.markRead, onSuccess: invalidate });
  const remove = useMutation({
    mutationFn: registrationsApi.remove,
    onSuccess: () => {
      invalidate();
      setToDelete(null);
    },
  });

  const items = data?.data || [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Registrations</h1>
          {!isAdmin && (
            <p className="mt-1 text-sm text-gray-500">View only — editing is limited to admins.</p>
          )}
        </div>
        {data?.unread > 0 && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
            {data.unread} new
          </span>
        )}
      </div>

      <div className="mb-5 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setType(f.key);
              setPage(1);
            }}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
              type === f.key ? 'bg-brand text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">
          No registrations yet. Submissions from the home-page banners will appear here.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((r) => {
            const meta = TYPE_META[r.type] || TYPE_META.shop;
            return (
              <article
                key={r._id}
                className={`rounded-xl border p-5 shadow-sm ${
                  r.isRead ? 'border-gray-100 bg-white' : 'border-brand/30 bg-red-50/40'
                }`}
              >
                <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-2 font-bold text-gray-800">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${meta.badge}`}>
                        {meta.icon} {meta.label}
                      </span>
                      {r.name}
                      {!r.isRead && (
                        <span className="rounded bg-brand px-2 py-0.5 text-xs text-white">new</span>
                      )}
                    </p>
                    <a href={`tel:${r.contact}`} className="text-sm text-brand hover:underline" dir="ltr">
                      {r.contact}
                    </a>
                  </div>
                  <time className="text-xs text-gray-400" dir="ltr">
                    {formatDate(r.createdAt)}
                  </time>
                </header>

                <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700 sm:grid-cols-3">
                  {r.businessName && (
                    <div>
                      <dt className="text-xs text-gray-400">{meta.business}</dt>
                      <dd className="font-medium" dir="auto">
                        {r.businessName}
                      </dd>
                    </div>
                  )}
                  {r.type === 'driver' && (
                    <div>
                      <dt className="text-xs text-gray-400">Driving licence</dt>
                      <dd className="font-medium">{r.hasLicense ? 'Yes' : 'No'}</dd>
                    </div>
                  )}
                  {r.image && (
                    <div>
                      <dt className="text-xs text-gray-400">Photo</dt>
                      <dd>
                        <button
                          onClick={() => setPreview(r.image)}
                          className="font-medium text-brand hover:underline"
                        >
                          View photo
                        </button>
                      </dd>
                    </div>
                  )}
                </dl>

                <footer className="mt-4 flex gap-3 border-t border-gray-100 pt-3 text-sm">
                  <a
                    href={`https://wa.me/${r.contact.replace(/[^0-9]/g, '').replace(/^0/, '92')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-brand hover:underline"
                  >
                    WhatsApp
                  </a>
                  {isAdmin && !r.isRead && (
                    <button
                      onClick={() => markRead.mutate(r._id)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      Mark as read
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => setToDelete(r)}
                      className="mr-auto text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      )}

      {data?.totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreview(null)}
        >
          <img src={preview} alt="" className="max-h-[85vh] max-w-full rounded-lg object-contain" />
        </div>
      )}

      {isAdmin && (
        <ConfirmDialog
          open={!!toDelete}
          title="Delete registration?"
          message={toDelete ? `The registration from “${toDelete.name}” will be removed.` : ''}
          loading={remove.isPending}
          onConfirm={() => remove.mutate(toDelete._id)}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
