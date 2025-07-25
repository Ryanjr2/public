// src/routes/PrivateRoute.tsx
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  // Mock authentication - always allow access for now
  const user = { name: 'User' }; // Mock user
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
