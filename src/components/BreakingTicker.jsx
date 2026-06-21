import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Marquee from 'react-fast-marquee';
import { articlesApi, settingsApi } from '../api/index.js';

// Scroll speed in px/s. Higher = snappier.
const SPEED = 80;

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

  return (
    <div className="ticker-hover flex items-stretch overflow-hidden bg-ink text-white">
      <span className="z-10 flex flex-shrink-0 items-center bg-brand px-4 text-sm font-bold">
        بریکنگ نیوز
      </span>
      {/* dir="ltr" is required: the site is RTL (Urdu), and react-fast-marquee
          miscomputes its transforms under an RTL parent (content ends up
          off-screen). Forcing LTR here keeps the marquee math correct. */}
      <div dir="ltr" className="relative flex-1 overflow-hidden py-3.5">
        {/* autoFill repeats the headlines until the strip is full, so the loop is
            a seamless gap-free chain regardless of how many headlines there are. */}
        <Marquee autoFill speed={SPEED} pauseOnHover direction="right" gradient={false}>
          {items.map((it) => (
            <span key={it._id} className="mx-6 flex items-center whitespace-nowrap text-sm leading-loose">
              {it.slug ? (
                <Link to={`/article/${it.slug}`} className="hover:underline">
                  {it.title}
                </Link>
              ) : (
                it.title
              )}
              <span className="mr-6 text-brand-light">●</span>
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
