import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';

// Guards the /shop/admin panel — shopkeepers only. Admins/editors are sent to
// the news admin; unauthenticated visitors to the shop login.
export default function ShopProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="admin-root flex min-h-screen items-center justify-center">
        <Loader label="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/shop/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== 'shopkeeper') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
