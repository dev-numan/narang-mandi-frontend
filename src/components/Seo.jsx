import { Helmet } from 'react-helmet-async';
import { SITE_NAME, SITE_URL } from '../constants/brand.js';

// Centralised per-page SEO: title, description, canonical, Open Graph, Twitter,
// optional JSON-LD, robots noindex, and article publish/modify times. Every
// page should render exactly one <Seo/> so Google and (non-JS) social scrapers
// get correct, unique metadata for each URL.
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

export default function Seo({
  title, // full <title> text
  socialTitle, // og/twitter title (defaults to the headline, no brand suffix)
  description,
  path = '', // e.g. "/article/abc" → canonical + og:url
  image,
  type = 'website',
  noindex = false,
  publishedTime,
  modifiedTime,
  jsonLd, // object or array of JSON-LD objects
  children,
}) {
  const url = `${SITE_URL}${path}`;
  const img = image || DEFAULT_IMAGE;
  const ogTitle = socialTitle || title;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      {noindex ? (
        <meta name="robots" content="noindex, follow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:locale" content="ur_PK" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {ogTitle && <meta name="twitter:title" content={ogTitle} />}
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={img} />

      {blocks.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
      {children}
    </Helmet>
  );
}
