// src/components/FloatingActionButton.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus, FiShoppingCart, FiUsers, FiCalendar, FiX,
  FiClock, FiTrendingUp, FiSettings
} from 'react-icons/fi';
import styles from './FloatingActionButton.module.css';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType;
  color: string;
  route: string;
}

const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      id: 'new-order',
      label: 'New Order',
      icon: FiShoppingCart,
      color: '#3b82f6',
      route: '/dashboard/orders'
    },
    {
      id: 'add-customer',
      label: 'Add Customer',
      icon: FiUsers,
      color: '#10b981',
      route: '/dashboard/customers'
    },
    {
      id: 'reservation',
      label: 'New Reservation',
      icon: FiCalendar,
      color: '#8b5cf6',
      route: '/dashboard/reservations'
    },
    {
      id: 'kitchen',
      label: 'Kitchen View',
      icon: FiClock,
      color: '#f59e0b',
      route: '/dashboard/kitchen'
    },
    {
      id: 'payment',
      label: 'Process Payment',
      icon: FiTrendingUp,
      color: '#ef4444',
      route: '/dashboard/payments'
    },
    {
      id: 'settings',
      label: 'Quick Settings',
      icon: FiSettings,
      color: '#6b7280',
      route: '/dashboard/settings'
    }
  ];

  const handleActionClick = (action: QuickAction) => {
    navigate(action.route);
    setIsOpen(false);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.container}>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className={styles.backdrop}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action Buttons */}
      <div className={`${styles.actionsContainer} ${isOpen ? styles.open : ''}`}>
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <div
              key={action.id}
              className={styles.actionButton}
              style={{
                backgroundColor: action.color,
                transitionDelay: isOpen ? `${index * 50}ms` : `${(quickActions.length - index) * 30}ms`
              }}
              onClick={() => handleActionClick(action)}
              title={action.label}
            >
              <IconComponent className={styles.actionIcon} />
              <span className={styles.actionLabel}>{action.label}</span>
            </div>
          );
        })}
      </div>

      {/* Main FAB */}
      <button
        className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`}
        onClick={toggleOpen}
        aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
      >
        <div className={styles.fabIcon}>
          {isOpen ? <FiX /> : <FiPlus />}
        </div>
      </button>
    </div>
  );
};

export default FloatingActionButton;
