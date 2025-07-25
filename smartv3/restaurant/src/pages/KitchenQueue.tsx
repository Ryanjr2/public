// src/pages/KitchenQueue.tsx
import React, { useState, useEffect } from 'react';
import { 
  FiClock, FiPlay, FiPause, FiCheck, FiX, FiAlertCircle,
  FiChevronUp, FiChevronDown, FiFilter, FiRefreshCw,
  FiThermometer, FiUsers, FiMessageSquare, FiStar
} from 'react-icons/fi';
import { usePermissions } from '../hooks/usePermissions';
import api from '../services/api';
import { formatDisplayCurrency } from '../utils/currency';
import styles from './Dashboard.module.css';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  specialRequests?: string;
  preparationTime: number;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  startedAt?: string;
  completedAt?: string;
  ingredients: string[];
  allergens?: string[];
  spicyLevel?: number;
}

interface KitchenOrder {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  customerName?: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime: number;
  actualTime?: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  specialInstructions?: string;
  serverName?: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  totalAmount: number;
}

interface KitchenMetrics {
  activeOrders: number;
  pendingOrders: number;
  completedToday: number;
  avgPreparationTime: number;
  onTimeDelivery: number;
  efficiency: number;
}

const KitchenQueue: React.FC = () => {
  const { canViewKitchenQueue, canManageKitchen, user } = usePermissions();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [metrics, setMetrics] = useState<KitchenMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'table'>('time');

  useEffect(() => {
    if (canViewKitchenQueue()) {
      fetchKitchenData();
      // Set up real-time updates every 15 seconds
      const interval = setInterval(fetchKitchenData, 15000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchKitchenData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, metricsResponse] = await Promise.all([
        api.get('/kitchen/queue/'),
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
      await api.patch(`/kitchen/orders/${orderId}/`, { 
        status: newStatus,
        updatedBy: user?.id,
        timestamp: new Date().toISOString()
      });
      await fetchKitchenData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const updateItemStatus = async (orderId: string, itemId: string, newStatus: string) => {
    try {
      await api.patch(`/kitchen/orders/${orderId}/items/${itemId}/`, { 
        status: newStatus,
        timestamp: new Date().toISOString()
      });
      await fetchKitchenData();
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  const changePriority = async (orderId: string, newPriority: string) => {
    try {
      await api.patch(`/kitchen/orders/${orderId}/priority/`, { priority: newPriority });
      await fetchKitchenData();
    } catch (error) {
      console.error('Error changing priority:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'preparing': return '#3b82f6';
      case 'ready': return '#10b981';
      case 'served': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getTimeElapsed = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    return diffMinutes;
  };

  const isOverdue = (order: KitchenOrder) => {
    if (!order.startedAt) return false;
    const elapsed = getTimeElapsed(order.startedAt);
    return elapsed > order.estimatedTime;
  };

  const filteredOrders = orders
    .filter(order => {
      if (filterStatus === 'active') return ['pending', 'preparing'].includes(order.status);
      if (filterStatus === 'all') return true;
      return order.status === filterStatus;
    })
    .filter(order => filterPriority === 'all' || order.priority === filterPriority)
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'table':
          return (a.tableNumber || '').localeCompare(b.tableNumber || '');
        case 'time':
        default:
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
    });

  if (!canViewKitchenQueue()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the kitchen queue.</p>
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
              Kitchen Queue
            </h1>
            <p className={styles.subtitle}>
              Real-time order management and preparation tracking
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchKitchenData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <FiRefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Kitchen Metrics */}
      {metrics && (
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#ef4444' }}>
                <FiClock />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Active Orders</h3>
              <p className={styles.metricValue}>{metrics.activeOrders}</p>
              <span className="text-sm text-gray-500">In progress</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#f59e0b' }}>
                <FiAlertCircle />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Pending</h3>
              <p className={styles.metricValue}>{metrics.pendingOrders}</p>
              <span className="text-sm text-gray-500">Waiting to start</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#10b981' }}>
                <FiCheck />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Completed Today</h3>
              <p className={styles.metricValue}>{metrics.completedToday}</p>
              <span className="text-sm text-gray-500">Orders finished</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#3b82f6' }}>
                <FiUsers />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Avg Prep Time</h3>
              <p className={styles.metricValue}>{metrics.avgPreparationTime}m</p>
              <span className="text-sm text-gray-500">Per order</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FiFilter className="h-4 w-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active Orders</option>
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
              </select>
            </div>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'time' | 'priority' | 'table')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="time">Sort by Time</option>
              <option value="priority">Sort by Priority</option>
              <option value="table">Sort by Table</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      {/* Orders Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map(order => (
          <KitchenOrderCard
            key={order.id}
            order={order}
            onStatusChange={(status) => updateOrderStatus(order.id, status)}
            onItemStatusChange={(itemId, status) => updateItemStatus(order.id, itemId, status)}
            onPriorityChange={(priority) => changePriority(order.id, priority)}
            onSelect={() => setSelectedOrder(order)}
            canManage={canManageKitchen()}
            isOverdue={isOverdue(order)}
          />
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <FiCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders in queue</h3>
          <p className="text-gray-500">All caught up! New orders will appear here.</p>
        </div>
      )}
    </div>
  );
};

// Kitchen Order Card Component
const KitchenOrderCard: React.FC<{
  order: KitchenOrder;
  onStatusChange: (status: string) => void;
  onItemStatusChange: (itemId: string, status: string) => void;
  onPriorityChange: (priority: string) => void;
  onSelect: () => void;
  canManage: boolean;
  isOverdue: boolean;
}> = ({ 
  order, 
  onStatusChange, 
  onItemStatusChange, 
  onPriorityChange, 
  onSelect, 
  canManage,
  isOverdue 
}) => {
  const [expanded, setExpanded] = useState(false);

  const getTimeElapsed = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    return diffMinutes;
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md border-l-4 ${
        isOverdue ? 'border-l-red-500 bg-red-50' : ''
      }`}
      style={{ 
        borderLeftColor: isOverdue ? '#ef4444' : getPriorityColor(order.priority)
      }}
    >
      {/* Order Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
            <p className="text-sm text-gray-600">
              {order.tableNumber ? `Table ${order.tableNumber}` : order.orderType}
              {order.customerName && ` • ${order.customerName}`}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span 
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: getPriorityColor(order.priority) }}
            >
              {order.priority.toUpperCase()}
            </span>
            
            <span 
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: getStatusColor(order.status) }}
            >
              {order.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {order.startedAt 
              ? `Started ${getTimeElapsed(order.startedAt)}m ago`
              : `Ordered ${getTimeElapsed(order.createdAt)}m ago`
            }
          </span>
          <span>Est. {order.estimatedTime}m</span>
        </div>

        {isOverdue && (
          <div className="mt-2 flex items-center text-red-600 text-sm">
            <FiAlertCircle className="h-4 w-4 mr-1" />
            <span className="font-medium">OVERDUE</span>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="p-4">
        <div className="space-y-2">
          {order.items.slice(0, expanded ? order.items.length : 3).map(item => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex-1">
                <span className="font-medium">{item.quantity}x {item.name}</span>
                {item.specialRequests && (
                  <p className="text-xs text-orange-600 italic mt-1">
                    Note: {item.specialRequests}
                  </p>
                )}
                {item.spicyLevel && item.spicyLevel > 0 && (
                  <div className="flex items-center mt-1">
                    {Array.from({ length: item.spicyLevel }).map((_, i) => (
                      <FiStar key={i} className="h-3 w-3 text-red-500 fill-current" />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">Spicy</span>
                  </div>
                )}
              </div>
              
              {canManage && (
                <div className="flex items-center space-x-1">
                  {item.status === 'pending' && (
                    <button
                      onClick={() => onItemStatusChange(item.id, 'preparing')}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Start preparing"
                    >
                      <FiPlay className="h-3 w-3" />
                    </button>
                  )}
                  {item.status === 'preparing' && (
                    <button
                      onClick={() => onItemStatusChange(item.id, 'ready')}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      title="Mark ready"
                    >
                      <FiCheck className="h-3 w-3" />
                    </button>
                  )}
                  <span 
                    className="text-xs px-1 py-0.5 rounded"
                    style={{ 
                      backgroundColor: getStatusColor(item.status) + '20',
                      color: getStatusColor(item.status)
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {order.items.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {expanded ? (
              <>Show less <FiChevronUp className="h-4 w-4 ml-1" /></>
            ) : (
              <>Show {order.items.length - 3} more items <FiChevronDown className="h-4 w-4 ml-1" /></>
            )}
          </button>
        )}

        {order.specialInstructions && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-start">
              <FiMessageSquare className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Special Instructions:</p>
                <p className="text-sm text-yellow-700">{order.specialInstructions}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {canManage && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {order.status === 'pending' && (
                <button
                  onClick={() => onStatusChange('preparing')}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
                >
                  <FiPlay className="h-3 w-3" />
                  <span>Start</span>
                </button>
              )}
              
              {order.status === 'preparing' && (
                <button
                  onClick={() => onStatusChange('ready')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
                >
                  <FiCheck className="h-3 w-3" />
                  <span>Ready</span>
                </button>
              )}

              {order.status === 'ready' && (
                <button
                  onClick={() => onStatusChange('served')}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 flex items-center space-x-1"
                >
                  <FiUsers className="h-3 w-3" />
                  <span>Served</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {order.priority !== 'urgent' && (
                <button
                  onClick={() => onPriorityChange('urgent')}
                  className="text-red-600 hover:bg-red-100 p-1 rounded"
                  title="Mark as urgent"
                >
                  <FiChevronUp className="h-4 w-4" />
                </button>
              )}
              
              <button
                onClick={onSelect}
                className="text-gray-600 hover:bg-gray-200 p-1 rounded"
                title="View details"
              >
                <FiMessageSquare className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock data for development
const mockOrders: KitchenOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    tableNumber: '5',
    customerName: 'John Doe',
    status: 'pending',
    priority: 'high',
    estimatedTime: 15,
    createdAt: new Date().toISOString(),
    orderType: 'dine-in',
    totalAmount: 45000,
    specialInstructions: 'No onions, extra spicy',
    items: [
      {
        id: '1',
        name: 'Grilled Chicken',
        quantity: 1,
        preparationTime: 12,
        status: 'pending',
        ingredients: ['chicken', 'herbs', 'oil'],
        spicyLevel: 2
      },
      {
        id: '2',
        name: 'Caesar Salad',
        quantity: 1,
        preparationTime: 5,
        status: 'pending',
        ingredients: ['lettuce', 'croutons', 'parmesan'],
        specialRequests: 'Extra dressing'
      }
    ]
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    tableNumber: '3',
    customerName: 'Jane Smith',
    status: 'preparing',
    priority: 'medium',
    estimatedTime: 20,
    createdAt: new Date(Date.now() - 300000).toISOString(),
    startedAt: new Date(Date.now() - 180000).toISOString(),
    orderType: 'dine-in',
    totalAmount: 65000,
    items: [
      {
        id: '3',
        name: 'Beef Steak',
        quantity: 2,
        preparationTime: 18,
        status: 'preparing',
        ingredients: ['beef', 'seasoning', 'butter']
      }
    ]
  }
];

const mockMetrics: KitchenMetrics = {
  activeOrders: 8,
  pendingOrders: 3,
  completedToday: 45,
  avgPreparationTime: 16,
  onTimeDelivery: 87,
  efficiency: 92
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return '#dc2626';
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#10b981';
    default: return '#6b7280';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return '#f59e0b';
    case 'preparing': return '#3b82f6';
    case 'ready': return '#10b981';
    case 'served': return '#6b7280';
    default: return '#6b7280';
  }
};

export default KitchenQueue;
