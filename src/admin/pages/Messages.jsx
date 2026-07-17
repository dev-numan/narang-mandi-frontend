import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactApi } from '../../api/index.js';
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

export default function Messages() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['contact-messages', page],
    queryFn: () => contactApi.list({ page, limit: 20 }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['contact-messages'] });
  const markRead = useMutation({ mutationFn: contactApi.markRead, onSuccess: invalidate });
  const remove = useMutation({
    mutationFn: contactApi.remove,
    onSuccess: () => {
      invalidate();
      setToDelete(null);
    },
  });

  const messages = data?.data || [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
        {data?.unread > 0 && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
            {data.unread} unread
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">
          No messages yet. Messages sent from the contact page will appear here.
        </p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <article
              key={m._id}
              className={`rounded-xl border p-5 shadow-sm ${
                m.isRead ? 'border-gray-100 bg-white' : 'border-brand/30 bg-red-50/40'
              }`}
            >
              <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-gray-800">
                    {m.name}
                    {!m.isRead && (
                      <span className="mr-2 inline-block rounded bg-brand px-2 py-0.5 text-xs text-white">
                        new
                      </span>
                    )}
                  </p>
                  <a
                    href={`mailto:${m.email}`}
                    className="text-sm text-brand hover:underline"
                    dir="ltr"
                  >
                    {m.email}
                  </a>
                </div>
                <time className="text-xs text-gray-400" dir="ltr">
                  {formatDate(m.createdAt)}
                </time>
              </header>

              <p className="whitespace-pre-wrap text-gray-700" dir="auto">
                {m.message}
              </p>

              <footer className="mt-4 flex gap-3 border-t border-gray-100 pt-3 text-sm">
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent('Re: Narang Mandi')}`}
                  className="font-semibold text-brand hover:underline"
                >
                  Reply
                </a>
                {!m.isRead && (
                  <button
                    onClick={() => markRead.mutate(m._id)}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    Mark as read
                  </button>
                )}
                <button
                  onClick={() => setToDelete(m)}
                  className="mr-auto text-red-600 hover:underline"
                >
                  Delete
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}

      {data?.totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete message?"
        message={toDelete ? `The message from “${toDelete.name}” will be removed.` : ''}
        loading={remove.isPending}
        onConfirm={() => remove.mutate(toDelete._id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
