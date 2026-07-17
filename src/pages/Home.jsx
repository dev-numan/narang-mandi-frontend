import { useQuery } from '@tanstack/react-query';
import { articlesApi, categoriesApi } from '../api/index.js';
import { SITE_NAME } from '../constants/brand.js';
import Seo from '../components/Seo.jsx';
import FeaturesHub from '../components/FeaturesHub.jsx';
import FeaturedShop from '../components/FeaturedShop.jsx';
import CategorySection from '../components/CategorySection.jsx';
import ArticleCard from '../components/ArticleCard.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Loader, { EmptyState, ErrorState } from '../components/Loader.jsx';

export default function Home() {
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
      <Seo
        title={`${SITE_NAME} — All-in-One Digital Hub`}
        socialTitle="Your city's all-in-one digital hub"
        description="Narang Mandi's all-in-one digital hub — read local news, buy and sell used products, open your own online shop, join the community chat, and more."
        path="/"
      />

      {/* Digital-hub front door: all features up top */}
      <FeaturesHub />

      {/* Highlighted shop from the marketplace */}
      <FeaturedShop />

      {/* News lives below now (we're a full hub, not only news) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="mb-10">
            <div className="mb-4 border-b-2 border-brand pb-2">
              <h2 className="text-2xl font-bold text-ink">
                <span className="urdu border-b-4 border-brand pb-2">تازہ ترین خبریں</span>
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
