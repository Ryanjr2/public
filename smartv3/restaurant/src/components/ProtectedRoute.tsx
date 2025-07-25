// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { UserRole, PERMISSIONS } from '../types/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRole?: UserRole;
  requireAll?: boolean;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  requireAll = false,
  fallbackPath = '/login'
}) => {
  const { user, isAuthenticated, hasAllPermissions, canAccess, isRole } = usePermissions();
  const location = useLocation();

  console.log('ProtectedRoute - IsAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Location:', location.pathname);

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute - Not authenticated, redirecting to:', fallbackPath);
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && !isRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permissions
  if (requiredPermissions.length > 0) {
    const hasPermission = requireAll 
      ? hasAllPermissions(requiredPermissions)
      : canAccess(requiredPermissions);
    
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Role-specific route components
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole={UserRole.ADMIN}>
    {children}
  </ProtectedRoute>
);

export const ChefRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    requiredPermissions={[PERMISSIONS.KITCHEN_DASHBOARD]}
    fallbackPath="/unauthorized"
  >
    {children}
  </ProtectedRoute>
);

export const ServerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    requiredPermissions={[PERMISSIONS.DASHBOARD_VIEW_SERVER]}
    fallbackPath="/unauthorized"
  >
    {children}
  </ProtectedRoute>
);

// Analytics route protection
export const AnalyticsRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    requiredPermissions={[PERMISSIONS.ANALYTICS_VIEW]}
    fallbackPath="/unauthorized"
  >
    {children}
  </ProtectedRoute>
);

// User management route protection
export const UserManagementRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    requiredPermissions={[PERMISSIONS.USERS_VIEW]}
    fallbackPath="/unauthorized"
  >
    {children}
  </ProtectedRoute>
);

// Financial routes protection
export const FinancialRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    requiredPermissions={[PERMISSIONS.FINANCIAL_VIEW]}
    fallbackPath="/unauthorized"
  >
    {children}
  </ProtectedRoute>
);

// Corporate accounts route protection
export const CorporateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    requiredPermissions={[PERMISSIONS.FINANCIAL_CORPORATE]}
    fallbackPath="/unauthorized"
  >
    {children}
  </ProtectedRoute>
);

// Menu management route protection
export const MenuManagementRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    requiredPermissions={[PERMISSIONS.MENU_EDIT]}
    fallbackPath="/unauthorized"
  >
    {children}
  </ProtectedRoute>
);

// Settings route protection
export const SettingsRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    requiredPermissions={[PERMISSIONS.SETTINGS_MANAGE]}
    fallbackPath="/unauthorized"
  >
    {children}
  </ProtectedRoute>
);

// Role-based dashboard redirect component
export const DashboardRedirect: React.FC = () => {
  const { user } = usePermissions();

  console.log('DashboardRedirect - Current user:', user);
  console.log('DashboardRedirect - User role:', user?.role);

  if (!user) {
    console.log('DashboardRedirect - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard based on role
  console.log('DashboardRedirect - Redirecting based on role:', user.role);
  switch (user.role) {
    case UserRole.ADMIN:
      console.log('DashboardRedirect - Redirecting to admin dashboard');
      return <Navigate to="/dashboard" replace />;
    case UserRole.CHEF:
      console.log('DashboardRedirect - Redirecting to chef dashboard');
      return <Navigate to="/kitchen-dashboard" replace />;
    case UserRole.SERVER:
      console.log('DashboardRedirect - Redirecting to server dashboard');
      return <Navigate to="/server-dashboard" replace />;
    default:
      console.log('DashboardRedirect - Unknown role, redirecting to login');
      return <Navigate to="/login" replace />;
  }
};

// Unauthorized page component
export const UnauthorizedPage: React.FC = () => {
  const { user, getUserRoleDisplay } = usePermissions();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Your current role is{' '}
          <span className="font-semibold text-blue-600">{getUserRoleDisplay()}</span>.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

// Component for conditional rendering based on permissions
export const ConditionalRender: React.FC<{
  permissions?: string[];
  role?: UserRole;
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ 
  permissions = [], 
  role, 
  requireAll = false, 
  children, 
  fallback = null 
}) => {
  const { canAccess, hasAllPermissions, isRole } = usePermissions();

  // Check role requirement
  if (role && !isRole(role)) {
    return <>{fallback}</>;
  }

  // Check permissions
  if (permissions.length > 0) {
    const hasPermission = requireAll 
      ? hasAllPermissions(permissions)
      : canAccess(permissions);
    
    if (!hasPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

// Higher-order component for permission-based rendering
export const withPermissions = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: string[] = [],
  fallbackComponent?: React.ComponentType<P>
) => {
  return (props: P) => {
    const { canAccess } = usePermissions();
    
    if (!canAccess(requiredPermissions)) {
      return fallbackComponent ? <fallbackComponent {...props} /> : null;
    }
    
    return <Component {...props} />;
  };
};

// Permission check hook for components
export const usePermissionCheck = (permissions: string[], requireAll = false) => {
  const { canAccess, hasAllPermissions } = usePermissions();
  
  return requireAll ? hasAllPermissions(permissions) : canAccess(permissions);
};

export default ProtectedRoute;
