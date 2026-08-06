import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="pt-32 text-center">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
