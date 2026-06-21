import DOMPurify from 'dompurify';

// Hosts (base domains) we allow <iframe> embeds from. Anything else is stripped.
const ALLOWED_EMBED_HOSTS = [
  'youtube.com',
  'youtube-nocookie.com',
  'vimeo.com',
  'dailymotion.com',
  'facebook.com',
  'twitter.com',
  'x.com',
  'tiktok.com',
  'instagram.com',
  'spotify.com',
  'soundcloud.com',
];

function isAllowedEmbed(src) {
  try {
    const host = new URL(src, window.location.origin).hostname.replace(/^www\./, '');
    return ALLOWED_EMBED_HOSTS.some((base) => host === base || host.endsWith(`.${base}`));
  } catch {
    return false;
  }
}

// Register once: drop any <iframe> whose src isn't from an allowed host.
let hookAdded = false;
function ensureHook() {
  if (hookAdded) return;
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'iframe' && !isAllowedEmbed(node.getAttribute('src') || '')) {
      node.parentNode?.removeChild(node);
    }
  });
  hookAdded = true;
}

// Sanitize article HTML, permitting embed <iframe>s from the whitelist above.
export function sanitizeHtml(html) {
  ensureHook();
  return DOMPurify.sanitize(html || '', {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: [
      'allow',
      'allowfullscreen',
      'frameborder',
      'scrolling',
      'src',
      'width',
      'height',
      'title',
      'loading',
      'referrerpolicy',
    ],
  });
}
