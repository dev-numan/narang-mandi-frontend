import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Redirects editors away from admin-only pages (they'd otherwise reach them by
// typing the URL even though the nav link is hidden).
export function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/admin" replace />;
  return children;
}

// Allows admins, or editors granted the `canManageCategories` permission.
export function RequireCategoryAccess({ children }) {
  const { user } = useAuth();
  if (user?.role === 'admin' || user?.canManageCategories) return children;
  return <Navigate to="/admin" replace />;
}
