// src/components/QuickActions.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus, FiUsers, FiShoppingCart, FiCalendar, FiSettings,
  FiFileText, FiTrendingUp, FiBell, FiClock,
  FiChevronRight, FiZap
} from 'react-icons/fi';
import styles from './QuickActions.module.css';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  color: string;
  route: string;
  badge?: string;
  urgent?: boolean;
}

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'new-order',
      title: 'New Order',
      description: 'Create a new customer order',
      icon: FiShoppingCart,
      color: '#3b82f6',
      route: '/dashboard/orders',
      badge: 'Quick'
    },
    {
      id: 'add-customer',
      title: 'Add Customer',
      description: 'Register new customer',
      icon: FiUsers,
      color: '#10b981',
      route: '/dashboard/customers'
    },
    {
      id: 'reservations',
      title: 'Reservations',
      description: 'Manage table bookings',
      icon: FiCalendar,
      color: '#8b5cf6',
      route: '/dashboard/reservations',
      badge: '3 pending',
      urgent: true
    },
    {
      id: 'kitchen',
      title: 'Kitchen Display',
      description: 'View active orders',
      icon: FiClock,
      color: '#f59e0b',
      route: '/dashboard/kitchen',
      badge: '5 active'
    },
    {
      id: 'reports',
      title: 'Generate Report',
      description: 'Create business reports',
      icon: FiFileText,
      color: '#ef4444',
      route: '/dashboard/reports'
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Business insights',
      icon: FiTrendingUp,
      color: '#06b6d4',
      route: '/dashboard/analytics'
    },
    {
      id: 'payments',
      title: 'Payment History',
      description: 'Transaction records',
      icon: FiTrendingUp,
      color: '#84cc16',
      route: '/dashboard/payments'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'System alerts',
      icon: FiBell,
      color: '#f97316',
      route: '/dashboard/notifications',
      badge: '12 new',
      urgent: true
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'System configuration',
      icon: FiSettings,
      color: '#6b7280',
      route: '/dashboard/settings'
    }
  ];

  const handleActionClick = (action: QuickAction) => {
    navigate(action.route);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <FiZap className={styles.headerIcon} />
          <h2 className={styles.title}>Quick Actions</h2>
        </div>
        <p className={styles.subtitle}>Frequently used operations</p>
      </div>

      <div className={styles.actionsGrid}>
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          const isHovered = hoveredAction === action.id;

          return (
            <div
              key={action.id}
              className={`${styles.actionCard} ${isHovered ? styles.hovered : ''} ${action.urgent ? styles.urgent : ''}`}
              onClick={() => handleActionClick(action)}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
            >
              <div className={styles.cardContent}>
                <div className={styles.iconSection}>
                  <div 
                    className={styles.iconContainer}
                    style={{ backgroundColor: action.color }}
                  >
                    <IconComponent className={styles.icon} />
                  </div>
                  {action.badge && (
                    <div 
                      className={`${styles.badge} ${action.urgent ? styles.urgentBadge : ''}`}
                    >
                      {action.badge}
                    </div>
                  )}
                </div>

                <div className={styles.textSection}>
                  <h3 className={styles.actionTitle}>{action.title}</h3>
                  <p className={styles.actionDescription}>{action.description}</p>
                </div>

                <div className={styles.arrowSection}>
                  <FiChevronRight className={styles.arrow} />
                </div>
              </div>

              <div className={styles.hoverEffect} style={{ backgroundColor: action.color }} />
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <div className={styles.shortcutHint}>
          <span className={styles.shortcutKey}>Ctrl</span>
          <span className={styles.shortcutPlus}>+</span>
          <span className={styles.shortcutKey}>K</span>
          <span className={styles.shortcutText}>for command palette</span>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
