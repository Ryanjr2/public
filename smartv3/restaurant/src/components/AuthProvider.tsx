// src/components/AuthProvider.tsx
import React, { useState, useEffect, ReactNode, createContext } from 'react';
import { UserRole, ROLE_PERMISSIONS } from '../types/roles';
import api from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isRole: (role: UserRole) => boolean;
  canAccess: (requiredPermissions: string[]) => boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<{ success: boolean; error?: string }>;
  checkAuthStatus: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/accounts/profile/');
      const userData = response.data;
      
      // Map backend user data to our User interface
      const mappedUser: User = {
        id: userData.id || userData.user?.id,
        username: userData.username || userData.user?.username,
        email: userData.email || userData.user?.email,
        role: mapBackendRoleToUserRole(userData.role || userData.user_type),
        firstName: userData.first_name || userData.user?.first_name,
        lastName: userData.last_name || userData.user?.last_name,
        isActive: userData.is_active !== false
      };
      
      setUser(mappedUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const mapBackendRoleToUserRole = (backendRole: string): UserRole => {
    // Map backend role strings to our UserRole enum
    const roleMapping: Record<string, UserRole> = {
      'admin': UserRole.ADMIN,
      'administrator': UserRole.ADMIN,
      'manager': UserRole.ADMIN,
      'chef': UserRole.CHEF,
      'kitchen_manager': UserRole.CHEF,
      'cook': UserRole.CHEF,
      'server': UserRole.SERVER,
      'waiter': UserRole.SERVER,
      'waitress': UserRole.SERVER,
      'staff': UserRole.SERVER
    };
    
    return roleMapping[backendRole?.toLowerCase()] || UserRole.SERVER;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role];
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role];
    return permissions.some(permission => userPermissions.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role];
    return permissions.every(permission => userPermissions.includes(permission));
  };

  const isRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const canAccess = (requiredPermissions: string[]): boolean => {
    if (requiredPermissions.length === 0) return true;
    return hasAnyPermission(requiredPermissions);
  };

  const login = async (username: string, password: string) => {
    try {
      // Test users for demo purposes
      const testUsers = {
        'admin': { role: UserRole.ADMIN, password: 'admin123' },
        'chef': { role: UserRole.CHEF, password: 'chef123' },
        'server1': { role: UserRole.SERVER, password: 'server123' },
        'server2': { role: UserRole.SERVER, password: 'server123' }
      };

      // Check if it's a test user first
      if (testUsers[username as keyof typeof testUsers]) {
        const testUser = testUsers[username as keyof typeof testUsers];
        if (testUser.password === password) {
          // Create mock user for test login
          const mockUser: User = {
            id: `test-${username}`,
            username: username,
            email: `${username}@restaurant.com`,
            role: testUser.role,
            firstName: username.charAt(0).toUpperCase() + username.slice(1),
            lastName: 'User',
            isActive: true
          };

          console.log('AuthProvider - Setting mock user:', mockUser);
          setUser(mockUser);
          setIsAuthenticated(true);
          console.log('AuthProvider - User set, isAuthenticated:', true);
          return { success: true };
        } else {
          return { success: false, error: 'Invalid password for test user' };
        }
      }

      // Try actual API login for real users
      const response = await api.post('/accounts/login/', {
        username,
        password
      });

      if (response.data.success || response.status === 200) {
        await checkAuthStatus(); // Refresh user data
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error: any) {
      console.error('Login failed:', error);

      // If API fails, check if it's a test user as fallback
      const testUsers = {
        'admin': { role: UserRole.ADMIN, password: 'admin123' },
        'chef': { role: UserRole.CHEF, password: 'chef123' },
        'server1': { role: UserRole.SERVER, password: 'server123' },
        'server2': { role: UserRole.SERVER, password: 'server123' }
      };

      if (testUsers[username as keyof typeof testUsers]) {
        const testUser = testUsers[username as keyof typeof testUsers];
        if (testUser.password === password) {
          const mockUser: User = {
            id: `test-${username}`,
            username: username,
            email: `${username}@restaurant.com`,
            role: testUser.role,
            firstName: username.charAt(0).toUpperCase() + username.slice(1),
            lastName: 'User',
            isActive: true
          };

          setUser(mockUser);
          setIsAuthenticated(true);
          return { success: true };
        }
      }

      return {
        success: false,
        error: error.response?.data?.message || 'Invalid username or password'
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/accounts/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      await api.patch(`/accounts/users/${userId}/`, {
        role: newRole
      });
      
      // If updating current user, refresh auth status
      if (user && user.id === userId) {
        await checkAuthStatus();
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Role update failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Role update failed' 
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRole,
    canAccess,
    login,
    logout,
    updateUserRole,
    checkAuthStatus
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component for route protection
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: string[] = []
) => {
  return (props: P) => {
    const { isAuthenticated, canAccess, loading } = React.useContext(AuthContext)!;

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      window.location.href = '/login';
      return null;
    }

    if (!canAccess(requiredPermissions)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

// Component for conditional rendering based on permissions
export const PermissionGate: React.FC<{
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean;
}> = ({ permissions, children, fallback = null, requireAll = false }) => {
  const { canAccess, hasAllPermissions } = React.useContext(AuthContext)!;
  
  const hasAccess = requireAll ? hasAllPermissions(permissions) : canAccess(permissions);
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default AuthProvider;
