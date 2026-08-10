import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';

// Guards the /driver panel — drivers only. Admins are let through so they can
// see what a driver sees; everyone else goes back where they belong.
export default function DriverProtectedRoute({ children }) {
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
    return <Navigate to="/driver/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== 'driver' && user.role !== 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
