// src/config/roleMenus.ts
type UserRole = 'admin' | 'chef' | 'server';

export interface MenuItem {
  id: string;
  name: string;
  icon: string;
  path: string;
  permission?: string;
  badge?: string;
  description?: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

// Admin Menu - Full Access (Master Interface)
const adminMenu: MenuSection[] = [
  {
    title: 'Overview',
    items: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        icon: 'FiHome',
        path: '/dashboard',
        description: 'Main overview and analytics'
      },
      {
        id: 'analytics',
        name: 'Analytics',
        icon: 'FiBarChart',
        path: '/dashboard/analytics',
        description: 'Detailed business analytics'
      }
    ]
  },
  {
    title: 'Operations',
    items: [
      {
        id: 'orders',
        name: 'Order Management',
        icon: 'FiShoppingCart',
        path: '/dashboard/orders',
        description: 'Manage all restaurant orders'
      },
      {
        id: 'menu',
        name: 'Menu Management',
        icon: 'FiBook',
        path: '/dashboard/menu',
        permission: 'menu_manage',
        description: 'Add, edit, and organize menu items'
      },
      {
        id: 'kitchen',
        name: 'Kitchen Display',
        icon: 'FiMonitor',
        path: '/dashboard/kitchen',
        description: 'Monitor kitchen operations'
      },
      {
        id: 'reservations',
        name: 'Reservations',
        icon: 'FiCalendar',
        path: '/dashboard/reservations',
        description: 'Manage table reservations'
      },
      {
        id: 'inventory',
        name: 'Inventory Management',
        icon: 'FiPackage',
        path: '/dashboard/inventory',
        permission: 'inventory_manage',
        description: 'Manage stock levels and suppliers'
      }
    ]
  },
  {
    title: 'Management',
    items: [
      {
        id: 'staff',
        name: 'Staff Management',
        icon: 'FiUsers',
        path: '/dashboard/staff',
        permission: 'staff_manage',
        description: 'Manage restaurant staff'
      },
      {
        id: 'customers',
        name: 'Customer Management',
        icon: 'FiUser',
        path: '/dashboard/customers',
        description: 'Manage customer relationships'
      },
      {
        id: 'corporate',
        name: 'Corporate Accounts',
        icon: 'FiBriefcase',
        path: '/dashboard/corporate',
        description: 'Manage corporate billing accounts'
      }
    ]
  },
  {
    title: 'Reports & Settings',
    items: [
      {
        id: 'reports',
        name: 'Reports',
        icon: 'FiFileText',
        path: '/dashboard/reports',
        description: 'Financial and operational reports'
      },
      {
        id: 'payments',
        name: 'Payment History',
        icon: 'FiCreditCard',
        path: '/dashboard/payments',
        description: 'Transaction history and billing'
      },
      {
        id: 'notifications',
        name: 'Notifications',
        icon: 'FiBell',
        path: '/dashboard/notifications',
        description: 'System notifications and alerts'
      },
      {
        id: 'settings',
        name: 'Settings',
        icon: 'FiSettings',
        path: '/dashboard/settings',
        permission: 'system_manage',
        description: 'System configuration'
      }
    ]
  }
];

// Chef Menu - Kitchen Focused Interface
const chefMenu: MenuSection[] = [
  {
    title: 'Kitchen Operations',
    items: [
      {
        id: 'kitchen',
        name: 'Kitchen Display',
        icon: 'FiMonitor',
        path: '/dashboard/kitchen',
        description: 'Active orders and kitchen queue'
      },
      {
        id: 'orders',
        name: 'Order Queue',
        icon: 'FiList',
        path: '/dashboard/orders',
        description: 'View and update order status'
      }
    ]
  },
  {
    title: 'Menu & Inventory',
    items: [
      {
        id: 'menu',
        name: 'Menu Items',
        icon: 'FiBook',
        path: '/dashboard/menu',
        description: 'View menu items and ingredients'
      },
      {
        id: 'inventory',
        name: 'Inventory Status',
        icon: 'FiPackage',
        path: '/dashboard/inventory',
        description: 'Check ingredient availability'
      }
    ]
  },
  {
    title: 'Performance',
    items: [
      {
        id: 'analytics',
        name: 'Kitchen Analytics',
        icon: 'FiBarChart',
        path: '/dashboard/analytics',
        description: 'Kitchen performance metrics'
      },
      {
        id: 'profile',
        name: 'My Profile',
        icon: 'FiUser',
        path: '/dashboard/profile',
        description: 'Personal settings and schedule'
      }
    ]
  }
];

// Server Menu - Service Focused Interface
const serverMenu: MenuSection[] = [
  {
    title: 'Service Operations',
    items: [
      {
        id: 'orders',
        name: 'Order Management',
        icon: 'FiShoppingCart',
        path: '/dashboard/orders',
        description: 'Take and manage customer orders'
      },
      {
        id: 'tables',
        name: 'Table Management',
        icon: 'FiGrid',
        path: '/dashboard/tables',
        description: 'Manage table assignments and status'
      },
      {
        id: 'reservations',
        name: 'Reservations',
        icon: 'FiCalendar',
        path: '/dashboard/reservations',
        description: 'View and manage reservations'
      }
    ]
  },
  {
    title: 'Customer Service',
    items: [
      {
        id: 'customers',
        name: 'Customer Service',
        icon: 'FiUsers',
        path: '/dashboard/customers',
        description: 'Customer information and preferences'
      },
      {
        id: 'menu',
        name: 'Menu Reference',
        icon: 'FiBook',
        path: '/dashboard/menu',
        description: 'Menu items for customer assistance'
      }
    ]
  },
  {
    title: 'Performance',
    items: [
      {
        id: 'analytics',
        name: 'My Sales',
        icon: 'FiTrendingUp',
        path: '/dashboard/analytics',
        description: 'Personal sales performance'
      },
      {
        id: 'profile',
        name: 'My Profile',
        icon: 'FiUser',
        path: '/dashboard/profile',
        description: 'Personal settings and schedule'
      }
    ]
  }
];

// Get menu based on user role
export const getMenuByRole = (role: UserRole): MenuSection[] => {
  switch (role) {
    case 'admin':
      return adminMenu;
    case 'chef':
      return chefMenu;
    case 'server':
      return serverMenu;
    default:
      return adminMenu; // Fallback to admin menu
  }
};

// Get role display information
export const getRoleInfo = (role: UserRole) => {
  const roleInfo = {
    admin: {
      title: 'Restaurant Administrator',
      description: 'Full system access and management',
      color: '#3b82f6',
      badge: 'ADMIN'
    },
    chef: {
      title: 'Kitchen Chef',
      description: 'Kitchen operations and menu management',
      color: '#f59e0b',
      badge: 'CHEF'
    },
    server: {
      title: 'Service Staff',
      description: 'Customer service and order management',
      color: '#10b981',
      badge: 'SERVER'
    }
  };

  return roleInfo[role] || roleInfo.admin;
};
