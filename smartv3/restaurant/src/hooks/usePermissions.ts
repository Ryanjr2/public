// src/hooks/usePermissions.ts
import { useContext } from 'react';
import { UserRole, ROLE_PERMISSIONS, PERMISSIONS } from '../types/roles';
import { AuthContext } from '../components/AuthProvider';

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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const usePermissions = () => {
  const {
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
  } = useAuth();

  return {
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
    checkAuthStatus,
    
    // Specific permission checks
    canViewAnalytics: () => hasPermission(PERMISSIONS.ANALYTICS_VIEW),
    canManageUsers: () => hasPermission(PERMISSIONS.USERS_CREATE),
    canManageMenu: () => hasPermission(PERMISSIONS.MENU_EDIT),
    canViewAllOrders: () => hasPermission(PERMISSIONS.ORDERS_VIEW_ALL),
    canManageKitchen: () => hasPermission(PERMISSIONS.KITCHEN_DASHBOARD),
    canViewFinancials: () => hasPermission(PERMISSIONS.FINANCIAL_VIEW),
    canManageReservations: () => hasPermission(PERMISSIONS.RESERVATIONS_EDIT),
    canProcessPayments: () => hasPermission(PERMISSIONS.PAYMENTS_PROCESS),
    canManageSettings: () => hasPermission(PERMISSIONS.SETTINGS_MANAGE),
    
    // Role-specific checks
    isAdmin: () => user?.role === UserRole.ADMIN,
    isChef: () => user?.role === UserRole.CHEF,
    isServer: () => user?.role === UserRole.SERVER,
    
    // Navigation permissions
    canAccessDashboard: () => hasAnyPermission([
      PERMISSIONS.DASHBOARD_VIEW_ALL,
      PERMISSIONS.DASHBOARD_VIEW_KITCHEN,
      PERMISSIONS.DASHBOARD_VIEW_SERVER
    ]),
    
    canAccessKitchen: () => hasAnyPermission([
      PERMISSIONS.KITCHEN_DASHBOARD,
      PERMISSIONS.KITCHEN_QUEUE,
      PERMISSIONS.KITCHEN_ANALYTICS
    ]),
    
    canAccessOrders: () => hasAnyPermission([
      PERMISSIONS.ORDERS_VIEW_ALL,
      PERMISSIONS.ORDERS_VIEW_OWN,
      PERMISSIONS.ORDERS_CREATE
    ]),
    
    // Feature-specific permissions
    canCreateOrder: () => hasPermission(PERMISSIONS.ORDERS_CREATE),
    canEditOrder: () => hasPermission(PERMISSIONS.ORDERS_EDIT),
    canDeleteOrder: () => hasPermission(PERMISSIONS.ORDERS_DELETE),
    canViewKitchenQueue: () => hasPermission(PERMISSIONS.KITCHEN_QUEUE),
    canManageInventory: () => hasPermission(PERMISSIONS.KITCHEN_INVENTORY),
    canAssignTables: () => hasPermission(PERMISSIONS.TABLES_ASSIGN),
    canManageTables: () => hasPermission(PERMISSIONS.TABLES_MANAGE),
    
    // Corporate features
    canAccessCorporate: () => hasPermission(PERMISSIONS.FINANCIAL_CORPORATE),
    canViewReports: () => hasPermission(PERMISSIONS.FINANCIAL_REPORTS),
    canExportAnalytics: () => hasPermission(PERMISSIONS.ANALYTICS_EXPORT),
    
    // Get user's permissions
    getUserPermissions: () => {
      if (!user) return [];
      return ROLE_PERMISSIONS[user.role] || [];
    },
    
    // Get user's role info
    getUserRole: () => user?.role,
    getUserRoleDisplay: () => {
      if (!user) return 'Guest';
      const roleInfo = {
        [UserRole.ADMIN]: 'Administrator',
        [UserRole.CHEF]: 'Chef',
        [UserRole.SERVER]: 'Server'
      };
      return roleInfo[user.role] || 'Unknown';
    }
  };
};

// Permission checking utility functions
export const checkPermission = (userRole: UserRole, permission: string): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.includes(permission);
};

export const checkAnyPermission = (userRole: UserRole, permissions: string[]): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return permissions.some(permission => rolePermissions.includes(permission));
};

export const checkAllPermissions = (userRole: UserRole, permissions: string[]): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return permissions.every(permission => rolePermissions.includes(permission));
};

// Route protection utility
export const canAccessRoute = (userRole: UserRole, routePermissions: string[]): boolean => {
  if (routePermissions.length === 0) return true; // Public route
  return checkAnyPermission(userRole, routePermissions);
};

// Component visibility utility
export const shouldShowComponent = (userRole: UserRole, requiredPermissions: string[]): boolean => {
  if (requiredPermissions.length === 0) return true; // Always visible
  return checkAnyPermission(userRole, requiredPermissions);
};

// Menu filtering utility
export const filterMenuItems = (userRole: UserRole, menuItems: any[]): any[] => {
  return menuItems.filter(item => {
    if (!item.permissions || item.permissions.length === 0) return true;
    return checkAnyPermission(userRole, item.permissions);
  });
};

// Default user for development/testing
export const createMockUser = (role: UserRole): User => ({
  id: `mock-${role}`,
  username: role,
  email: `${role}@restaurant.com`,
  role,
  firstName: role.charAt(0).toUpperCase() + role.slice(1),
  lastName: 'User',
  isActive: true
});

// Permission constants for easy import
export const PERMISSION_GROUPS = {
  DASHBOARD: [
    PERMISSIONS.DASHBOARD_VIEW_ALL,
    PERMISSIONS.DASHBOARD_VIEW_KITCHEN,
    PERMISSIONS.DASHBOARD_VIEW_SERVER
  ],
  ANALYTICS: [
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT
  ],
  MENU: [
    PERMISSIONS.MENU_CREATE,
    PERMISSIONS.MENU_EDIT,
    PERMISSIONS.MENU_DELETE,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MENU_PRICING
  ],
  ORDERS: [
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_EDIT,
    PERMISSIONS.ORDERS_DELETE,
    PERMISSIONS.ORDERS_VIEW_ALL,
    PERMISSIONS.ORDERS_VIEW_OWN
  ],
  KITCHEN: [
    PERMISSIONS.KITCHEN_DASHBOARD,
    PERMISSIONS.KITCHEN_QUEUE,
    PERMISSIONS.KITCHEN_ANALYTICS,
    PERMISSIONS.KITCHEN_INVENTORY
  ],
  FINANCIAL: [
    PERMISSIONS.FINANCIAL_VIEW,
    PERMISSIONS.FINANCIAL_REPORTS,
    PERMISSIONS.FINANCIAL_CORPORATE
  ],
  USERS: [
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_VIEW
  ]
};
