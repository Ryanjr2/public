// src/pages/NotificationsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  FiBell, FiCheck, FiX, FiTrash2, FiRefreshCw, FiFilter,
  FiMail, FiPhone, FiShield, FiClock, FiUsers, FiTrendingUp,
  FiShoppingCart, FiCalendar, FiAlertTriangle, FiInfo,
  FiCheckCircle, FiXCircle, FiSettings, FiEye, FiEyeOff
} from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import styles from './Notifications.module.css';

interface Notification {
  id: number;
  type: 'order' | 'reservation' | 'payment' | 'staff' | 'system' | 'customer';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_required: boolean;
  related_id?: number;
  data?: any;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'order' | 'reservation' | 'payment' | 'staff' | 'system'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: 1,
      type: 'order',
      priority: 'high',
      title: 'New Order Received',
      message: 'Order #1234 has been placed by John Doe for table 5. Total: TZS 85,000',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      read: false,
      action_required: true,
      related_id: 1234,
      data: { order_id: 1234, table: 5, customer: 'John Doe', total: 85000 }
    },
    {
      id: 2,
      type: 'reservation',
      priority: 'medium',
      title: 'Reservation Confirmation',
      message: 'Table reservation for 4 people at 7:00 PM today has been confirmed.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      read: false,
      action_required: false,
      related_id: 567,
      data: { reservation_id: 567, party_size: 4, time: '19:00' }
    },
    {
      id: 3,
      type: 'payment',
      priority: 'urgent',
      title: 'Payment Failed',
      message: 'Payment for order #1230 failed. Customer needs assistance with payment.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false,
      action_required: true,
      related_id: 1230,
      data: { order_id: 1230, amount: 125000, payment_method: 'card' }
    },
    {
      id: 4,
      type: 'staff',
      priority: 'medium',
      title: 'Staff Check-in',
      message: 'Sarah Kimani has checked in for her shift.',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      read: true,
      action_required: false,
      related_id: 2,
      data: { staff_id: 2, staff_name: 'Sarah Kimani', shift_start: '10:00' }
    },
    {
      id: 5,
      type: 'system',
      priority: 'low',
      title: 'Daily Backup Complete',
      message: 'Daily database backup has been completed successfully.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: true,
      action_required: false,
      data: { backup_size: '2.5GB', backup_time: '02:00' }
    },
    {
      id: 6,
      type: 'customer',
      priority: 'medium',
      title: 'Customer Feedback',
      message: 'New 5-star review received from Alice Johnson.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: true,
      action_required: false,
      related_id: 123,
      data: { customer_id: 123, rating: 5, review: 'Excellent service!' }
    },
    {
      id: 7,
      type: 'order',
      priority: 'high',
      title: 'Kitchen Alert',
      message: 'Order #1235 is taking longer than expected. Estimated delay: 15 minutes.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: false,
      action_required: true,
      related_id: 1235,
      data: { order_id: 1235, delay_minutes: 15, table: 8 }
    },
    {
      id: 8,
      type: 'reservation',
      priority: 'urgent',
      title: 'Reservation Cancellation',
      message: 'Last-minute cancellation for table of 6 at 8:00 PM tonight.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      read: false,
      action_required: true,
      related_id: 789,
      data: { reservation_id: 789, party_size: 6, time: '20:00', cancelled_at: new Date().toISOString() }
    }
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleDeleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleBulkDelete = () => {
    if (selectedNotifications.length === 0) return;
    
    if (confirm(`Delete ${selectedNotifications.length} selected notifications?`)) {
      setNotifications(prev => 
        prev.filter(notif => !selectedNotifications.includes(notif.id))
      );
      setSelectedNotifications([]);
    }
  };

  const handleSelectNotification = (id: number) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const filteredIds = filteredNotifications.map(n => n.id);
    setSelectedNotifications(
      selectedNotifications.length === filteredIds.length ? [] : filteredIds
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return FiShoppingCart;
      case 'reservation': return FiCalendar;
      case 'payment': return FiTrendingUp;
      case 'staff': return FiUsers;
      case 'system': return FiSettings;
      case 'customer': return FiUsers;
      default: return FiBell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order': return '#3b82f6';
      case 'reservation': return '#8b5cf6';
      case 'payment': return '#10b981';
      case 'staff': return '#f59e0b';
      case 'system': return '#6b7280';
      case 'customer': return '#ec4899';
      default: return '#6b7280';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.subtitle}>
            Stay updated with restaurant activities and alerts
          </p>
          <div className={styles.stats}>
            <span className={styles.stat}>
              <FiBell /> {unreadCount} unread
            </span>
            {urgentCount > 0 && (
              <span className={styles.urgentStat}>
                <FiAlertTriangle /> {urgentCount} urgent
              </span>
            )}
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.actionButton}
            onClick={() => window.location.reload()}
          >
            <FiRefreshCw /> Refresh
          </button>
          <button 
            className={styles.actionButton}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <FiCheck /> Mark All Read
          </button>
          {selectedNotifications.length > 0 && (
            <button 
              className={styles.deleteButton}
              onClick={handleBulkDelete}
            >
              <FiTrash2 /> Delete ({selectedNotifications.length})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <button 
          className={`${styles.filterButton} ${filter === 'all' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'unread' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'order' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('order')}
        >
          <FiShoppingCart /> Orders
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'reservation' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('reservation')}
        >
          <FiCalendar /> Reservations
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'payment' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('payment')}
        >
          <FiTrendingUp /> Payments
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'staff' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('staff')}
        >
          <FiUsers /> Staff
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'system' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('system')}
        >
          <FiSettings /> System
        </button>
      </div>

      {/* Bulk Actions */}
      {filteredNotifications.length > 0 && (
        <div className={styles.bulkActions}>
          <label className={styles.selectAllLabel}>
            <input
              type="checkbox"
              checked={selectedNotifications.length === filteredNotifications.length}
              onChange={handleSelectAll}
              className={styles.checkbox}
            />
            <span>Select All</span>
          </label>
        </div>
      )}

      {/* Notifications List */}
      <div className={styles.notificationsList}>
        {filteredNotifications.map((notification) => {
          const IconComponent = getNotificationIcon(notification.type);
          
          return (
            <div 
              key={notification.id} 
              className={`${styles.notificationCard} ${!notification.read ? styles.unread : ''}`}
            >
              <div className={styles.notificationHeader}>
                <label className={styles.selectLabel}>
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                    className={styles.checkbox}
                  />
                </label>
                
                <div 
                  className={styles.notificationIcon}
                  style={{ backgroundColor: getTypeColor(notification.type) }}
                >
                  <IconComponent />
                </div>
                
                <div className={styles.notificationContent}>
                  <div className={styles.notificationMeta}>
                    <h3 className={styles.notificationTitle}>{notification.title}</h3>
                    <div className={styles.badges}>
                      <span 
                        className={styles.priorityBadge}
                        style={{ backgroundColor: getPriorityColor(notification.priority) }}
                      >
                        {notification.priority}
                      </span>
                      <span 
                        className={styles.typeBadge}
                        style={{ backgroundColor: getTypeColor(notification.type) }}
                      >
                        {notification.type}
                      </span>
                    </div>
                  </div>
                  
                  <p className={styles.notificationMessage}>{notification.message}</p>
                  
                  <div className={styles.notificationFooter}>
                    <span className={styles.timestamp}>
                      <FiClock /> {new Date(notification.timestamp).toLocaleString()}
                    </span>
                    {notification.action_required && (
                      <span className={styles.actionRequired}>
                        <FiAlertTriangle /> Action Required
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={styles.notificationActions}>
                  {!notification.read && (
                    <button
                      className={styles.markReadButton}
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <FiEye />
                    </button>
                  )}
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteNotification(notification.id)}
                    title="Delete notification"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <div className={styles.emptyState}>
          <FiBell size={64} />
          <h3>No notifications found</h3>
          <p>
            {filter === 'all' 
              ? 'You have no notifications at the moment.' 
              : `No ${filter} notifications found.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
