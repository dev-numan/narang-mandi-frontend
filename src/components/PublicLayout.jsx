import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import CategoryNav from './CategoryNav.jsx';
import BreakingTicker from './BreakingTicker.jsx';
import Footer from './Footer.jsx';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <CategoryNav />
      <BreakingTicker />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
