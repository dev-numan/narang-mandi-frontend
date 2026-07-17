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
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { HOME_H1 } from './src/constants/brand.js';
import { DEFAULT_SOCIAL_LINKS } from './src/constants/social.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 4173;
// Public canonical origin, used for canonical/og:url and JSON-LD.
const SITE = (process.env.SITE_URL || 'https://narangmandi.com').replace(/\/$/, '');
const SITE_NAME = 'Narang Mandi';
// All-in-one digital hub positioning (news, buy & sell, online shops, community).
const HUB_TITLE = 'Narang Mandi — All-in-One Digital Hub';
const HUB_TAGLINE = "Your city's all-in-one digital hub";
const HUB_DESC =
  "Narang Mandi's all-in-one digital hub — read local news, buy and sell used products, open your own online shop, join the community chat, and more.";
// Default 1200x630 social share image (a real raster — social platforms reject SVG).
const OG_IMAGE = `${SITE}/og-default.png`;
// Where to fetch article data from (the backend). Falls back to the build-time
// API base so a single env var works for both.
const API_BASE = (process.env.API_URL || process.env.VITE_API_BASE || '').replace(/\/$/, '');

const app = express();
app.disable('x-powered-by');
app.use(compression());
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
// aren't duplicated), then injects fresh per-page canonical + OG/Twitter tags,
// a robots directive and an optional JSON-LD block.
function injectMeta(html, { title, description, image, url, type = 'article', ld, noindex = false }) {
  const img = image || OG_IMAGE;
  const tags = [
    `<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow'}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${esc(type)}" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(img)}" />`,
    `<meta property="og:image:secure_url" content="${esc(img)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(img)}" />`,
    ld && `<script type="application/ld+json">${ld}</script>`,
  ]
    .filter(Boolean)
    .join('\n    ');

  return html
    .replace(/<title>.*?<\/title>/s, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(description)}" />`)
    .replace(/\s*<meta name="robots"[^>]*>/g, '')
    .replace(/\s*<meta property="og:[^"]*"[^>]*>/g, '')
    .replace(/\s*<meta name="twitter:[^"]*"[^>]*>/g, '')
    .replace(/\s*<link rel="canonical"[^>]*>/g, '')
    .replace('</head>', `    ${tags}\n  </head>`);
}

// The loading spinner and the #ssr-fallback hide-rule now live in index.html,
// so the centered red spinner shows on every route until React mounts. Here we
// only insert the crawlable fallback as the first child of #root — hidden from
// JS visitors by CSS, shown to non-JS crawlers via <noscript>.
const injectBody = (html, content) =>
  html.replace('<div id="root">', `<div id="root"><div id="ssr-fallback">${content}</div>`);

// Shared crawlable navigation — gives every prerendered page internal links.
function renderNav(categories = []) {
  const links = [
    ['/', 'صفحۂ اول'],
    ['/places', 'مقامات'],
    ['/community', 'کمیونٹی'],
    ['/trains', 'ٹرین'],
    ['/classifieds', 'اشتہارات'],
    ...categories.map((c) => [`/category/${c.slug}`, c.name.length > 24 ? `${c.name.slice(0, 24)}…` : c.name]),
  ];
  return `<nav aria-label="زمرہ جات"><ul>${links
    .map(([href, label]) => `<li><a href="${esc(href)}">${esc(label)}</a></li>`)
    .join('')}</ul></nav>`;
}

function renderFooterSocial() {
  const links = [
    ['Facebook', DEFAULT_SOCIAL_LINKS.facebook],
    ['YouTube', DEFAULT_SOCIAL_LINKS.youtube],
    ['WhatsApp', DEFAULT_SOCIAL_LINKS.whatsapp],
  ].filter(([, href]) => href);
  return `<footer><nav aria-label="Social media"><ul>${links
    .map(([label, href]) => `<li><a href="${esc(href)}" rel="noopener noreferrer">${esc(label)}</a></li>`)
    .join('')}</ul></nav></footer>`;
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
  const content = `${renderNav(categories)}<main><h1>${esc(HOME_H1)}</h1><p>${esc(HUB_TAGLINE)} — news, buy &amp; sell, online shops &amp; community. ${esc(HOME_H1)}.</p>${renderArticleList(articles)}</main>${renderFooterSocial()}`;
  const html = injectBody(
    injectMeta(template, {
      title: HUB_TITLE,
      description: HUB_DESC,
      image: OG_IMAGE,
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
  const description = `Browse ${name} on ${SITE_NAME} — your all-in-one digital hub for news, buy & sell, online shops and community.`;
  const content = `${renderNav(categories)}<main><h1>${esc(name)}</h1>${renderArticleList(articles)}</main>`;
  const html = injectBody(
    injectMeta(template, {
      title: `${name} | ${SITE_NAME}`,
      description,
      image: OG_IMAGE,
      url: `${SITE}/category/${req.params.slug}`,
      type: 'website',
      noindex: !cat, // unknown category → don't index
    }),
    content,
  );
  res.status(cat ? 200 : 404).set('Cache-Control', 'public, max-age=300');
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
    // Real 404 for a missing article (avoids a soft-404 indexed with a stale title).
    if (!a) return res.status(404).send(template);
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
      image: image ? [image] : [OG_IMAGE],
      datePublished: a.publishedAt || a.createdAt,
      dateModified: a.updatedAt || a.createdAt,
      author: a.author?.name
        ? { '@type': 'Person', name: a.author.name }
        : { '@type': 'Organization', name: SITE_NAME },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: { '@type': 'ImageObject', url: OG_IMAGE },
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
        title: `${a.title} | ${SITE_NAME}`,
        description,
        image: image || OG_IMAGE,
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

// Legacy static-site URLs (old .html pages) → current routes.
const LEGACY_REDIRECTS = {
  '/home.html': '/',
  '/contact-us.html': '/contact',
};
app.get(Object.keys(LEGACY_REDIRECTS), (req, res) => {
  res.redirect(301, LEGACY_REDIRECTS[req.path]);
});

// Sitemaps — the dynamic XML lives on the API server (root routes, not under
// /api), so nginx never proxies them to this host. Fetch from the backend and
// re-serve with the correct content type.
async function proxyXml(apiPath, res) {
  try {
    const r = await fetch(`${API_BASE}${apiPath}`);
    if (!r.ok) return res.status(502).type('application/xml').send('');
    const xml = await r.text();
    res.set('Cache-Control', 'public, max-age=3600');
    return res.type('application/xml').send(xml);
  } catch {
    return res.status(502).type('application/xml').send('');
  }
}
app.get('/sitemap.xml', (req, res) => proxyXml('/sitemap.xml', res));
app.get('/news-sitemap.xml', (req, res) => proxyXml('/news-sitemap.xml', res));

// SPA fallback for every other route. The client renders <NotFound/> (noindex)
// for unknown paths, so these are kept out of the index even though we return
// the shell here.
app.get('*', (req, res) => res.send(template));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[web] serving build on :${PORT} (API_BASE=${API_BASE || 'unset'})`);
});
