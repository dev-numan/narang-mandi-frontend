// Production web server for the React build.
//
// A plain static host (e.g. `vite preview`) can't give social crawlers
// (WhatsApp/Facebook/Twitter) per-article link previews, because those crawlers
// don't run JavaScript — they only read the raw HTML. This server serves the SPA
// like normal, but for /article/:slug it fetches the article from the API and
// injects Open Graph / Twitter meta tags (title, description, image) into the
// HTML before sending, so shared links show an image + text preview.
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 4173;
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

function injectMeta(html, { title, description, image, url }) {
  const tags = [
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="نارنگ منڈی نیوز" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    image && `<meta property="og:image" content="${esc(image)}" />`,
    image && `<meta property="og:image:secure_url" content="${esc(image)}" />`,
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    image && `<meta name="twitter:image" content="${esc(image)}" />`,
  ]
    .filter(Boolean)
    .join('\n    ');

  // Replace the default <title>/description, then add the social tags.
  return html
    .replace(/<title>.*?<\/title>/s, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(description)}" />`)
    .replace('</head>', `    ${tags}\n  </head>`);
}

// Canonical host: redirect www.* → bare apex (e.g. www.narangmandi.com →
// narangmandi.com), preserving the path + query string and forcing HTTPS.
// Runs before everything else so it applies to assets and pages alike.
app.use((req, res, next) => {
  const host = req.headers.host || '';
  if (host.startsWith('www.')) {
    return res.redirect(301, `https://${host.slice(4)}${req.originalUrl}`);
  }
  next();
});

// Static assets (hashed JS/CSS/images) — never rewrite these.
app.use(express.static(DIST, { index: false, maxAge: '1y' }));

// Article pages get server-injected meta for rich link previews.
app.get('/article/:slug', async (req, res) => {
  try {
    const r = await fetch(`${API_BASE}/api/articles/${encodeURIComponent(req.params.slug)}`);
    if (!r.ok) return res.send(template);
    const json = await r.json();
    // GET /api/articles/:slug returns { data: { article, related } }.
    const a = json?.data?.article;
    if (!a) return res.send(template);
    let image = a.coverImage || '';
    if (image && !/^https?:\/\//.test(image)) image = `${API_BASE}${image}`;
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    res.set('Cache-Control', 'public, max-age=300');
    return res.send(
      injectMeta(template, {
        title: `${a.title} — نارنگ منڈی نیوز`,
        description: a.excerpt || a.title,
        image,
        url,
      }),
    );
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
