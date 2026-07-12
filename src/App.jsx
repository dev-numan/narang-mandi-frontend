import { Routes, Route } from 'react-router-dom';

// Public
import PublicLayout from './components/PublicLayout.jsx';
import Home from './pages/Home.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import PlacesPage from './pages/PlacesPage.jsx';
import CommunityLayout from './components/CommunityLayout.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import ThreadPage from './pages/ThreadPage.jsx';
import TrainsPage from './pages/TrainsPage.jsx';
import ClassifiedsPage from './pages/ClassifiedsPage.jsx';
import ClassifiedPage from './pages/ClassifiedPage.jsx';
import ShopsPage from './pages/ShopsPage.jsx';
import ShopPage from './pages/ShopPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CartPage from './pages/CartPage.jsx';
import OrderLookupPage from './pages/OrderLookupPage.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import NotFound from './pages/NotFound.jsx';

// Admin
import ProtectedRoute from './admin/ProtectedRoute.jsx';
import { RequireAdmin, RequireCategoryAccess } from './admin/RoleGate.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import Login from './admin/pages/Login.jsx';
import Dashboard from './admin/pages/Dashboard.jsx';
import ArticlesList from './admin/pages/ArticlesList.jsx';
import ArticleForm from './admin/pages/ArticleForm.jsx';
import Categories from './admin/pages/Categories.jsx';
import Places from './admin/pages/Places.jsx';
import Community from './admin/pages/Community.jsx';
import Trains from './admin/pages/Trains.jsx';
import Classifieds from './admin/pages/Classifieds.jsx';
import SettingsPage from './admin/pages/Settings.jsx';
import Profile from './admin/pages/Profile.jsx';
import Users from './admin/pages/Users.jsx';
import Shops from './admin/pages/Shops.jsx';

// Shopkeeper panel
import ShopProtectedRoute from './shop/ShopProtectedRoute.jsx';
import ShopAdminLayout from './shop/ShopAdminLayout.jsx';
import ShopLogin from './shop/pages/Login.jsx';
import ShopDashboard from './shop/pages/Dashboard.jsx';
import ShopProducts from './shop/pages/Products.jsx';
import ShopCategories from './shop/pages/Categories.jsx';
import ShopOrders from './shop/pages/Orders.jsx';
import ShopProfile from './shop/pages/ShopProfile.jsx';

export default function App() {
  return (
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
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
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
        <Route path="profile" element={<ShopProfile />} />
      </Route>
    </Routes>
  );
}
