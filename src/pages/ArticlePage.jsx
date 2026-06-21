import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { sanitizeHtml } from '../utils/sanitize.js';
import { articlesApi } from '../api/index.js';
import ShareButtons from '../components/ShareButtons.jsx';
import ArticleCard from '../components/ArticleCard.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Loader, { EmptyState, ErrorState } from '../components/Loader.jsx';
import { formatUrduDate } from '../utils/format.js';

export default function ArticlePage() {
  const { slug } = useParams();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => articlesApi.bySlug(slug),
  });

  const article = data?.article;
  const related = data?.related || [];

  // Count one view per browser per article (deduped via localStorage).
  // Server also skips known bots/crawlers.
  useEffect(() => {
    if (!slug) return;
    const key = `viewed:${slug}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, String(Date.now()));
    } catch {
      // localStorage unavailable (private mode) — still count once per mount
    }
    articlesApi.recordView(slug).catch(() => {});
  }, [slug]);

  const safeHtml = useMemo(
    () => (article ? sanitizeHtml(article.content || '') : ''),
    [article]
  );

  if (isLoading) return <Loader />;
  // A real 404 means the article doesn't exist; anything else (network/server)
  // is a transient failure the reader can retry.
  if (isError) {
    if (error?.status === 404) return <EmptyState label="خبر نہیں ملی" />;
    return (
      <ErrorState
        label="خبر لوڈ نہیں ہو سکی۔ براہ کرم اپنا انٹرنیٹ کنکشن چیک کریں۔"
        retryLabel="دوبارہ کوشش کریں"
        onRetry={refetch}
      />
    );
  }
  if (!article) return <EmptyState label="خبر نہیں ملی" />;

  return (
    <>
      <Helmet>
        <title>{article.title} — نارنگ منڈی نیوز</title>
        <meta name="description" content={article.excerpt || article.title} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt || article.title} />
        {article.coverImage && <meta property="og:image" content={article.coverImage} />}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <article className="min-w-0 lg:col-span-2">
          {article.category?.name && (
            <Link
              to={`/category/${article.category.slug}`}
              className="mb-2 inline-block rounded-md bg-brand px-4 py-1.5 text-sm leading-loose text-white"
            >
              {article.category.name}
            </Link>
          )}
          <h1 className="mb-3 text-3xl font-bold leading-[2.2] text-ink sm:text-4xl sm:leading-[2.3]">
            {article.title}
          </h1>

          <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            {article.author?.name && <span>تحریر: {article.author.name}</span>}
            <span>{formatUrduDate(article.publishedAt)}</span>
          </div>

          {article.coverImage && (
            <img
              src={article.coverImage}
              alt={article.title}
              className="mb-6 w-full rounded-xl object-cover"
            />
          )}

          {article.excerpt && (
            <p className="mb-6 border-r-4 border-brand bg-white p-4 text-lg font-semibold leading-loose text-gray-700 shadow-sm">
              {article.excerpt}
            </p>
          )}

          {/* Sanitized rich-text HTML */}
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />

          {article.tags?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {article.tags.map((t) => (
                <span key={t} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-gray-200 pt-4">
            <ShareButtons title={article.title} />
          </div>

          {article.author?.name &&
            (article.author.phone || article.author.contactEmail) && (
              <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="mb-2 font-bold text-ink">تحریر: {article.author.name}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  {article.author.phone && (
                    <a href={`tel:${article.author.phone}`} className="text-brand hover:underline" dir="ltr">
                      📞 {article.author.phone}
                    </a>
                  )}
                  {article.author.contactEmail && (
                    <a
                      href={`mailto:${article.author.contactEmail}`}
                      className="text-brand hover:underline"
                      dir="ltr"
                    >
                      ✉️ {article.author.contactEmail}
                    </a>
                  )}
                </div>
              </div>
            )}

          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 border-b-2 border-brand pb-2 text-2xl font-bold text-ink">
                متعلقہ خبریں
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {related.map((a) => (
                  <ArticleCard key={a._id} article={a} />
                ))}
              </div>
            </section>
          )}
        </article>

        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
