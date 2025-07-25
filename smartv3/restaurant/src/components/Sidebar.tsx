import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome, FiUser, FiSettings, FiShoppingCart, FiCalendar,
  FiMenu, FiBarChart2, FiBell, FiUsers, FiCreditCard,
  FiClock, FiTrendingUp, FiBriefcase, FiMonitor, FiList,
  FiBook, FiPackage, FiGrid, FiFileText, FiBarChart
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getMenuByRole, getRoleInfo } from '../config/roleMenus';
import styles from './Sidebar.module.css';

type UserRole = 'admin' | 'chef' | 'server';

type User = {
  id?: number;
  name: string;
  email?: string;
  role?: UserRole;
  department?: string;
  avatarUrl?: string;
  permissions?: string[];
};

type Props = {
  isOpen: boolean;
  user?: User;
};

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, React.ComponentType> = {
  FiHome,
  FiUser,
  FiSettings,
  FiShoppingCart,
  FiCalendar,
  FiMenu,
  FiBarChart2,
  FiBell,
  FiUsers,
  FiCreditCard,
  FiClock,
  FiTrendingUp,
  FiBriefcase,
  FiMonitor,
  FiList,
  FiBook,
  FiPackage,
  FiGrid,
  FiFileText,
  FiBarChart,
};

const Sidebar: React.FC<Props> = ({ isOpen, user: propUser }) => {
  const { user: authUser } = useAuth();

  // Use prop user for demo, fallback to auth user
  const user = propUser || authUser;

  // Get menu sections based on user role
  const menuSections = user?.role ? getMenuByRole(user.role) : [];
  const roleInfo = user?.role ? getRoleInfo(user.role) : null;

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.logo}>
        <h2>Smart Restaurant</h2>
        <span className={styles.subtitle}>
          {roleInfo?.title || 'Admin Panel'}
        </span>
        {roleInfo && (
          <div className={styles.roleBadge} style={{ backgroundColor: roleInfo.color }}>
            {roleInfo.badge}
          </div>
        )}
      </div>

      <nav className={styles.nav}>
        {menuSections.map((section, index) => (
          <div key={index} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.title}</h3>
            {section.items.map((item) => {
              const IconComponent = iconMap[item.icon];
              if (!IconComponent) return null;

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ''}`
                  }
                  title={item.description}
                >
                  <IconComponent className={styles.icon} />
                  <span className={styles.label}>{item.name}</span>
                  {item.badge && (
                    <span className={styles.badge}>{item.badge}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Role info footer */}
      {roleInfo && (
        <div className={styles.roleInfo}>
          <div className={styles.roleDescription}>
            {roleInfo.description}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
