// src/components/NotificationCenter.tsx
import React, { useState, useEffect } from 'react';
import { 
  FiBell, FiX, FiCheck, FiAlertCircle, FiInfo, 
  FiCheckCircle, FiAlertTriangle, FiClock
} from 'react-icons/fi';
import { usePermissions } from '../hooks/usePermissions';
import { UserRole } from '../types/roles';
import api from '../services/api';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'reservation' | 'payment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
  roleSpecific?: UserRole[];
}

const NotificationCenter: React.FC = () => {
  const { user, isAdmin, isChef, isServer } = usePermissions();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Set up real-time notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/');
      const userNotifications = filterNotificationsByRole(response.data || mockNotifications);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Use mock data for development
      const userNotifications = filterNotificationsByRole(mockNotifications);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
    }
  };

  const filterNotificationsByRole = (allNotifications: Notification[]): Notification[] => {
    if (!user) return [];
    
    return allNotifications.filter(notification => {
      // If no role restriction, show to everyone
      if (!notification.roleSpecific || notification.roleSpecific.length === 0) {
        return true;
      }
      
      // Check if user's role is in the allowed roles
      return notification.roleSpecific.includes(user.role);
    });
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/`, { read: true });
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read/');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}/`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <FiCheckCircle className="text-green-500" />;
      case 'warning': return <FiAlertTriangle className="text-yellow-500" />;
      case 'error': return <FiAlertCircle className="text-red-500" />;
      case 'order': return <FiClock className="text-blue-500" />;
      case 'reservation': return <FiInfo className="text-purple-500" />;
      case 'payment': return <FiCheck className="text-green-500" />;
      default: return <FiInfo className="text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
      >
        <FiBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FiBell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.read ? 'bg-blue-50' : 'bg-white'
                  } hover:bg-gray-50 cursor-pointer transition-colors`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                        
                        {notification.actionLabel && (
                          <span className="text-xs text-blue-600 font-medium">
                            {notification.actionLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/notifications';
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Mock notifications for development
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'New Order Received',
    message: 'Order #ORD-001 has been placed for Table 5',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    read: false,
    priority: 'high',
    actionUrl: '/orders',
    actionLabel: 'View Order',
    roleSpecific: [UserRole.CHEF, UserRole.SERVER]
  },
  {
    id: '2',
    type: 'reservation',
    title: 'Upcoming Reservation',
    message: 'Table for 4 at 7:00 PM - John Smith',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    read: false,
    priority: 'medium',
    actionUrl: '/reservations',
    actionLabel: 'View Reservation',
    roleSpecific: [UserRole.SERVER, UserRole.ADMIN]
  },
  {
    id: '3',
    type: 'payment',
    title: 'Payment Received',
    message: 'Payment of TZS 85,000 received for Order #ORD-002',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    read: true,
    priority: 'low',
    actionUrl: '/payments',
    actionLabel: 'View Payment'
  },
  {
    id: '4',
    type: 'warning',
    title: 'Low Stock Alert',
    message: 'Chicken breast is running low (5 portions remaining)',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    read: false,
    priority: 'high',
    actionUrl: '/inventory',
    actionLabel: 'Check Inventory',
    roleSpecific: [UserRole.CHEF, UserRole.ADMIN]
  },
  {
    id: '5',
    type: 'success',
    title: 'Daily Report Generated',
    message: 'Your daily sales report is ready for review',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: true,
    priority: 'low',
    actionUrl: '/reports',
    actionLabel: 'View Report',
    roleSpecific: [UserRole.ADMIN]
  }
];

export default NotificationCenter;
