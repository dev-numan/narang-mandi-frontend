import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/index.js';
import StatCard from '../components/StatCard.jsx';
import DataTable from '../components/DataTable.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';

export default function Dashboard() {
  const statsQuery = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.stats,
  });
  const recentQuery = useQuery({
    queryKey: ['admin', 'recent'],
    queryFn: () => adminApi.articles({ limit: 10 }),
  });
  const { data: stats } = statsQuery;
  const { data: recent } = recentQuery;
  const loading = statsQuery.isLoading || recentQuery.isLoading;
  const isError = statsQuery.isError || recentQuery.isError;
  const error = statsQuery.error || recentQuery.error;
  const retry = () => {
    statsQuery.refetch();
    recentQuery.refetch();
  };

  const [copiedId, setCopiedId] = useState(null);

  const copyLink = async (article) => {
    const url = `${window.location.origin}/article/${article.slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedId(article._id);
    setTimeout(() => setCopiedId((id) => (id === article._id ? null : id)), 1500);
  };

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (r) => (
        <Link
          to={`/admin/articles/${r._id}/edit`}
          title={r.title}
          className="urdu block max-w-[18rem] truncate pb-1 font-medium leading-[2.2] text-ink hover:text-brand lg:max-w-[26rem] xl:max-w-[34rem]"
        >
          {r.title}
        </Link>
      ),
    },
    { key: 'category', header: 'Category', render: (r) => <span className="urdu">{r.category?.name || '—'}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    { key: 'views', header: 'Views', render: (r) => r.views },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <Link
            to={`/admin/articles/${r._id}/edit`}
            className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
          >
            Edit
          </Link>
          <button
            onClick={() => copyLink(r)}
            className={`rounded border px-2 py-1 text-xs ${
              copiedId === r._id
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {copiedId === r._id ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <Link
          to="/admin/articles/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + New Article
        </Link>
      </div>

      {loading ? (
        <Loader label="Loading…" />
      ) : isError ? (
        <ErrorState error={error} onRetry={retry} />
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total Articles" value={stats?.total} icon="📰" accent="bg-brand" />
            <StatCard label="Published" value={stats?.published} icon="✅" accent="bg-green-600" />
            <StatCard label="Drafts" value={stats?.drafts} icon="✏️" accent="bg-amber-500" />
            <StatCard label="Total Views" value={stats?.totalViews} icon="👁️" accent="bg-sky-600" />
            <StatCard label="Categories" value={stats?.categories} icon="🏷️" accent="bg-purple-600" />
          </div>

          <h2 className="mb-3 text-lg font-semibold text-ink">Recent Articles</h2>
          <DataTable columns={columns} rows={recent?.data || []} empty="No articles yet" />
        </>
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles =
    status === 'published'
      ? 'bg-green-100 text-green-700'
      : 'bg-amber-100 text-amber-700';
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles}`}>
      {status}
    </span>
  );
}
