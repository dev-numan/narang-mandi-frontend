import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { articlesApi } from '../api/index.js';
import { SITE_NAME } from '../constants/brand.js';
import ArticleCard from '../components/ArticleCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Pagination from '../components/Pagination.jsx';
import Loader, { EmptyState } from '../components/Loader.jsx';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['search', q, page],
    queryFn: () => articlesApi.list({ search: q, page, limit: 9 }),
    enabled: q.length > 0,
  });
  const articles = data?.data || [];

  return (
    <>
      <Helmet>
        <title>{SITE_NAME} | تلاش: {q}</title>
        <meta property="og:site_name" content={SITE_NAME} />
      </Helmet>

      <div className="mx-auto mb-6 max-w-2xl">
        <SearchBar />
      </div>

      <h1 className="mb-6 text-2xl font-bold text-ink">
        نتائج برائے: <span className="text-brand">{q}</span>
      </h1>

      {!q ? (
        <EmptyState label="تلاش کے لیے کوئی لفظ لکھیں" />
      ) : isLoading ? (
        <Loader />
      ) : articles.length === 0 ? (
        <EmptyState label="کوئی نتیجہ نہیں ملا" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a._id} article={a} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={data?.totalPages} onChange={setPage} />
    </>
  );
}
