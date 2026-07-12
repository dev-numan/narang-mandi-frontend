import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = [
  { to: '/shop/admin', label: 'ڈیش بورڈ', icon: '▦', end: true },
  { to: '/shop/admin/products', label: 'پروڈکٹس', icon: '📦' },
  { to: '/shop/admin/categories', label: 'زمرہ جات', icon: '🏷️' },
  { to: '/shop/admin/orders', label: 'آرڈرز', icon: '🧾' },
  { to: '/shop/admin/profile', label: 'دکان کی پروفائل', icon: '🏪' },
];

export default function ShopAdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/shop/admin/login');
  };

  return (
    <div className="admin-root flex min-h-screen bg-gray-100">
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 transform bg-ink text-gray-300 transition-transform md:static md:flex-shrink-0 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-brand font-bold text-white">
            🏪
          </span>
          <span className="urdu min-w-0 text-sm font-bold leading-tight text-white">دکاندار پینل</span>
        </div>
        <nav className="p-3">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `urdu mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive ? 'bg-brand text-white' : 'hover:bg-white/10'
                }`
              }
            >
              <span>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-white/10 p-3 text-xs text-gray-400">
          <Link to="/shops" target="_blank" className="hover:text-white">↗ عوامی سائٹ دیکھیں</Link>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
          <button className="rounded p-2 text-xl md:hidden" onClick={() => setOpen(true)} aria-label="Menu">☰</button>
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="text-right">
              <p className="urdu text-sm font-semibold text-ink">{user?.name}</p>
              <p className="urdu text-xs text-gray-400">دکاندار</p>
            </div>
            <button onClick={handleLogout} className="urdu rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
              لاگ آؤٹ
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
