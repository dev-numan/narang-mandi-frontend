import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import CategoryNav from './CategoryNav.jsx';
import BreakingTicker from './BreakingTicker.jsx';
import TownMap from './TownMap.jsx';
import Footer from './Footer.jsx';
import { RegistrationRail } from './RegistrationBanners.jsx';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="public-root flex min-h-screen flex-col">
      <Header />
      <CategoryNav />
      <BreakingTicker />
      <main
        className={`mx-auto w-full flex-1 px-4 py-6 ${
          isHome ? 'max-w-[96rem]' : 'max-w-6xl'
        }`}
      >
        {isHome ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[11.5rem_minmax(0,1fr)_11.5rem] xl:gap-5">
            {/* Left gap — shop registration (RTL: visually on the right) */}
            <aside className="hidden xl:block">
              <RegistrationRail kind="shop" />
            </aside>
            <div className="min-w-0">
              <Outlet />
            </div>
            {/* Right gap — driver registration */}
            <aside className="hidden xl:block">
              <RegistrationRail kind="driver" />
            </aside>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      {isHome && <TownMap />}
      <Footer />
    </div>
  );
}
