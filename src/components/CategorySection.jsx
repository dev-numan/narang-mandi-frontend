import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { articlesApi } from '../api/index.js';
import ArticleCard from './ArticleCard.jsx';

export default function CategorySection({ category }) {
  const { data } = useQuery({
    queryKey: ['articles', 'category', category.slug],
    queryFn: () => articlesApi.list({ category: category.slug, limit: 4 }),
  });
  const articles = data?.data || [];
  if (articles.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between border-b-2 border-brand pb-2">
        <h2 className="text-2xl font-bold text-ink">
          <span className="border-b-4 border-brand pb-2">{category.name}</span>
        </h2>
        <Link
          to={`/category/${category.slug}`}
          className="text-sm text-brand hover:underline"
        >
          مزید پڑھیں ←
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((a) => (
          <ArticleCard key={a._id} article={a} />
        ))}
      </div>
    </section>
  );
}
