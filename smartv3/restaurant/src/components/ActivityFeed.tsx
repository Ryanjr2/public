// src/components/ActivityFeed.tsx
import React, { useState, useEffect } from 'react';
import {
  FiShoppingCart, FiUsers, FiTrendingUp, FiCalendar, FiClock,
  FiCheck, FiX, FiAlertTriangle, FiTrendingUp as FiRevenue, FiActivity,
  FiMoreHorizontal, FiRefreshCw
} from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import styles from './ActivityFeed.module.css';

interface Activity {
  id: string;
  type: 'order' | 'payment' | 'reservation' | 'customer' | 'system' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
  amount?: number;
  user?: string;
  metadata?: Record<string, any>;
}

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'orders' | 'payments' | 'alerts'>('all');

  // Generate mock real-time activities
  const generateActivity = (): Activity => {
    const types: Activity['type'][] = ['order', 'payment', 'reservation', 'customer', 'system'];
    const statuses: Activity['status'][] = ['success', 'warning', 'error', 'info'];
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const activities = {
      order: [
        { title: 'New Order Received', description: 'Order #1234 from Table 5' },
        { title: 'Order Completed', description: 'Order #1233 ready for pickup' },
        { title: 'Order Cancelled', description: 'Order #1232 cancelled by customer' }
      ],
      payment: [
        { title: 'Payment Processed', description: 'TSh 85,000 received via M-Pesa' },
        { title: 'Payment Failed', description: 'Card payment declined for Order #1235' },
        { title: 'Refund Issued', description: 'TSh 45,000 refunded to customer' }
      ],
      reservation: [
        { title: 'New Reservation', description: 'Table for 4 at 7:00 PM today' },
        { title: 'Reservation Confirmed', description: 'Booking #567 confirmed' },
        { title: 'Reservation Cancelled', description: 'Last-minute cancellation for Table 8' }
      ],
      customer: [
        { title: 'New Customer', description: 'John Doe registered as VIP member' },
        { title: 'Customer Feedback', description: '5-star review from Alice Johnson' },
        { title: 'Loyalty Points', description: 'Sarah earned 500 loyalty points' }
      ],
      system: [
        { title: 'System Update', description: 'Menu prices updated successfully' },
        { title: 'Backup Complete', description: 'Daily backup completed at 2:00 AM' },
        { title: 'Low Stock Alert', description: 'Chicken stock running low' }
      ]
    };

    const typeActivities = activities[type];
    const activity = typeActivities[Math.floor(Math.random() * typeActivities.length)];

    return {
      id: Date.now().toString() + Math.random(),
      type,
      title: activity.title,
      description: activity.description,
      timestamp: new Date(),
      status,
      amount: type === 'payment' ? Math.floor(Math.random() * 200000) + 10000 : undefined,
      user: ['John Doe', 'Sarah Kim', 'Mike Johnson', 'Alice Brown'][Math.floor(Math.random() * 4)]
    };
  };

  useEffect(() => {
    // Initial activities
    const initialActivities = Array.from({ length: 8 }, generateActivity);
    setActivities(initialActivities);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const newActivity = generateActivity();
      setActivities(prev => [newActivity, ...prev.slice(0, 19)]); // Keep last 20
    }, 5000); // New activity every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'order': return FiShoppingCart;
      case 'payment': return FiTrendingUp;
      case 'reservation': return FiCalendar;
      case 'customer': return FiUsers;
      case 'system': return FiActivity;
      default: return FiActivity;
    }
  };

  const getStatusIcon = (status: Activity['status']) => {
    switch (status) {
      case 'success': return FiCheck;
      case 'warning': return FiAlertTriangle;
      case 'error': return FiX;
      default: return FiActivity;
    }
  };

  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'order': return '#3b82f6';
      case 'payment': return '#10b981';
      case 'reservation': return '#8b5cf6';
      case 'customer': return '#f59e0b';
      case 'system': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'orders') return activity.type === 'order';
    if (filter === 'payments') return activity.type === 'payment';
    if (filter === 'alerts') return activity.status === 'warning' || activity.status === 'error';
    return true;
  });

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      const newActivities = Array.from({ length: 5 }, generateActivity);
      setActivities(prev => [...newActivities, ...prev.slice(0, 15)]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <FiActivity className={styles.headerIcon} />
          <h2 className={styles.title}>Live Activity</h2>
          <div className={styles.liveDot} />
        </div>
        <div className={styles.headerActions}>
          <div className={styles.filters}>
            <button 
              className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`${styles.filterButton} ${filter === 'orders' ? styles.active : ''}`}
              onClick={() => setFilter('orders')}
            >
              Orders
            </button>
            <button 
              className={`${styles.filterButton} ${filter === 'payments' ? styles.active : ''}`}
              onClick={() => setFilter('payments')}
            >
              Payments
            </button>
            <button 
              className={`${styles.filterButton} ${filter === 'alerts' ? styles.active : ''}`}
              onClick={() => setFilter('alerts')}
            >
              Alerts
            </button>
          </div>
          <button 
            className={`${styles.refreshButton} ${loading ? styles.loading : ''}`}
            onClick={handleRefresh}
            disabled={loading}
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>

      <div className={styles.activityList}>
        {filteredActivities.map((activity, index) => {
          const ActivityIcon = getActivityIcon(activity.type);
          const StatusIcon = getStatusIcon(activity.status);

          return (
            <div 
              key={activity.id} 
              className={`${styles.activityItem} ${index === 0 ? styles.newest : ''}`}
            >
              <div className={styles.activityTimeline}>
                <div 
                  className={styles.activityDot}
                  style={{ backgroundColor: getTypeColor(activity.type) }}
                >
                  <ActivityIcon className={styles.activityIcon} />
                </div>
                {index < filteredActivities.length - 1 && (
                  <div className={styles.timelineLine} />
                )}
              </div>

              <div className={styles.activityContent}>
                <div className={styles.activityHeader}>
                  <div className={styles.activityTitle}>
                    {activity.title}
                    <div 
                      className={styles.statusIcon}
                      style={{ color: getStatusColor(activity.status) }}
                    >
                      <StatusIcon />
                    </div>
                  </div>
                  <div className={styles.activityTime}>
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>

                <div className={styles.activityDescription}>
                  {activity.description}
                </div>

                {activity.amount && (
                  <div className={styles.activityAmount}>
                    {formatCurrency(activity.amount)}
                  </div>
                )}

                {activity.user && (
                  <div className={styles.activityUser}>
                    by {activity.user}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <button className={styles.viewAllButton}>
          <FiMoreHorizontal />
          View All Activities
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
