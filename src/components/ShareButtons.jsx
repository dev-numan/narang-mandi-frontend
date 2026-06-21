import { useState } from 'react';

export default function ShareButtons({ title }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const text = encodeURIComponent(title || '');
  const enc = encodeURIComponent(url);

  const links = [
    ['واٹس ایپ', `https://wa.me/?text=${text}%20${enc}`, 'bg-green-600'],
    ['فیس بک', `https://www.facebook.com/sharer/sharer.php?u=${enc}`, 'bg-blue-700'],
    ['ٹوئٹر', `https://twitter.com/intent/tweet?text=${text}&url=${enc}`, 'bg-sky-500'],
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500">شیئر کریں:</span>
      {links.map(([label, href, color]) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          className={`rounded px-3 py-1.5 text-sm text-white ${color} hover:opacity-90`}
        >
          {label}
        </a>
      ))}
      <button
        onClick={copy}
        className="rounded bg-gray-700 px-3 py-1.5 text-sm text-white hover:opacity-90"
      >
        {copied ? 'کاپی ہو گیا ✓' : 'لنک کاپی کریں'}
      </button>
    </div>
  );
}
