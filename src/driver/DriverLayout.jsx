import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { driverApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = [
  { to: '/driver', label: 'سواریاں', icon: '🚕', end: true, badge: 'openRides' },
  { to: '/driver/mine', label: 'میری سواریاں', icon: '📋' },
  { to: '/driver/profile', label: 'پروفائل', icon: '👤' },
];

/**
 * The driver's shell.
 *
 * Deliberately plainer than the shop panel: a driver is on a phone, often
 * one-handed, and the board is the only screen that matters — so navigation is
 * a bottom bar rather than a drawer.
 */
export default function DriverLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Polled so the tab shows waiting work without the driver opening it.
  const { data: stats } = useQuery({
    queryKey: ['driver', 'stats'],
    queryFn: driverApi.stats,
    refetchInterval: 30000,
  });

  return (
    <div className="admin-root flex min-h-screen flex-col bg-gray-50" dir="ltr">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div>
          <p className="font-bold text-ink">Narang Mandi Taxi</p>
          <p className="text-xs text-gray-500">{user?.name}</p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/driver/login', { replace: true });
          }}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-3 border-t border-gray-200 bg-white">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-xs ${
                isActive ? 'text-brand' : 'text-gray-500'
              }`
            }
          >
            <span className="relative text-lg">
              {n.icon}
              {n.badge && stats?.[n.badge] > 0 && (
                <span className="absolute -right-2 -top-1 rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                  {stats[n.badge]}
                </span>
              )}
            </span>
            <span className="urdu">{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
