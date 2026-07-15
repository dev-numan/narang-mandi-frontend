import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { articlesApi, categoriesApi } from '../api/index.js';
import { SITE_NAME } from '../constants/brand.js';
import Seo from '../components/Seo.jsx';
import ArticleCard from '../components/ArticleCard.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Pagination from '../components/Pagination.jsx';
import Loader, { EmptyState } from '../components/Loader.jsx';

export default function CategoryPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(1);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });
  const category = categories.find((c) => c.slug === slug);

  const { data, isLoading } = useQuery({
    queryKey: ['articles', 'category-page', slug, page],
    queryFn: () => articlesApi.list({ category: slug, page, limit: 9 }),
  });
  const articles = data?.data || [];

  return (
    <>
      <Seo
        title={`${SITE_NAME} | ${category?.name || 'زمرہ'}`}
        description={`${category?.name || 'زمرہ'} کی تازہ ترین خبریں — نارنگ منڈی`}
        path={`/category/${slug}`}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 border-b-2 border-brand pb-2">
            <h1 className="text-3xl font-bold text-ink">{category?.name || slug}</h1>
            {category?.description && (
              <p className="mt-1 text-sm text-gray-500">{category.description}</p>
            )}
          </div>

          {isLoading ? (
            <Loader />
          ) : articles.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <ArticleCard key={a._id} article={a} />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={data?.totalPages} onChange={setPage} />
        </div>

        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
