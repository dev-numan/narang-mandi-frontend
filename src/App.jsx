import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loader from './components/Loader.jsx';
import GoogleAnalytics from './components/GoogleAnalytics.jsx';

// Layout + guard shells stay eager (small, wrap <Outlet/>).
import PublicLayout from './components/PublicLayout.jsx';
import CommunityLayout from './components/CommunityLayout.jsx';
import ProtectedRoute from './admin/ProtectedRoute.jsx';
import { RequireAdmin, RequireCategoryAccess } from './admin/RoleGate.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import ShopProtectedRoute from './shop/ShopProtectedRoute.jsx';
import DriverProtectedRoute from './driver/DriverProtectedRoute.jsx';
import ShopAdminLayout from './shop/ShopAdminLayout.jsx';
import DriverLayout from './driver/DriverLayout.jsx';

// Public pages (code-split — each becomes its own chunk, kept out of the
// initial bundle so first paint on mobile stays fast).
const Home = lazy(() => import('./pages/Home.jsx'));
const CategoryPage = lazy(() => import('./pages/CategoryPage.jsx'));
const ArticlePage = lazy(() => import('./pages/ArticlePage.jsx'));
const SearchPage = lazy(() => import('./pages/SearchPage.jsx'));
const PlacesPage = lazy(() => import('./pages/PlacesPage.jsx'));
const CommunityPage = lazy(() => import('./pages/CommunityPage.jsx'));
const ThreadPage = lazy(() => import('./pages/ThreadPage.jsx'));
const TrainsPage = lazy(() => import('./pages/TrainsPage.jsx'));
const ClassifiedsPage = lazy(() => import('./pages/ClassifiedsPage.jsx'));
const ClassifiedPage = lazy(() => import('./pages/ClassifiedPage.jsx'));
const ShopsPage = lazy(() => import('./pages/ShopsPage.jsx'));
const ShopPage = lazy(() => import('./pages/ShopPage.jsx'));
const ProductPage = lazy(() => import('./pages/ProductPage.jsx'));
const CartPage = lazy(() => import('./pages/CartPage.jsx'));
const OrderLookupPage = lazy(() => import('./pages/OrderLookupPage.jsx'));
const TaxiPage = lazy(() => import('./pages/TaxiPage.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const Terms = lazy(() => import('./pages/Terms.jsx'));
const RegistrationPage = lazy(() => import('./pages/RegistrationPage.jsx'));
const DriverGuidePage = lazy(() => import('./pages/DriverGuidePage.jsx'));
const ShopGuidePage = lazy(() => import('./pages/ShopGuidePage.jsx'));
const BazaarGuidePage = lazy(() => import('./pages/BazaarGuidePage.jsx'));
const OlxGuidePage = lazy(() => import('./pages/OlxGuidePage.jsx'));
const TaxiGuidePage = lazy(() => import('./pages/TaxiGuidePage.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// Admin panel (heavy — rich-text editor etc. — split out of the public bundle).
const Login = lazy(() => import('./admin/pages/Login.jsx'));
const Dashboard = lazy(() => import('./admin/pages/Dashboard.jsx'));
const ArticlesList = lazy(() => import('./admin/pages/ArticlesList.jsx'));
const ArticleForm = lazy(() => import('./admin/pages/ArticleForm.jsx'));
const Categories = lazy(() => import('./admin/pages/Categories.jsx'));
const Places = lazy(() => import('./admin/pages/Places.jsx'));
const Community = lazy(() => import('./admin/pages/Community.jsx'));
const Trains = lazy(() => import('./admin/pages/Trains.jsx'));
const Classifieds = lazy(() => import('./admin/pages/Classifieds.jsx'));
const SettingsPage = lazy(() => import('./admin/pages/Settings.jsx'));
const Profile = lazy(() => import('./admin/pages/Profile.jsx'));
const Users = lazy(() => import('./admin/pages/Users.jsx'));
const Messages = lazy(() => import('./admin/pages/Messages.jsx'));
const Registrations = lazy(() => import('./admin/pages/Registrations.jsx'));
const Shops = lazy(() => import('./admin/pages/Shops.jsx'));

// Shopkeeper panel.
const ShopLogin = lazy(() => import('./shop/pages/Login.jsx'));
const ShopDashboard = lazy(() => import('./shop/pages/Dashboard.jsx'));
const ShopProducts = lazy(() => import('./shop/pages/Products.jsx'));
const ShopCategories = lazy(() => import('./shop/pages/Categories.jsx'));
const ShopOrders = lazy(() => import('./shop/pages/Orders.jsx'));
const ShopOrderDetail = lazy(() => import('./shop/pages/OrderDetail.jsx'));
const ShopProfile = lazy(() => import('./shop/pages/ShopProfile.jsx'));

// Driver panel
const DriverLogin = lazy(() => import('./driver/pages/Login.jsx'));
const DriverOpenRides = lazy(() => import('./driver/pages/OpenRides.jsx'));
const DriverMyRides = lazy(() => import('./driver/pages/MyRides.jsx'));
const DriverProfile = lazy(() => import('./driver/pages/Profile.jsx'));

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <GoogleAnalytics />
      <Routes>
        {/* Public site (RTL) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/article/:slug" element={<ArticlePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/places" element={<PlacesPage />} />
          <Route path="/community" element={<CommunityLayout />}>
            <Route index element={<CommunityPage />} />
            <Route path=":slug" element={<ThreadPage />} />
          </Route>
          <Route path="/trains" element={<TrainsPage />} />
          <Route path="/classifieds" element={<ClassifiedsPage />} />
          <Route path="/classifieds/:slug" element={<ClassifiedPage />} />
          <Route path="/shops" element={<ShopsPage />} />
          <Route path="/shops/:shopSlug" element={<ShopPage />} />
          <Route path="/shops/:shopSlug/product/:productSlug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders/track" element={<OrderLookupPage />} />
          <Route path="/taxi" element={<TaxiPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/register/:type" element={<RegistrationPage />} />
          {/* Public on purpose: people are sent to these before they sign in,
              and ordering/booking needs no account at all. */}
          <Route path="/driver/guide" element={<DriverGuidePage />} />
          <Route path="/shop/guide" element={<ShopGuidePage />} />
          <Route path="/bazaar/guide" element={<BazaarGuidePage />} />
          <Route path="/olx/guide" element={<OlxGuidePage />} />
          <Route path="/taxi/guide" element={<TaxiGuidePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin (LTR) */}
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="articles" element={<ArticlesList />} />
          <Route path="articles/new" element={<ArticleForm />} />
          <Route path="articles/:id/edit" element={<ArticleForm />} />
          <Route
            path="categories"
            element={
              <RequireCategoryAccess>
                <Categories />
              </RequireCategoryAccess>
            }
          />
          <Route path="places" element={<RequireAdmin><Places /></RequireAdmin>} />
          <Route path="community" element={<RequireAdmin><Community /></RequireAdmin>} />
          <Route path="trains" element={<RequireAdmin><Trains /></RequireAdmin>} />
          <Route path="classifieds" element={<RequireAdmin><Classifieds /></RequireAdmin>} />
          <Route path="shops" element={<RequireAdmin><Shops /></RequireAdmin>} />
          <Route path="messages" element={<RequireAdmin><Messages /></RequireAdmin>} />
          <Route path="registrations" element={<Registrations />} />
          <Route path="settings" element={<RequireAdmin><SettingsPage /></RequireAdmin>} />
          <Route path="profile" element={<Profile />} />
          <Route path="users" element={<RequireAdmin><Users /></RequireAdmin>} />
        </Route>

        {/* Shopkeeper panel (LTR shell, RTL content) */}
        <Route path="/shop/admin/login" element={<ShopLogin />} />
        <Route
          path="/shop/admin"
          element={
            <ShopProtectedRoute>
              <ShopAdminLayout />
            </ShopProtectedRoute>
          }
        >
          <Route index element={<ShopDashboard />} />
          <Route path="products" element={<ShopProducts />} />
          <Route path="categories" element={<ShopCategories />} />
          <Route path="orders" element={<ShopOrders />} />
          <Route path="orders/:id" element={<ShopOrderDetail />} />
          <Route path="profile" element={<ShopProfile />} />
        </Route>

        {/* Driver panel (LTR shell, RTL content) */}
        <Route path="/driver/login" element={<DriverLogin />} />
        <Route
          path="/driver"
          element={
            <DriverProtectedRoute>
              <DriverLayout />
            </DriverProtectedRoute>
          }
        >
          <Route index element={<DriverOpenRides />} />
          <Route path="mine" element={<DriverMyRides />} />
          <Route path="profile" element={<DriverProfile />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
