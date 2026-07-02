import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Placeholder for authentication context check
  const isAuthenticated = true; // Replace with actual check later

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
