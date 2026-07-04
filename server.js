// Production web server for the React build.
//
// A plain static host (e.g. `vite preview`) serves an empty `<div id="root">`
// shell — crawlers that don't run JavaScript (and Google's first crawl pass)
// then see a blank page with no text and no links. This server serves the SPA
// like normal, but for the main page types (home, category, article) it fetches
// data from the API and injects:
//   • per-page <title> / description / Open Graph / Twitter tags, and
//   • real crawlable HTML (headlines, text, internal links) into #root.
// React uses createRoot (not hydrate), so real users still get the full SPA —
// it simply re-renders over the injected markup on mount.
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 4173;
// Public canonical origin, used for canonical/og:url and JSON-LD.
const SITE = (process.env.SITE_URL || 'https://narangmandi.com').replace(/\/$/, '');
// Where to fetch article data from (the backend). Falls back to the build-time
// API base so a single env var works for both.
const API_BASE = (process.env.API_URL || process.env.VITE_API_BASE || '').replace(/\/$/, '');

const app = express();
const template = readFileSync(path.join(DIST, 'index.html'), 'utf-8');

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Strip HTML tags and collapse whitespace → plain text for excerpts/body.
const stripTags = (s = '') =>
  String(s)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Absolute URL for an image that may be stored as a relative /uploads path.
const imgUrl = (src = '') => {
  if (!src) return '';
  return /^https?:\/\//.test(src) ? src : `${API_BASE}${src}`;
};

// Serialize a JSON-LD object safely for embedding inside a <script> tag.
const jsonLd = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

async function apiJson(pathname) {
  try {
    const r = await fetch(`${API_BASE}${pathname}`);
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

// Replaces <title>/description, strips the static default social tags (so they
// aren't duplicated), then injects fresh per-page canonical + OG/Twitter tags
// and an optional JSON-LD block.
function injectMeta(html, { title, description, image, url, type = 'article', ld }) {
  const tags = [
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${esc(type)}" />`,
    `<meta property="og:site_name" content="Narang Mandi" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    image && `<meta property="og:image" content="${esc(image)}" />`,
    image && `<meta property="og:image:secure_url" content="${esc(image)}" />`,
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    image && `<meta name="twitter:image" content="${esc(image)}" />`,
    ld && `<script type="application/ld+json">${ld}</script>`,
  ]
    .filter(Boolean)
    .join('\n    ');

  return html
    .replace(/<title>.*?<\/title>/s, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(description)}" />`)
    .replace(/\s*<meta property="og:[^"]*"[^>]*>/g, '')
    .replace(/\s*<meta name="twitter:[^"]*"[^>]*>/g, '')
    .replace(/\s*<link rel="canonical"[^>]*>/g, '')
    .replace('</head>', `    ${tags}\n  </head>`);
}

// Injects crawlable markup into the empty root element.
const injectBody = (html, content) =>
  html.replace('<div id="root"></div>', `<div id="root">${content}</div>`);

// Shared crawlable navigation — gives every prerendered page internal links.
function renderNav(categories = []) {
  const links = [
    ['/', 'صفحۂ اول'],
    ['/places', 'مشہور مقامات'],
    ['/community', 'کمیونٹی چیٹ'],
    ['/trains', 'ٹرین اوقات'],
    ['/classifieds', 'اشتہارات'],
    ...categories.map((c) => [`/category/${c.slug}`, c.name]),
  ];
  return `<nav aria-label="زمرہ جات"><ul>${links
    .map(([href, label]) => `<li><a href="${esc(href)}">${esc(label)}</a></li>`)
    .join('')}</ul></nav>`;
}

// A list of article links (headline + image + excerpt) for crawlers.
function renderArticleList(articles = []) {
  return `<ul>${articles
    .map(
      (a) =>
        `<li><a href="/article/${esc(a.slug)}">${
          a.coverImage ? `<img src="${esc(imgUrl(a.coverImage))}" alt="${esc(a.title)}" loading="lazy" />` : ''
        }<h2>${esc(a.title)}</h2></a>${a.excerpt ? `<p>${esc(a.excerpt)}</p>` : ''}</li>`,
    )
    .join('')}</ul>`;
}

// Canonical host: redirect www.* → bare apex, preserving path + query, HTTPS.
app.use((req, res, next) => {
  const host = req.headers.host || '';
  if (host.startsWith('www.')) {
    return res.redirect(301, `https://${host.slice(4)}${req.originalUrl}`);
  }
  next();
});

// Static assets (hashed JS/CSS/images) — never rewrite these.
app.use(express.static(DIST, { index: false, maxAge: '1y' }));

// Home — latest articles + category nav, prerendered for crawlers.
app.get('/', async (req, res) => {
  const [catsJson, artsJson] = await Promise.all([
    apiJson('/api/categories'),
    apiJson('/api/articles?status=published&limit=24'),
  ]);
  const categories = catsJson?.data || [];
  const articles = artsJson?.data || [];
  const description =
    'نارنگ منڈی کی تازہ ترین خبریں، سیاست، کھیل، مقامی واقعات اور بہت کچھ۔ Narang Mandi News — latest local news from Narang Mandi.';
  const content = `${renderNav(categories)}<main><h1>نارنگ منڈی نیوز — Narang Mandi News</h1>${renderArticleList(articles)}</main>`;
  const html = injectBody(
    injectMeta(template, {
      title: 'نارنگ منڈی نیوز — Narang Mandi News | آپ کے شہر کی خبریں',
      description,
      image: `${SITE}/favicon.svg`,
      url: `${SITE}/`,
      type: 'website',
    }),
    content,
  );
  res.set('Cache-Control', 'public, max-age=300');
  res.send(html);
});

// Category pages — that category's articles, prerendered for crawlers.
app.get('/category/:slug', async (req, res) => {
  const [catsJson, artsJson] = await Promise.all([
    apiJson('/api/categories'),
    apiJson(`/api/articles?status=published&category=${encodeURIComponent(req.params.slug)}&limit=24`),
  ]);
  const categories = catsJson?.data || [];
  const articles = artsJson?.data || [];
  const cat = categories.find((c) => c.slug === req.params.slug);
  const name = cat?.name || 'زمرہ';
  const description = `${name} کی تازہ ترین خبریں — نارنگ منڈی نیوز۔`;
  const content = `${renderNav(categories)}<main><h1>${esc(name)}</h1>${renderArticleList(articles)}</main>`;
  const html = injectBody(
    injectMeta(template, {
      title: `${name} — نارنگ منڈی نیوز`,
      description,
      image: `${SITE}/favicon.svg`,
      url: `${SITE}/category/${req.params.slug}`,
      type: 'website',
    }),
    content,
  );
  res.set('Cache-Control', 'public, max-age=300');
  res.send(html);
});

// Article pages — full text, related links, NewsArticle JSON-LD, rich previews.
app.get('/article/:slug', async (req, res) => {
  try {
    const [artJson, catsJson] = await Promise.all([
      apiJson(`/api/articles/${encodeURIComponent(req.params.slug)}`),
      apiJson('/api/categories'),
    ]);
    const a = artJson?.data?.article;
    if (!a) return res.send(template);
    const related = artJson?.data?.related || [];
    const categories = catsJson?.data || [];
    const image = imgUrl(a.coverImage);
    const url = `${SITE}/article/${req.params.slug}`;
    const description = a.excerpt || stripTags(a.content).slice(0, 200) || a.title;

    const ld = jsonLd({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: a.title,
      description,
      image: image ? [image] : undefined,
      datePublished: a.publishedAt || a.createdAt,
      dateModified: a.updatedAt || a.createdAt,
      author: a.author?.name
        ? { '@type': 'Person', name: a.author.name }
        : { '@type': 'Organization', name: 'نارنگ منڈی نیوز' },
      publisher: {
        '@type': 'Organization',
        name: 'نارنگ منڈی نیوز',
        logo: { '@type': 'ImageObject', url: `${SITE}/favicon.svg` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      articleSection: a.category?.name || undefined,
    });

    const content = `${renderNav(categories)}<main><article>
      <h1>${esc(a.title)}</h1>
      ${image ? `<img src="${esc(image)}" alt="${esc(a.title)}" />` : ''}
      <p>${esc(description)}</p>
      <div>${esc(stripTags(a.content))}</div>
    </article>${
      related.length ? `<aside><h2>متعلقہ خبریں</h2>${renderArticleList(related)}</aside>` : ''
    }</main>`;

    const html = injectBody(
      injectMeta(template, {
        title: `${a.title} — نارنگ منڈی نیوز`,
        description,
        image,
        url,
        type: 'article',
        ld,
      }),
      content,
    );
    res.set('Cache-Control', 'public, max-age=300');
    return res.send(html);
  } catch {
    return res.send(template);
  }
});

// Sitemap — the dynamic XML lives on the API server (root route, not under
// /api), so nginx never proxies it to this host. Fetch it from the backend and
// re-serve it with the correct content type. Without this, the SPA catch-all
// below returns index.html for /sitemap.xml and Google discards it as non-XML.
app.get('/sitemap.xml', async (req, res) => {
  try {
    const r = await fetch(`${API_BASE}/sitemap.xml`);
    if (!r.ok) return res.status(502).type('application/xml').send('');
    const xml = await r.text();
    res.set('Cache-Control', 'public, max-age=3600');
    return res.type('application/xml').send(xml);
  } catch {
    return res.status(502).type('application/xml').send('');
  }
});

// SPA fallback for every other route.
app.get('*', (req, res) => res.send(template));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[web] serving build on :${PORT} (API_BASE=${API_BASE || 'unset'})`);
});
