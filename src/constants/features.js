import { SITE_NAME, SITE_NAME_URDU } from './brand.js';

/**
 * Canonical hub feature names + Urdu blurbs.
 * Used on home cards, page H1s, nav labels, and SEO descriptions.
 * Keep `title` as the public name everywhere (cards, pages, nav).
 */
export const FEATURES = {
  classifieds: {
    to: '/classifieds',
    title: 'Kharid o Farokht',
    description: 'خرید و فروخت، نوکریاں اور گاڑیاں — نارنگ منڈی',
    icon: '🏷️',
    gradient: 'from-amber-500 to-orange-600',
    image: '/feature-classifieds.png',
  },
  news: {
    to: '/category/local',
    title: 'Taaza Khabrein',
    description: 'نارنگ منڈی اور گردونواح کی تازہ ترین مقامی خبریں پڑھیں',
    icon: '📰',
    gradient: 'from-rose-600 to-red-700',
    image: '/feature-news.png',
  },
  trains: {
    to: '/trains',
    title: 'Train Auqaat',
    description: 'نارنگ منڈی ریلوے اسٹیشن پر ٹرینوں کے آمد و روانگی کے اوقات دیکھیں',
    icon: '🚆',
    gradient: 'from-sky-600 to-blue-700',
    image: '/feature-trains.png',
  },
  places: {
    to: '/places',
    title: 'Mashhoor Maqamat',
    description: 'شہر کے اہم مقامات، دفاتر، ہسپتال اور خدمات کی معلومات حاصل کریں',
    icon: '📍',
    gradient: 'from-violet-600 to-purple-700',
    image: '/feature-places.png',
  },
  community: {
    to: '/community',
    title: 'Community Chat',
    description: 'مقامی لوگوں سے بات چیت کریں اور روزمرہ معلومات کا تبادلہ کریں',
    icon: '💬',
    gradient: 'from-emerald-600 to-green-700',
    image: '/feature-community.png',
  },
  shops: {
    to: '/shops',
    title: 'Narang Bazaar',
    description: 'مقامی دکانیں آن لائن دیکھیں اور گھر بیٹھے آرڈر کریں',
    icon: '🛒',
    gradient: 'from-brand to-brand-dark',
    image: '/feature-shops.png',
  },
  taxi: {
    to: '/taxi',
    title: 'Online Taxi',
    description: ' شہر میں آن لائن ٹیکسی بکنگ حاصل کریں',
    icon: '🚕',
    gradient: 'from-yellow-500 to-amber-600',
    image: '/feature-taxi.png',
  },
};

/** Ordered list for the home FeaturesHub grid */
export const FEATURES_LIST = [
  FEATURES.classifieds,
  FEATURES.news,
  FEATURES.trains,
  FEATURES.places,
  FEATURES.community,
  FEATURES.shops,
  FEATURES.taxi,
];

/** SEO title: "Narang Mandi | Kharid o Farokht" */
export function featureSeoTitle(feature) {
  return `${SITE_NAME} | ${feature.title}`;
}

export function featurePageHeading(feature) {
  return feature.title;
}

export { SITE_NAME_URDU };
