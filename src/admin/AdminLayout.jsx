import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ImpersonationBanner from './components/ImpersonationBanner.jsx';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: '▦', end: true },
  { to: '/admin/articles', label: 'Articles', icon: '📰' },
  { to: '/admin/categories', label: 'Categories', icon: '🏷️', needsCategoryAccess: true },
  { to: '/admin/places', label: 'Places', icon: '📍', adminOnly: true },
  { to: '/admin/community', label: 'Community', icon: '💬', adminOnly: true },
  { to: '/admin/trains', label: 'Trains', icon: '🚆', adminOnly: true },
  { to: '/admin/classifieds', label: 'Classifieds', icon: '🛒', adminOnly: true },
  { to: '/admin/shops', label: 'Dukanen', icon: '🏪', adminOnly: true },
  { to: '/admin/messages', label: 'Messages', icon: '✉️', adminOnly: true },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️', adminOnly: true },
  { to: '/admin/profile', label: 'Profile', icon: '👤' },
  { to: '/admin/users', label: 'Users', icon: '👥', adminOnly: true },
];

// Decides which nav links a user may see. Admins see everything; editors see
// only articles-related items (plus Categories when granted the permission).
function canSee(item, user) {
  if (item.adminOnly) return user?.role === 'admin';
  if (item.needsCategoryAccess) return user?.role === 'admin' || !!user?.canManageCategories;
  return true;
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const links = NAV.filter((n) => canSee(n, user));

  return (
    <div className="admin-root flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 transform bg-ink text-gray-300 transition-transform md:static md:flex-shrink-0 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
          <img src="/logo.png" alt="Narang Mandi" className="h-8 w-8 flex-shrink-0 rounded object-cover" />
          <span className="min-w-0 text-sm font-bold leading-tight text-white">Narang Mandi Admin</span>
        </div>
        <nav className="p-3">
          {links.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
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
          <Link to="/" target="_blank" className="hover:text-white">
            ↗ View public site
          </Link>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <ImpersonationBanner />
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
          <button
            className="rounded p-2 text-xl md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Menu"
          >
            ☰
          </button>
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">{user?.name}</p>
              <p className="text-xs capitalize text-gray-400">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Logout
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
