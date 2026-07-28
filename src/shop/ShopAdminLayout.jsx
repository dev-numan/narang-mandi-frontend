import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import ImpersonationBanner from '../admin/components/ImpersonationBanner.jsx';
import { shopAdminApi } from '../api/index.js';
import { ShopLangProvider, useShopLang } from './ShopLangContext.jsx';

function ShopAdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { t, textClass } = useShopLang();

  const { data: stats } = useQuery({
    queryKey: ['shop-admin', 'stats'],
    queryFn: () => shopAdminApi.stats(),
    refetchInterval: 30_000,
  });
  const newOrders = stats?.pending || 0;

  const NAV = [
    { to: '/shop/admin', label: t('navDashboard'), icon: '▦', end: true },
    { to: '/shop/admin/products', label: t('navProducts'), icon: '📦' },
    { to: '/shop/admin/categories', label: t('navCategories'), icon: '🏷️' },
    { to: '/shop/admin/orders', label: t('navOrders'), icon: '🧾', badge: newOrders },
    { to: '/shop/admin/profile', label: t('navProfile'), icon: '🏪' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/shop/admin/login');
  };

  return (
    <div className="admin-root flex h-screen overflow-hidden bg-gray-100" dir="ltr">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-ink text-gray-300 transition-transform md:static md:h-full md:flex-shrink-0 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-5">
          <img src="/logo.png" alt="Narang Mandi" className="h-8 w-8 flex-shrink-0 rounded object-cover" />
          <span className={`${textClass} typo-shop-admin-brand min-w-0 font-bold leading-tight text-white`}>{t('brand')}</span>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto p-3 pb-16">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `${textClass} typo-shop-admin-nav-item mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${
                  isActive ? 'bg-brand text-white' : 'hover:bg-white/10'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="text-lg">{n.icon}</span>
                  <span className="min-w-0 flex-1 truncate">{n.label}</span>
                  {n.badge > 0 && (
                    <span
                      dir="ltr"
                      className={`ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none ${
                        isActive ? 'bg-white text-brand' : 'bg-brand text-white'
                      }`}
                    >
                      {n.badge > 99 ? '99+' : n.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="shrink-0 border-t border-white/10 p-3 text-gray-400">
          <Link to="/shops" target="_blank" className={`${textClass} typo-shop-admin-nav-footer hover:text-white`}>
            ↗ {t('viewPublicSite')}
          </Link>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ImpersonationBanner />
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm">
          <button className="rounded p-2 text-xl md:hidden" onClick={() => setOpen(true)} aria-label="Menu">
            ☰
          </button>
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="text-right">
              <p className="urdu-content typo-shop-header-name font-semibold text-ink">{user?.name}</p>
              <p className={`${textClass} typo-shop-header-role text-gray-400`}>{t('roleShopkeeper')}</p>
            </div>
            <button
              onClick={handleLogout}
              className={`${textClass} typo-shop-header-logout rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50`}
            >
              {t('logout')}
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function ShopAdminLayout() {
  return (
    <ShopLangProvider>
      <ShopAdminShell />
    </ShopLangProvider>
  );
}
