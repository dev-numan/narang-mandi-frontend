/**
 * Site-wide typography — edit values here only.
 * Saved changes apply live (Vite HMR) via applyTypography().
 *
 * Tip: bump `scale` to multiply EVERY font size (1 = normal, 1.1 = +10%).
 * Tip: bump lineHeight.body / lineHeight.article for space between rows.
 *
 * Tailwind: text-xs → size.xs · text-sm → size.sm · text-lg → size.lg · etc.
 * Banners: size.bannerTitle / bannerSubtitle / …
 * Feature cards: size.featureCardTitle / featureCardDesc
 * Article cards: size.articleCardTitle / articleCardExcerpt / articleCardMeta
 * Article page: size.articlePageTitle / articlePageExcerpt / article (body)
 * Sidebar: size.sidebarHeading / sidebarItem
 * Classifieds: size.classifiedPageTitle / classifiedCardTitle / …
 * Trains: size.trainPageTitle / trainName / trainTime / …
 * Places: size.placePageTitle / placeCardName / …
 * Shop admin: size.shopPageTitle / shopLoginTitle / shopStatValue / …
 */

export const TYPOGRAPHY = {
  /**
   * Multiplies every font size by this factor.
   * 1 = default · 1.1 = 10% larger · 0.9 = 10% smaller
   */
  scale: 1,

  fontFamily: {
    body: "'Poppins', 'Jameel Noori Nastaleeq', system-ui, sans-serif",
    urdu: "'Jameel Noori Nastaleeq', 'Poppins', serif",
    nastaleeq: "'Jameel Noori Nastaleeq', serif",
    admin: "'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif",
  },

  /** Font sizes — rem recommended (1rem ≈ 16px). Scaled by `scale` above. */
  size: {
    xs: '0.75rem', // 12px — Tailwind text-xs
    sm: '0.875rem', // 14px — Tailwind text-sm
    base: '1rem', // 16px — body default
    lg: '2rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    h1: '1.9rem',
    h2: '1.6rem',
    h3: '1.35rem',
    h4: '1.15rem',
    article: '1.5rem',
    editor: '1rem',
    ticker: '1.25rem',
    tickerLabel: '1rem',
    headerMeta: '1.2rem',
    nav: '1.2rem',

    /** Home feature cards */
    featureCardTitle: '2rem', // Narang OLX, Taaza Khabrein…
    featureCardDesc: '1.2rem', // Urdu subheading under each card title

    /** News article cards (تازہ ترین خبریں grid) */
    articleCardTitle: '1.5rem', // article headline under the image
    articleCardExcerpt: '1.1rem', // summary under title
    articleCardMeta: '0.75rem', // category + date

    /** Full article page (/article/…) */
    articlePageTitle: '2.25rem', // H1 title above the cover
    articlePageExcerpt: '1.5rem', // red-bordered lead paragraph
    // body paragraphs use size.article above

    /** Sidebar (مقبول خبریں / زمرہ جات) */
    sidebarHeading: '1.5rem', // مقبول خبریں، زمرہ جات
    sidebarItem: '1.2rem', // trending headlines + category pills

    /** Narang OLX / classifieds page */
    classifiedPageTitle: '1.875rem', // Narang OLX H1
    classifiedPageDesc: '1.2rem', // خرید و فروخت… under H1
    classifiedCardTitle: '1.2rem', // listing title e.g. Honda CD 70
    classifiedCardPrice: '1.1rem', // Rs 80,000
    classifiedCardMeta: '1.1rem', // location / phone / category
    classifiedSidebarHeading: '1.5rem', // زمرہ جات / چیز فروخت ہو گئی؟
    classifiedSidebarItem: '1.1rem', // تمام اشتہارات، خرید و فروخت…
    classifiedSidebarDesc: '1.1rem', // mark-sold instructions
    classifiedSidebarAction: '1rem', // فروخت شدہ قرار دیں button + inputs

    /** Train Auqaat page */
    trainPageTitle: '1.875rem', // Train Auqaat H1
    trainPageDesc: '1.2rem', // نارنگ منڈی ریلوے… under H1
    trainName: '1.5rem', // علامہ اقبال ایکسپریس
    trainNameEn: '1rem', // Allama Iqbal Express
    trainDirection: '1.15rem', // اپ (Up) / ڈاؤن (Down)
    trainBadge: '0.9rem', // Up 9 / Down 10
    trainRoute: '1rem', // سیالکوٹ ← کراچی
    trainTimeLabel: '0.9rem', // آمد / روانگی
    trainTime: '1.5rem', // 10:42 AM
    trainNote: '1rem', // نوٹ about summer timetable

    /** Mashhoor Maqamat / places page */
    placePageTitle: '1.875rem', // Mashhoor Maqamat H1
    placePageDesc: '1.2rem', // شہر کے اہم مقامات… under H1
    placeCardName: '1.35rem', // Ajwad Mobile Zone
    placeCardCategory: '0.95rem', // category pill
    placeCardMeta: '1.05rem', // address / phone / rating / hours
    placeCardCta: '1.05rem', // گوگل میپ پر دیکھیں
    placeSidebarHeading: '1.5rem', // زمرہ جات
    placeSidebarItem: '1.1rem', // تمام مقامات + categories

    /**
     * Online Taxi page (/taxi)
     *
     * taxiInput is floored at 16px in index.css rather than here: Safari on iOS
     * zooms into any focused input rendering below 16px and never zooms back
     * out, and `scale` above could otherwise drag this under that line.
     */
    taxiPageTitle: '1.875rem', // Online Taxi H1
    taxiPageDesc: '1.2rem', // شہر میں آن لائن ٹیکسی… under H1
    taxiLabel: '1.15rem', // کہاں سے؟ / آپ کا نام
    taxiInput: '1.15rem', // every input + textarea on the page
    taxiHint: '1.05rem', // ڈرائیور اپنی قیمت بھیجیں گے…
    taxiButton: '1.25rem', // ڈرائیوروں کو بھیجیں
    taxiError: '1.05rem', // validation + server errors
    taxiSectionTitle: '1.2rem', // پہلے سے درخواست بھیج چکے ہیں؟
    taxiCode: '1.5rem', // the ride code itself
    taxiBadge: '1rem', // پیشکشوں کا انتظار status pill
    taxiCardTitle: '1.2rem', // driver name on a bid card
    taxiCardMeta: '1.05rem', // vehicle / ETA under the name
    taxiPrice: '1.35rem', // the fare — what people actually compare

    /** Registration banners (shop / driver) */
    bannerTitle: '2.35rem', // بطور ڈرائیور… / اپنی دکان…
    bannerSubtitle: '1.4rem', // گھر بیٹھے آرڈر… / اگر آپ ریسٹورنٹ…
    bannerHighlight: '2.5rem', // بالکل مفت — big prominent line
    bannerPerk: '1.1rem',
    bannerCta: '1.5rem', // ابھی رجسٹر کریں
    bannerBadge: '2rem', // ڈرائیور / کاروباری حضرات کے لیے خوشخبری

    /** Shop admin login (/shop/admin/login) */
    shopLoginTitle: '2rem',
    shopLoginSubtitle: '0.875rem',
    shopLoginLabel: '1rem',
    shopLoginInput: '1rem',
    shopLoginButton: '1.2rem',
    shopLoginError: '0.875rem',

    /** Shop admin sidebar + top header */
    shopAdminBrand: '1rem',
    shopAdminNavItem: '1rem',
    shopAdminNavFooter: '0.875rem',
    shopHeaderName: '0.875rem', // user name in top bar
    shopHeaderRole: '0.75rem', // Shopkeeper
    shopHeaderLogout: '0.875rem',

    /** Shared across shop admin pages */
    shopPageTitle: '1.5rem', // Dashboard, Products, Orders… H1
    shopPageSubtitle: '1.125rem', // shop name under dashboard title
    shopSectionTitle: '1.25rem', // Language / Change password
    shopBody: '0.875rem', // general body / tabs / buttons
    shopMeta: '0.75rem', // badges, dates, small actions
    shopLabel: '0.875rem', // form labels
    shopInput: '1rem', // form inputs / textareas
    shopButton: '0.875rem', // primary / secondary buttons
    shopButtonSm: '0.875rem', // Edit / Delete in tables
    shopHint: '0.875rem', // helper text under section titles
    shopAlert: '0.875rem', // error / success banners
    shopModalTitle: '1.125rem', // product / category modal H3
    shopTab: '0.875rem', // order status filter pills
    shopStatValue: '1.5rem', // dashboard big numbers
    shopStatLabel: '0.875rem', // dashboard card labels
    shopOrderBadge: '0.75rem',
    shopOrderMeta: '1.1rem', // address / note / date
    shopOrderBody: '1.05rem', // customer + line items
    shopOrderTotal: '0.875rem',
    shopDropdown: '0.875rem', // status dropdown
    shopTableHeader: '0.75rem',
    shopTableCell: '1.1rem',
    shopPagination: '0.875rem',
  },

  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  lineHeight: {
    body: '2.1',
    tight: '1.4',
    snug: '1.6',
    heading: '1.8',
    article: '2.3',
    articleHeading: '1.8',
    input: '2.2',
    editor: '2.2',
    admin: '1.5',
  },
};

function scaleSize(value) {
  const scale = Number(TYPOGRAPHY.scale) || 1;
  if (scale === 1) return value;
  const m = String(value).trim().match(/^(-?[\d.]+)([a-z%]*)$/i);
  if (!m) return value;
  const num = parseFloat(m[1]) * scale;
  const unit = m[2] || '';
  return `${Math.round(num * 1000) / 1000}${unit}`;
}

const CSS_VAR_MAP = {
  '--typo-font-body': () => TYPOGRAPHY.fontFamily.body,
  '--typo-font-urdu': () => TYPOGRAPHY.fontFamily.urdu,
  '--typo-font-nastaleeq': () => TYPOGRAPHY.fontFamily.nastaleeq,
  '--typo-font-admin': () => TYPOGRAPHY.fontFamily.admin,

  '--typo-size-xs': () => scaleSize(TYPOGRAPHY.size.xs),
  '--typo-size-sm': () => scaleSize(TYPOGRAPHY.size.sm),
  '--typo-size-base': () => scaleSize(TYPOGRAPHY.size.base),
  '--typo-size-lg': () => scaleSize(TYPOGRAPHY.size.lg),
  '--typo-size-xl': () => scaleSize(TYPOGRAPHY.size.xl),
  '--typo-size-2xl': () => scaleSize(TYPOGRAPHY.size['2xl']),
  '--typo-size-3xl': () => scaleSize(TYPOGRAPHY.size['3xl']),
  '--typo-size-4xl': () => scaleSize(TYPOGRAPHY.size['4xl']),
  '--typo-size-h1': () => scaleSize(TYPOGRAPHY.size.h1),
  '--typo-size-h2': () => scaleSize(TYPOGRAPHY.size.h2),
  '--typo-size-h3': () => scaleSize(TYPOGRAPHY.size.h3),
  '--typo-size-h4': () => scaleSize(TYPOGRAPHY.size.h4),
  '--typo-size-article': () => scaleSize(TYPOGRAPHY.size.article),
  '--typo-size-editor': () => scaleSize(TYPOGRAPHY.size.editor),
  '--typo-size-ticker': () => scaleSize(TYPOGRAPHY.size.ticker),
  '--typo-size-ticker-label': () => scaleSize(TYPOGRAPHY.size.tickerLabel),
  '--typo-size-header-meta': () => scaleSize(TYPOGRAPHY.size.headerMeta),
  '--typo-size-nav': () => scaleSize(TYPOGRAPHY.size.nav),
  '--typo-size-feature-card-title': () => scaleSize(TYPOGRAPHY.size.featureCardTitle),
  '--typo-size-feature-card-desc': () => scaleSize(TYPOGRAPHY.size.featureCardDesc),
  '--typo-size-article-card-title': () => scaleSize(TYPOGRAPHY.size.articleCardTitle),
  '--typo-size-article-card-excerpt': () => scaleSize(TYPOGRAPHY.size.articleCardExcerpt),
  '--typo-size-article-card-meta': () => scaleSize(TYPOGRAPHY.size.articleCardMeta),
  '--typo-size-article-page-title': () => scaleSize(TYPOGRAPHY.size.articlePageTitle),
  '--typo-size-article-page-excerpt': () => scaleSize(TYPOGRAPHY.size.articlePageExcerpt),
  '--typo-size-sidebar-heading': () => scaleSize(TYPOGRAPHY.size.sidebarHeading),
  '--typo-size-sidebar-item': () => scaleSize(TYPOGRAPHY.size.sidebarItem),
  '--typo-size-classified-page-title': () => scaleSize(TYPOGRAPHY.size.classifiedPageTitle),
  '--typo-size-classified-page-desc': () => scaleSize(TYPOGRAPHY.size.classifiedPageDesc),
  '--typo-size-classified-card-title': () => scaleSize(TYPOGRAPHY.size.classifiedCardTitle),
  '--typo-size-classified-card-price': () => scaleSize(TYPOGRAPHY.size.classifiedCardPrice),
  '--typo-size-classified-card-meta': () => scaleSize(TYPOGRAPHY.size.classifiedCardMeta),
  '--typo-size-classified-sidebar-heading': () => scaleSize(TYPOGRAPHY.size.classifiedSidebarHeading),
  '--typo-size-classified-sidebar-item': () => scaleSize(TYPOGRAPHY.size.classifiedSidebarItem),
  '--typo-size-classified-sidebar-desc': () => scaleSize(TYPOGRAPHY.size.classifiedSidebarDesc),
  '--typo-size-classified-sidebar-action': () => scaleSize(TYPOGRAPHY.size.classifiedSidebarAction),
  '--typo-size-train-page-title': () => scaleSize(TYPOGRAPHY.size.trainPageTitle),
  '--typo-size-train-page-desc': () => scaleSize(TYPOGRAPHY.size.trainPageDesc),
  '--typo-size-train-name': () => scaleSize(TYPOGRAPHY.size.trainName),
  '--typo-size-train-name-en': () => scaleSize(TYPOGRAPHY.size.trainNameEn),
  '--typo-size-train-direction': () => scaleSize(TYPOGRAPHY.size.trainDirection),
  '--typo-size-train-badge': () => scaleSize(TYPOGRAPHY.size.trainBadge),
  '--typo-size-train-route': () => scaleSize(TYPOGRAPHY.size.trainRoute),
  '--typo-size-train-time-label': () => scaleSize(TYPOGRAPHY.size.trainTimeLabel),
  '--typo-size-train-time': () => scaleSize(TYPOGRAPHY.size.trainTime),
  '--typo-size-train-note': () => scaleSize(TYPOGRAPHY.size.trainNote),
  '--typo-size-place-page-title': () => scaleSize(TYPOGRAPHY.size.placePageTitle),
  '--typo-size-place-page-desc': () => scaleSize(TYPOGRAPHY.size.placePageDesc),
  '--typo-size-place-card-name': () => scaleSize(TYPOGRAPHY.size.placeCardName),
  '--typo-size-place-card-category': () => scaleSize(TYPOGRAPHY.size.placeCardCategory),
  '--typo-size-place-card-meta': () => scaleSize(TYPOGRAPHY.size.placeCardMeta),
  '--typo-size-place-card-cta': () => scaleSize(TYPOGRAPHY.size.placeCardCta),
  '--typo-size-place-sidebar-heading': () => scaleSize(TYPOGRAPHY.size.placeSidebarHeading),
  '--typo-size-place-sidebar-item': () => scaleSize(TYPOGRAPHY.size.placeSidebarItem),
  '--typo-size-taxi-page-title': () => scaleSize(TYPOGRAPHY.size.taxiPageTitle),
  '--typo-size-taxi-page-desc': () => scaleSize(TYPOGRAPHY.size.taxiPageDesc),
  '--typo-size-taxi-label': () => scaleSize(TYPOGRAPHY.size.taxiLabel),
  '--typo-size-taxi-input': () => scaleSize(TYPOGRAPHY.size.taxiInput),
  '--typo-size-taxi-hint': () => scaleSize(TYPOGRAPHY.size.taxiHint),
  '--typo-size-taxi-button': () => scaleSize(TYPOGRAPHY.size.taxiButton),
  '--typo-size-taxi-error': () => scaleSize(TYPOGRAPHY.size.taxiError),
  '--typo-size-taxi-section-title': () => scaleSize(TYPOGRAPHY.size.taxiSectionTitle),
  '--typo-size-taxi-code': () => scaleSize(TYPOGRAPHY.size.taxiCode),
  '--typo-size-taxi-badge': () => scaleSize(TYPOGRAPHY.size.taxiBadge),
  '--typo-size-taxi-card-title': () => scaleSize(TYPOGRAPHY.size.taxiCardTitle),
  '--typo-size-taxi-card-meta': () => scaleSize(TYPOGRAPHY.size.taxiCardMeta),
  '--typo-size-taxi-price': () => scaleSize(TYPOGRAPHY.size.taxiPrice),
  '--typo-size-banner-title': () => scaleSize(TYPOGRAPHY.size.bannerTitle),
  '--typo-size-banner-subtitle': () => scaleSize(TYPOGRAPHY.size.bannerSubtitle),
  '--typo-size-banner-highlight': () => scaleSize(TYPOGRAPHY.size.bannerHighlight),
  '--typo-size-banner-perk': () => scaleSize(TYPOGRAPHY.size.bannerPerk),
  '--typo-size-banner-cta': () => scaleSize(TYPOGRAPHY.size.bannerCta),
  '--typo-size-banner-badge': () => scaleSize(TYPOGRAPHY.size.bannerBadge),
  '--typo-size-shop-login-title': () => scaleSize(TYPOGRAPHY.size.shopLoginTitle),
  '--typo-size-shop-login-subtitle': () => scaleSize(TYPOGRAPHY.size.shopLoginSubtitle),
  '--typo-size-shop-login-label': () => scaleSize(TYPOGRAPHY.size.shopLoginLabel),
  '--typo-size-shop-login-input': () => scaleSize(TYPOGRAPHY.size.shopLoginInput),
  '--typo-size-shop-login-button': () => scaleSize(TYPOGRAPHY.size.shopLoginButton),
  '--typo-size-shop-login-error': () => scaleSize(TYPOGRAPHY.size.shopLoginError),
  '--typo-size-shop-admin-brand': () => scaleSize(TYPOGRAPHY.size.shopAdminBrand),
  '--typo-size-shop-admin-nav-item': () => scaleSize(TYPOGRAPHY.size.shopAdminNavItem),
  '--typo-size-shop-admin-nav-footer': () => scaleSize(TYPOGRAPHY.size.shopAdminNavFooter),
  '--typo-size-shop-header-name': () => scaleSize(TYPOGRAPHY.size.shopHeaderName),
  '--typo-size-shop-header-role': () => scaleSize(TYPOGRAPHY.size.shopHeaderRole),
  '--typo-size-shop-header-logout': () => scaleSize(TYPOGRAPHY.size.shopHeaderLogout),
  '--typo-size-shop-page-title': () => scaleSize(TYPOGRAPHY.size.shopPageTitle),
  '--typo-size-shop-page-subtitle': () => scaleSize(TYPOGRAPHY.size.shopPageSubtitle),
  '--typo-size-shop-section-title': () => scaleSize(TYPOGRAPHY.size.shopSectionTitle),
  '--typo-size-shop-body': () => scaleSize(TYPOGRAPHY.size.shopBody),
  '--typo-size-shop-meta': () => scaleSize(TYPOGRAPHY.size.shopMeta),
  '--typo-size-shop-label': () => scaleSize(TYPOGRAPHY.size.shopLabel),
  '--typo-size-shop-input': () => scaleSize(TYPOGRAPHY.size.shopInput),
  '--typo-size-shop-button': () => scaleSize(TYPOGRAPHY.size.shopButton),
  '--typo-size-shop-button-sm': () => scaleSize(TYPOGRAPHY.size.shopButtonSm),
  '--typo-size-shop-hint': () => scaleSize(TYPOGRAPHY.size.shopHint),
  '--typo-size-shop-alert': () => scaleSize(TYPOGRAPHY.size.shopAlert),
  '--typo-size-shop-modal-title': () => scaleSize(TYPOGRAPHY.size.shopModalTitle),
  '--typo-size-shop-tab': () => scaleSize(TYPOGRAPHY.size.shopTab),
  '--typo-size-shop-stat-value': () => scaleSize(TYPOGRAPHY.size.shopStatValue),
  '--typo-size-shop-stat-label': () => scaleSize(TYPOGRAPHY.size.shopStatLabel),
  '--typo-size-shop-order-badge': () => scaleSize(TYPOGRAPHY.size.shopOrderBadge),
  '--typo-size-shop-order-meta': () => scaleSize(TYPOGRAPHY.size.shopOrderMeta),
  '--typo-size-shop-order-body': () => scaleSize(TYPOGRAPHY.size.shopOrderBody),
  '--typo-size-shop-order-total': () => scaleSize(TYPOGRAPHY.size.shopOrderTotal),
  '--typo-size-shop-dropdown': () => scaleSize(TYPOGRAPHY.size.shopDropdown),
  '--typo-size-shop-table-header': () => scaleSize(TYPOGRAPHY.size.shopTableHeader),
  '--typo-size-shop-table-cell': () => scaleSize(TYPOGRAPHY.size.shopTableCell),
  '--typo-size-shop-pagination': () => scaleSize(TYPOGRAPHY.size.shopPagination),

  '--typo-weight-normal': () => TYPOGRAPHY.weight.normal,
  '--typo-weight-medium': () => TYPOGRAPHY.weight.medium,
  '--typo-weight-semibold': () => TYPOGRAPHY.weight.semibold,
  '--typo-weight-bold': () => TYPOGRAPHY.weight.bold,
  '--typo-weight-extrabold': () => TYPOGRAPHY.weight.extrabold,

  '--typo-lh-body': () => TYPOGRAPHY.lineHeight.body,
  '--typo-lh-tight': () => TYPOGRAPHY.lineHeight.tight,
  '--typo-lh-snug': () => TYPOGRAPHY.lineHeight.snug,
  '--typo-lh-heading': () => TYPOGRAPHY.lineHeight.heading,
  '--typo-lh-article': () => TYPOGRAPHY.lineHeight.article,
  '--typo-lh-article-heading': () => TYPOGRAPHY.lineHeight.articleHeading,
  '--typo-lh-input': () => TYPOGRAPHY.lineHeight.input,
  '--typo-lh-editor': () => TYPOGRAPHY.lineHeight.editor,
  '--typo-lh-admin': () => TYPOGRAPHY.lineHeight.admin,
};

/** Apply all typography CSS variables (call on boot + on HMR). */
export function applyTypography() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const [name, getValue] of Object.entries(CSS_VAR_MAP)) {
    // Inline on <html> always wins over stylesheet :root fallbacks
    root.style.setProperty(name, String(getValue()));
  }
}

applyTypography();

if (import.meta.hot) {
  import.meta.hot.accept((mod) => {
    // Use the freshly loaded module’s applyTypography (new TYPOGRAPHY values)
    mod?.applyTypography?.();
  });
}
