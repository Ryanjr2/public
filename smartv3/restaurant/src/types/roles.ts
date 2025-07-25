// src/types/roles.ts
export enum UserRole {
  ADMIN = 'admin',
  CHEF = 'chef',
  SERVER = 'server'
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  displayName: string;
  description: string;
}

// Define all available permissions
export const PERMISSIONS = {
  // Dashboard & Analytics
  DASHBOARD_VIEW_ALL: 'dashboard:view_all',
  DASHBOARD_VIEW_KITCHEN: 'dashboard:view_kitchen',
  DASHBOARD_VIEW_SERVER: 'dashboard:view_server',
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  
  // User Management
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  USERS_VIEW: 'users:view',
  
  // Menu Management
  MENU_CREATE: 'menu:create',
  MENU_EDIT: 'menu:edit',
  MENU_DELETE: 'menu:delete',
  MENU_VIEW: 'menu:view',
  MENU_PRICING: 'menu:pricing',
  
  // Order Management
  ORDERS_CREATE: 'orders:create',
  ORDERS_EDIT: 'orders:edit',
  ORDERS_DELETE: 'orders:delete',
  ORDERS_VIEW_ALL: 'orders:view_all',
  ORDERS_VIEW_OWN: 'orders:view_own',
  ORDERS_KITCHEN_MANAGE: 'orders:kitchen_manage',
  
  // Kitchen Operations
  KITCHEN_DASHBOARD: 'kitchen:dashboard',
  KITCHEN_QUEUE: 'kitchen:queue',
  KITCHEN_ANALYTICS: 'kitchen:analytics',
  KITCHEN_INVENTORY: 'kitchen:inventory',
  
  // Financial
  FINANCIAL_VIEW: 'financial:view',
  FINANCIAL_REPORTS: 'financial:reports',
  FINANCIAL_CORPORATE: 'financial:corporate',
  
  // Reservations
  RESERVATIONS_CREATE: 'reservations:create',
  RESERVATIONS_EDIT: 'reservations:edit',
  RESERVATIONS_VIEW_ALL: 'reservations:view_all',
  RESERVATIONS_VIEW_TODAY: 'reservations:view_today',
  
  // Tables & Service
  TABLES_MANAGE: 'tables:manage',
  TABLES_ASSIGN: 'tables:assign',
  SERVICE_CUSTOMER: 'service:customer',
  
  // Payments
  PAYMENTS_PROCESS: 'payments:process',
  PAYMENTS_REFUND: 'payments:refund',
  
  // System Settings
  SETTINGS_MANAGE: 'settings:manage',
  SETTINGS_VIEW: 'settings:view'
} as const;

// Role-based permission definitions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    // Full access to everything
    PERMISSIONS.DASHBOARD_VIEW_ALL,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.MENU_CREATE,
    PERMISSIONS.MENU_EDIT,
    PERMISSIONS.MENU_DELETE,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MENU_PRICING,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_EDIT,
    PERMISSIONS.ORDERS_DELETE,
    PERMISSIONS.ORDERS_VIEW_ALL,
    PERMISSIONS.KITCHEN_DASHBOARD,
    PERMISSIONS.KITCHEN_QUEUE,
    PERMISSIONS.KITCHEN_ANALYTICS,
    PERMISSIONS.KITCHEN_INVENTORY,
    PERMISSIONS.FINANCIAL_VIEW,
    PERMISSIONS.FINANCIAL_REPORTS,
    PERMISSIONS.FINANCIAL_CORPORATE,
    PERMISSIONS.RESERVATIONS_CREATE,
    PERMISSIONS.RESERVATIONS_EDIT,
    PERMISSIONS.RESERVATIONS_VIEW_ALL,
    PERMISSIONS.TABLES_MANAGE,
    PERMISSIONS.TABLES_ASSIGN,
    PERMISSIONS.SERVICE_CUSTOMER,
    PERMISSIONS.PAYMENTS_PROCESS,
    PERMISSIONS.PAYMENTS_REFUND,
    PERMISSIONS.SETTINGS_MANAGE,
    PERMISSIONS.SETTINGS_VIEW
  ],
  
  [UserRole.CHEF]: [
    // Kitchen-focused permissions
    PERMISSIONS.DASHBOARD_VIEW_KITCHEN,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.ORDERS_VIEW_ALL,
    PERMISSIONS.ORDERS_KITCHEN_MANAGE,
    PERMISSIONS.KITCHEN_DASHBOARD,
    PERMISSIONS.KITCHEN_QUEUE,
    PERMISSIONS.KITCHEN_ANALYTICS,
    PERMISSIONS.KITCHEN_INVENTORY,
    PERMISSIONS.SETTINGS_VIEW
  ],
  
  [UserRole.SERVER]: [
    // Customer service permissions
    PERMISSIONS.DASHBOARD_VIEW_SERVER,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_EDIT,
    PERMISSIONS.ORDERS_VIEW_OWN,
    PERMISSIONS.RESERVATIONS_VIEW_TODAY,
    PERMISSIONS.TABLES_ASSIGN,
    PERMISSIONS.SERVICE_CUSTOMER,
    PERMISSIONS.PAYMENTS_PROCESS,
    PERMISSIONS.SETTINGS_VIEW
  ]
};

// Role display information
export const ROLE_INFO: Record<UserRole, { displayName: string; description: string; color: string }> = {
  [UserRole.ADMIN]: {
    displayName: 'Administrator',
    description: 'Full system access - Restaurant Owner/Manager',
    color: '#dc2626'
  },
  [UserRole.CHEF]: {
    displayName: 'Chef/Kitchen Manager',
    description: 'Kitchen operations and food preparation management',
    color: '#ea580c'
  },
  [UserRole.SERVER]: {
    displayName: 'Server/Waiter',
    description: 'Customer service and order management',
    color: '#2563eb'
  }
};

// Navigation items based on roles
export const ROLE_NAVIGATION: Record<UserRole, Array<{
  path: string;
  label: string;
  icon: string;
  permissions: string[];
}>> = {
  [UserRole.ADMIN]: [
    { path: '/dashboard', label: 'Dashboard', icon: 'FiHome', permissions: [PERMISSIONS.DASHBOARD_VIEW_ALL] },
    { path: '/analytics', label: 'Analytics', icon: 'FiBarChart2', permissions: [PERMISSIONS.ANALYTICS_VIEW] },
    { path: '/menu', label: 'Menu Management', icon: 'FiBook', permissions: [PERMISSIONS.MENU_VIEW] },
    { path: '/orders', label: 'Orders', icon: 'FiShoppingCart', permissions: [PERMISSIONS.ORDERS_VIEW_ALL] },
    { path: '/kitchen', label: 'Kitchen', icon: 'FiClock', permissions: [PERMISSIONS.KITCHEN_DASHBOARD] },
    { path: '/reservations', label: 'Reservations', icon: 'FiCalendar', permissions: [PERMISSIONS.RESERVATIONS_VIEW_ALL] },
    { path: '/corporate', label: 'Corporate Accounts', icon: 'FiBriefcase', permissions: [PERMISSIONS.FINANCIAL_CORPORATE] },
    { path: '/reports', label: 'Reports', icon: 'FiFileText', permissions: [PERMISSIONS.FINANCIAL_REPORTS] },
    { path: '/users', label: 'User Management', icon: 'FiUsers', permissions: [PERMISSIONS.USERS_VIEW] },
    { path: '/settings', label: 'Settings', icon: 'FiSettings', permissions: [PERMISSIONS.SETTINGS_MANAGE] }
  ],
  
  [UserRole.CHEF]: [
    { path: '/kitchen-dashboard', label: 'Kitchen Dashboard', icon: 'FiHome', permissions: [PERMISSIONS.DASHBOARD_VIEW_KITCHEN] },
    { path: '/kitchen-queue', label: 'Order Queue', icon: 'FiList', permissions: [PERMISSIONS.KITCHEN_QUEUE] },
    { path: '/menu', label: 'Menu Items', icon: 'FiBook', permissions: [PERMISSIONS.MENU_VIEW] },
    { path: '/kitchen-analytics', label: 'Kitchen Analytics', icon: 'FiBarChart2', permissions: [PERMISSIONS.KITCHEN_ANALYTICS] },
    { path: '/inventory', label: 'Inventory', icon: 'FiPackage', permissions: [PERMISSIONS.KITCHEN_INVENTORY] },
    { path: '/profile', label: 'Profile', icon: 'FiUser', permissions: [PERMISSIONS.SETTINGS_VIEW] }
  ],
  
  [UserRole.SERVER]: [
    { path: '/server-dashboard', label: 'Service Dashboard', icon: 'FiHome', permissions: [PERMISSIONS.DASHBOARD_VIEW_SERVER] },
    { path: '/orders', label: 'Take Orders', icon: 'FiShoppingCart', permissions: [PERMISSIONS.ORDERS_CREATE] },
    { path: '/tables', label: 'Table Management', icon: 'FiGrid', permissions: [PERMISSIONS.TABLES_ASSIGN] },
    { path: '/reservations-today', label: 'Today\'s Reservations', icon: 'FiCalendar', permissions: [PERMISSIONS.RESERVATIONS_VIEW_TODAY] },
    { path: '/payments', label: 'Payments', icon: 'FiCreditCard', permissions: [PERMISSIONS.PAYMENTS_PROCESS] },
    { path: '/profile', label: 'Profile', icon: 'FiUser', permissions: [PERMISSIONS.SETTINGS_VIEW] }
  ]
};

export type PermissionKey = keyof typeof PERMISSIONS;
