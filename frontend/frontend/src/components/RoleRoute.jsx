// src/components/RoleRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ allowedRoles }) {
  const { role } = useAuth();
  if (!allowedRoles.includes(role)) {
    const fallback = role === 'ADMIN' ? '/admin' : '/employee';
    return <Navigate to={fallback} replace />;
  }
  return <Outlet />;
}