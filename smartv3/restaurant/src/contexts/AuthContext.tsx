// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react';
import api from '../services/api';

export type UserRole = 'admin' | 'chef' | 'server';

export interface User {
  id?: number;
  name: string;
  email?: string;
  role?: UserRole;
  department?: string;
  avatarUrl?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  notifications: any[];
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  // fetch profile; if 401, clear user
  const refreshProfile = async () => {
    try {
      const res = await api.get('/accounts/profile/');
      setUser({
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        avatarUrl: res.data.avatar,
        permissions: res.data.role === 'admin' ? ['*'] : []
      });
    } catch (error) {
      // Profile fetch failed (user not logged in)
      setUser(null);
    }
  };

  // on mount, try to load existing session
  useEffect(() => {
    refreshProfile();
  }, []);

  // login via session
  const login = async (username: string, password: string) => {
    await api.post('/accounts/login/', { username, password });
    // if no exception, session cookie is set—now fetch profile
    await refreshProfile();
  };

  // logout
  const logout = async () => {
    await api.post('/accounts/logout/');
    setUser(null);
  };

  // Role-based access control functions
  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;

    // Admin has all permissions
    if (user.permissions.includes('*')) return true;

    // Check specific permission
    return user.permissions.includes(permission);
  };

  const isRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{
      user,
      notifications,
      login,
      logout,
      refreshProfile,
      hasPermission,
      isRole,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
