import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { articlesApi, categoriesApi, settingsApi } from '../api/index.js';
import HeroCarousel from '../components/HeroCarousel.jsx';
import CategorySection from '../components/CategorySection.jsx';
import ArticleCard from '../components/ArticleCard.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Loader, { EmptyState, ErrorState } from '../components/Loader.jsx';

export default function Home() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });
  // نمایاں خبریں → latest 4 published articles
  const {
    data: featuredData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['articles', 'latest-featured'],
    queryFn: () => articlesApi.list({ limit: 4 }),
  });
  const featured = featuredData?.data || [];

  return (
    <>
      <Helmet>
        <title>Narang Mandi | {settings?.siteName || 'نارنگ منڈی نیوز'} — تازہ ترین خبریں</title>
      </Helmet>

      <HeroCarousel />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Featured block */}
          <section className="mb-10">
            <div className="mb-4 border-b-2 border-brand pb-2">
              <h2 className="text-2xl font-bold text-ink">
                <span className="border-b-4 border-brand pb-2">نمایاں خبریں</span>
              </h2>
            </div>
            {isLoading ? (
              <Loader />
            ) : isError ? (
              <ErrorState
                label="خبریں لوڈ نہیں ہو سکیں۔ براہ کرم اپنا انٹرنیٹ کنکشن چیک کریں۔"
                retryLabel="دوبارہ کوشش کریں"
                onRetry={refetch}
              />
            ) : featured.length === 0 ? (
              <EmptyState label="ابھی کوئی نمایاں خبر نہیں" />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {featured.map((a) => (
                  <ArticleCard key={a._id} article={a} />
                ))}
              </div>
            )}
          </section>

          {/* Per-category sections */}
          {categories.map((c) => (
            <CategorySection key={c._id} category={c} />
          ))}
        </div>

        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
