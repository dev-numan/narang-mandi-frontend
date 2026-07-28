import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// GA4 Measurement ID for narangmandi.com (property 547407061)
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-6NKK3ME01F';

/**
 * Sends a page_view on every client-side route change (SPA).
 * Skips admin / shop-admin panels.
 */
export default function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== 'function') return;
    const path = location.pathname + location.search;
    if (path.startsWith('/admin') || path.startsWith('/shop/admin')) return;
    window.gtag('config', GA_ID, { page_path: path });
  }, [location]);

  return null;
}
