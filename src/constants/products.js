/** Product name limits (chars). Keep in sync with server productSchema. */
export const PRODUCT_NAME_MAX = 50;
/** Truncate length for lists/cards (admin + public shop). */
export const PRODUCT_NAME_DISPLAY_MAX = 36;

/**
 * Ceiling for a single cart line. Inventory is not tracked, so nothing else
 * bounds the quantity stepper — this exists only so a held-down `+` cannot
 * produce a 400-bag order. Mirrors OrderRules.MAX_ORDER_QUANTITY in the app.
 */
export const MAX_ORDER_QUANTITY = 99;

/** Category name max (chars). Keep in sync with server shopCategorySchema. */
export const CATEGORY_NAME_MAX = 50;
/** Truncate length for category names in tables. */
export const CATEGORY_NAME_DISPLAY_MAX = 28;
