import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute() {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <div className="pt-32 text-center">Loading admin...</div>;
  }

  // If not authenticated or not an admin (role 3 or 4)
  if (!token || !user || (user.role !== 3 && user.role !== 4)) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
