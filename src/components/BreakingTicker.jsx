import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { articlesApi, settingsApi } from '../api/index.js';

export default function BreakingTicker() {
  // Headlines of up to 10 articles published in the last 24 hours.
  const { data: breaking = [] } = useQuery({
    queryKey: ['breaking'],
    queryFn: articlesApi.breaking,
  });
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  // Optional manual lines from Settings → "Breaking ticker lines", then the headlines.
  const manual = (settings?.breakingTicker || []).map((text, i) => ({
    _id: `m-${i}`,
    title: text,
    slug: null,
  }));
  const items = [...manual, ...breaking];
  if (items.length === 0) return null;

  // One row of headlines. Rendered twice inside the track so the -50% scroll
  // loops seamlessly with the strip always full (no empty lead-in delay).
  const Row = ({ ariaHidden }) =>
    items.map((it) => (
      <span key={`${ariaHidden ? 'dup-' : ''}${it._id}`} className="mx-6 text-sm" aria-hidden={ariaHidden}>
        {it.slug ? (
          <Link to={`/article/${it.slug}`} className="hover:underline">
            {it.title}
          </Link>
        ) : (
          it.title
        )}
        <span className="mr-6 text-brand-light">●</span>
      </span>
    ));

  return (
    <div className="ticker-wrap flex items-stretch overflow-hidden bg-ink text-white">
      <span className="z-10 flex flex-shrink-0 items-center bg-brand px-4 text-sm font-bold">
        بریکنگ نیوز
      </span>
      <div className="relative flex-1 overflow-hidden py-2">
        <div className="animate-ticker" dir="ltr">
          <Row ariaHidden={false} />
          <Row ariaHidden={true} />
        </div>
      </div>
    </div>
  );
}
