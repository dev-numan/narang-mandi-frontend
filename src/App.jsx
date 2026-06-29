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
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import NotFound from './pages/NotFound.jsx';

// Admin
import ProtectedRoute from './admin/ProtectedRoute.jsx';
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
        <Route path="categories" element={<Categories />} />
        <Route path="places" element={<Places />} />
        <Route path="community" element={<Community />} />
        <Route path="trains" element={<Trains />} />
        <Route path="classifieds" element={<Classifieds />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  );
}
