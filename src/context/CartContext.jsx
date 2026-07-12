import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

// One cart per shop: an order belongs to exactly one shop. Adding a product
// from a different shop replaces the cart (after a confirm in the UI).
// Persisted to localStorage so the cart survives reloads.

const CartContext = createContext(null);
const CART_KEY = 'nm_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.shopId && Array.isArray(parsed.items)) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function CartProvider({ children }) {
  // cart = { shopId, shopSlug, shopName, items: [{ productId, name, price, qty, stock, image, slug }] }
  const [cart, setCart] = useState(loadCart);

  useEffect(() => {
    if (cart) localStorage.setItem(CART_KEY, JSON.stringify(cart));
    else localStorage.removeItem(CART_KEY);
  }, [cart]);

  const clear = useCallback(() => setCart(null), []);

  // Add a product. Returns false if it belongs to a different shop than the
  // current cart (caller should confirm + call replaceShop).
  const add = useCallback(
    (shop, product, qty = 1) => {
      let ok = true;
      setCart((prev) => {
        if (prev && prev.shopId !== shop._id) {
          ok = false;
          return prev; // different shop — refuse; caller handles the prompt
        }
        const base = prev || {
          shopId: shop._id,
          shopSlug: shop.slug,
          shopName: shop.name,
          items: [],
        };
        const items = [...base.items];
        const idx = items.findIndex((i) => i.productId === product._id);
        const capped = Math.max(1, Math.min(qty, product.stock || qty));
        if (idx >= 0) {
          const nextQty = Math.min(items[idx].qty + qty, product.stock || items[idx].qty + qty);
          items[idx] = { ...items[idx], qty: Math.max(1, nextQty), stock: product.stock };
        } else {
          items.push({
            productId: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            qty: capped,
            stock: product.stock,
            image: product.images?.[0] || '',
          });
        }
        return { ...base, items };
      });
      return ok;
    },
    []
  );

  // Replace the cart with a fresh one for a new shop.
  const replaceShop = useCallback((shop, product, qty = 1) => {
    const capped = Math.max(1, Math.min(qty, product.stock || qty));
    setCart({
      shopId: shop._id,
      shopSlug: shop.slug,
      shopName: shop.name,
      items: [
        {
          productId: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          qty: capped,
          stock: product.stock,
          image: product.images?.[0] || '',
        },
      ],
    });
  }, []);

  const setQty = useCallback((productId, qty) => {
    setCart((prev) => {
      if (!prev) return prev;
      const items = prev.items
        .map((i) =>
          i.productId === productId
            ? { ...i, qty: Math.max(1, Math.min(qty, i.stock || qty)) }
            : i
        )
        .filter((i) => i.qty > 0);
      if (items.length === 0) return null;
      return { ...prev, items };
    });
  }, []);

  const remove = useCallback((productId) => {
    setCart((prev) => {
      if (!prev) return prev;
      const items = prev.items.filter((i) => i.productId !== productId);
      if (items.length === 0) return null;
      return { ...prev, items };
    });
  }, []);

  const { count, total } = useMemo(() => {
    if (!cart) return { count: 0, total: 0 };
    return cart.items.reduce(
      (acc, i) => ({ count: acc.count + i.qty, total: acc.total + i.price * i.qty }),
      { count: 0, total: 0 }
    );
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, add, replaceShop, setQty, remove, clear, count, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
