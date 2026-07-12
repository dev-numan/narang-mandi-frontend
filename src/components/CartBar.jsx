import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils/format.js';

// A sticky bottom bar summarising the current cart. Rendered on shop/product
// pages; hides itself when the cart is empty.
export default function CartBar() {
  const { cart, count, total } = useCart();
  if (!cart || count === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-4">
      <Link
        to="/cart"
        className="pointer-events-auto mx-auto flex max-w-md items-center justify-between gap-4 rounded-xl bg-brand px-5 py-3 text-white shadow-lg transition hover:bg-brand-dark"
      >
        <span className="urdu flex items-center gap-2 text-sm font-semibold">
          🛒 {count} اشیاء
        </span>
        <span className="urdu text-sm font-semibold">{formatPrice(total)}</span>
        <span className="urdu rounded-lg bg-white/20 px-3 py-1 text-sm font-bold">ٹوکری دیکھیں ←</span>
      </Link>
    </div>
  );
}
