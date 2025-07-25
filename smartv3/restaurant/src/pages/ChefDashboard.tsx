// src/pages/ChefDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  FiClock, FiCheckCircle, FiAlertCircle, FiUsers, 
  FiTrendingUp, FiPackage, FiThermometer, FiList,
  FiPlay, FiPause, FiCheck, FiX
} from 'react-icons/fi';
import { usePermissions } from '../hooks/usePermissions';
import { formatDisplayCurrency } from '../utils/currency';
import api from '../services/api';
import styles from './Dashboard.module.css';

interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served';
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number;
  actualTime?: number;
  customerName?: string;
  tableNumber?: string;
  specialInstructions?: string;
  createdAt: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  specialRequests?: string;
  preparationTime: number;
  status: 'pending' | 'preparing' | 'ready';
}

interface KitchenMetrics {
  activeOrders: number;
  avgPreparationTime: number;
  completedToday: number;
  pendingOrders: number;
  efficiency: number;
}

const ChefDashboard: React.FC = () => {
  const { user, canAccessKitchen, canViewKitchenQueue } = usePermissions();
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<KitchenMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (canAccessKitchen()) {
      fetchKitchenData();
      // Set up real-time updates
      const interval = setInterval(fetchKitchenData, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchKitchenData = async () => {
    try {
      setLoading(true);
      
      // Fetch kitchen orders and metrics
      const [ordersResponse, metricsResponse] = await Promise.all([
        api.get('/kitchen/orders/active/'),
        api.get('/kitchen/metrics/')
      ]);

      setOrders(ordersResponse.data || mockOrders);
      setMetrics(metricsResponse.data || mockMetrics);
    } catch (error) {
      console.error('Error fetching kitchen data:', error);
      // Use mock data for development
      setOrders(mockOrders);
      setMetrics(mockMetrics);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/kitchen/orders/${orderId}/`, { status: newStatus });
      await fetchKitchenData(); // Refresh data
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const startOrderPreparation = (orderId: string) => {
    updateOrderStatus(orderId, 'preparing');
  };

  const markOrderReady = (orderId: string) => {
    updateOrderStatus(orderId, 'ready');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <FiClock className="text-yellow-500" />;
      case 'preparing': return <FiPlay className="text-blue-500" />;
      case 'ready': return <FiCheckCircle className="text-green-500" />;
      default: return <FiAlertCircle className="text-gray-500" />;
    }
  };

  if (!canAccessKitchen()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the kitchen dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <FiThermometer className={styles.titleIcon} />
              Kitchen Dashboard
            </h1>
            <p className={styles.subtitle}>
              Welcome back, Chef {user?.firstName || user?.username}!
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Kitchen Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#ef4444' }}>
              <FiClock />
            </div>
          </div>
          <div className={styles.metricContent}>
            <h3>Active Orders</h3>
            <p className={styles.metricValue}>{metrics?.activeOrders || 0}</p>
            <span className="text-sm text-gray-500">Currently preparing</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#10b981' }}>
              <FiCheckCircle />
            </div>
          </div>
          <div className={styles.metricContent}>
            <h3>Completed Today</h3>
            <p className={styles.metricValue}>{metrics?.completedToday || 0}</p>
            <span className="text-sm text-gray-500">Orders finished</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#3b82f6' }}>
              <FiTrendingUp />
            </div>
          </div>
          <div className={styles.metricContent}>
            <h3>Avg Prep Time</h3>
            <p className={styles.metricValue}>{metrics?.avgPreparationTime || 0}m</p>
            <span className="text-sm text-gray-500">Per order</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#8b5cf6' }}>
              <FiUsers />
            </div>
          </div>
          <div className={styles.metricContent}>
            <h3>Efficiency</h3>
            <p className={styles.metricValue}>{metrics?.efficiency || 0}%</p>
            <span className="text-sm text-gray-500">Kitchen performance</span>
          </div>
        </div>
      </div>

      {/* Order Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <FiList className="mr-2 text-orange-500" />
              Pending Orders
            </h2>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
              {orders.filter(o => o.status === 'pending').length} orders
            </span>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {orders.filter(o => o.status === 'pending').map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onStart={() => startOrderPreparation(order.id)}
                onSelect={() => setSelectedOrder(order)}
              />
            ))}
          </div>
        </div>

        {/* Preparing Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <FiPlay className="mr-2 text-blue-500" />
              Preparing Orders
            </h2>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {orders.filter(o => o.status === 'preparing').length} orders
            </span>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {orders.filter(o => o.status === 'preparing').map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onComplete={() => markOrderReady(order.id)}
                onSelect={() => setSelectedOrder(order)}
                showTimer
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Card Component
const OrderCard: React.FC<{
  order: Order;
  onStart?: () => void;
  onComplete?: () => void;
  onSelect?: () => void;
  showTimer?: boolean;
}> = ({ order, onStart, onComplete, onSelect, showTimer }) => {
  return (
    <div 
      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onSelect}
      style={{ borderLeft: `4px solid ${getPriorityColor(order.priority)}` }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold">Order #{order.orderNumber}</h3>
          <p className="text-sm text-gray-600">
            {order.customerName && `${order.customerName} • `}
            Table {order.tableNumber || 'N/A'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(order.status)}
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {order.priority.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="text-sm text-gray-700 mb-3">
        {order.items.slice(0, 2).map(item => (
          <div key={item.id}>
            {item.quantity}x {item.name}
          </div>
        ))}
        {order.items.length > 2 && (
          <div className="text-gray-500">+{order.items.length - 2} more items</div>
        )}
      </div>

      {order.specialInstructions && (
        <div className="text-sm text-orange-600 mb-3 italic">
          Note: {order.specialInstructions}
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Est. {order.estimatedTime}min
          {showTimer && ` • Started ${new Date(order.createdAt).toLocaleTimeString()}`}
        </span>
        
        <div className="flex space-x-2">
          {onStart && (
            <button
              onClick={(e) => { e.stopPropagation(); onStart(); }}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              Start
            </button>
          )}
          {onComplete && (
            <button
              onClick={(e) => { e.stopPropagation(); onComplete(); }}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
            >
              Ready
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Mock data for development
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    status: 'pending',
    priority: 'high',
    estimatedTime: 15,
    customerName: 'John Doe',
    tableNumber: '5',
    specialInstructions: 'No onions, extra spicy',
    createdAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Grilled Chicken', quantity: 1, preparationTime: 12, status: 'pending' },
      { id: '2', name: 'Caesar Salad', quantity: 1, preparationTime: 5, status: 'pending' }
    ]
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    status: 'preparing',
    priority: 'medium',
    estimatedTime: 20,
    customerName: 'Jane Smith',
    tableNumber: '3',
    createdAt: new Date(Date.now() - 300000).toISOString(),
    items: [
      { id: '3', name: 'Beef Steak', quantity: 2, preparationTime: 18, status: 'preparing' }
    ]
  }
];

const mockMetrics: KitchenMetrics = {
  activeOrders: 8,
  avgPreparationTime: 16,
  completedToday: 45,
  pendingOrders: 3,
  efficiency: 87
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#10b981';
    default: return '#6b7280';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return <FiClock className="text-yellow-500" />;
    case 'preparing': return <FiPlay className="text-blue-500" />;
    case 'ready': return <FiCheckCircle className="text-green-500" />;
    default: return <FiAlertCircle className="text-gray-500" />;
  }
};

export default ChefDashboard;
