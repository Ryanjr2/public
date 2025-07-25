// src/pages/OrderManagementPage.tsx - Clean Version
import React, { useState, useEffect } from 'react';
import {
  FiClock, FiUser, FiMapPin, FiPhone, FiCheck, FiX,
  FiAlertCircle, FiTruck, FiEye, FiFilter,
  FiRefreshCw, FiTrendingUp, FiCalendar, FiBriefcase
} from 'react-icons/fi';
import { formatCurrency, formatDisplayCurrency } from '../utils/currency';
import styles from './OrderManagement.module.css';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  special_instructions?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  table_number?: number;
  delivery_address?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  priority: 'normal' | 'high' | 'urgent';
  items: OrderItem[];
  total_amount: number;
  created_at: string;
  estimated_completion?: string;
  special_instructions?: string;
  assigned_staff?: string;
}

const OrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Mock data for demonstration
  const mockOrders: Order[] = [
    {
      id: 1,
      order_number: 'ORD-001',
      customer_name: 'John Mwangi',
      customer_phone: '+255 712 345 678',
      customer_email: 'john@example.com',
      order_type: 'dine_in',
      table_number: 5,
      status: 'preparing',
      priority: 'normal',
      items: [
        { id: 1, name: 'Nyama Choma', quantity: 2, price: 25000, status: 'preparing' },
        { id: 2, name: 'Ugali', quantity: 2, price: 3000, status: 'ready' },
        { id: 3, name: 'Chai ya Tangawizi', quantity: 2, price: 2500, status: 'ready' }
      ],
      total_amount: 61000,
      created_at: '2024-01-15T14:30:00Z',
      estimated_completion: '2024-01-15T15:00:00Z',
      special_instructions: 'Medium spice level',
      assigned_staff: 'Chef Maria'
    },
    {
      id: 2,
      order_number: 'ORD-002',
      customer_name: 'Fatuma Hassan',
      customer_phone: '+255 754 987 654',
      order_type: 'delivery',
      delivery_address: 'Mikocheni, House No. 45, Dar es Salaam',
      status: 'confirmed',
      priority: 'high',
      items: [
        { id: 4, name: 'Pilau', quantity: 3, price: 22000, status: 'pending' },
        { id: 5, name: 'Samosa', quantity: 6, price: 2000, status: 'pending' }
      ],
      total_amount: 78000,
      created_at: '2024-01-15T14:45:00Z',
      estimated_completion: '2024-01-15T15:30:00Z',
      special_instructions: 'Call when arriving'
    },
    {
      id: 3,
      order_number: 'ORD-003',
      customer_name: 'David Kimani',
      customer_phone: '+255 678 123 456',
      order_type: 'takeaway',
      status: 'ready',
      priority: 'urgent',
      items: [
        { id: 6, name: 'Chapati na Mchuzi', quantity: 4, price: 8000, status: 'ready' },
        { id: 7, name: 'Juice ya Maembe', quantity: 2, price: 4000, status: 'ready' }
      ],
      total_amount: 40000,
      created_at: '2024-01-15T13:15:00Z',
      estimated_completion: '2024-01-15T14:00:00Z'
    }
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log('🔄 Loading orders...');
        setOrders(mockOrders);
        setLoading(false);
        console.log('✅ Orders loaded successfully:', mockOrders.length);
      } catch (error: any) {
        console.error('❌ Error loading orders:', error);
        setOrders(mockOrders);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesType = selectedType === 'all' || order.order_type === selectedType;
    return matchesStatus && matchesType;
  });

  const updateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      console.log('✅ Order status updated:', orderId, newStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'preparing': return '#8b5cf6';
      case 'ready': return '#10b981';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'normal': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'dine_in': return <FiUser />;
      case 'takeaway': return <FiClock />;
      case 'delivery': return <FiTruck />;
      default: return <FiUser />;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading orders...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Order Management</h1>
          <p className={styles.subtitle}>Real-time order tracking and kitchen workflow</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.refreshButton}
            onClick={() => window.location.reload()}
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <FiFilter className={styles.filterIcon} />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Types</option>
            <option value="dine_in">Dine In</option>
            <option value="takeaway">Takeaway</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      <div className={styles.ordersGrid}>
        {filteredOrders.map(order => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div className={styles.orderInfo}>
                <h3 className={styles.orderNumber}>
                  {order.order_number}
                  {order.status === 'completed' && (
                    <span className={styles.paidIndicator}>💳 PAID</span>
                  )}
                </h3>
                <div className={styles.orderMeta}>
                  <span className={styles.orderType}>
                    {getOrderTypeIcon(order.order_type)}
                    {order.order_type.replace('_', ' ')}
                  </span>
                  {order.table_number && (
                    <span className={styles.tableNumber}>Table {order.table_number}</span>
                  )}
                </div>
              </div>
              <div className={styles.orderBadges}>
                <span 
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </span>
                <span 
                  className={styles.priorityBadge}
                  style={{ backgroundColor: getPriorityColor(order.priority) }}
                >
                  {order.priority}
                </span>
              </div>
            </div>

            <div className={styles.customerInfo}>
              <div className={styles.customerName}>
                <FiUser /> {order.customer_name}
              </div>
              <div className={styles.customerPhone}>
                <FiPhone /> {order.customer_phone}
              </div>
              {order.delivery_address && (
                <div className={styles.deliveryAddress}>
                  <FiMapPin /> {order.delivery_address}
                </div>
              )}
            </div>

            <div className={styles.orderItems}>
              {order.items.map(item => (
                <div key={item.id} className={styles.orderItem}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemQuantity}>x{item.quantity}</span>
                  </div>
                  <div className={styles.itemActions}>
                    <span 
                      className={styles.itemStatus}
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    >
                      {item.status}
                    </span>
                    <span className={styles.itemPrice}>
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.orderFooter}>
              <div className={styles.orderTotal}>
                <FiTrendingUp />
                <strong>{formatDisplayCurrency(order.total_amount)}</strong>
              </div>
              <div className={styles.orderActions}>
                <button
                  className={styles.viewButton}
                  onClick={() => console.log('View order:', order.id)}
                >
                  <FiEye /> View Details
                </button>
                {order.status === 'pending' && (
                  <button
                    className={styles.confirmButton}
                    onClick={() => updateOrderStatus(order.id, 'confirmed')}
                  >
                    <FiCheck /> Confirm
                  </button>
                )}
                {order.status === 'confirmed' && (
                  <button
                    className={styles.prepareButton}
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                  >
                    <FiClock /> Start Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    className={styles.readyButton}
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                  >
                    <FiCheck /> Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    className={styles.completeButton}
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                  >
                    <FiCheck /> Complete
                  </button>
                )}
              </div>
            </div>

            {order.special_instructions && (
              <div className={styles.specialInstructions}>
                <FiAlertCircle />
                <span>{order.special_instructions}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className={styles.emptyState}>
          <FiClock size={48} />
          <h3>No orders found</h3>
          <p>No orders match your current filters</p>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage;
