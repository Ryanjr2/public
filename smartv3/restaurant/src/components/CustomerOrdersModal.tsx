// src/components/CustomerOrdersModal.tsx
import React, { useState } from 'react';
import {
  FiX, FiShoppingCart, FiCalendar, FiTrendingUp, FiClock,
  FiCheck, FiTruck, FiUser, FiMapPin, FiPhone, FiFilter,
  FiSearch, FiEye, FiDownload, FiRefreshCw
} from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import styles from './CustomerOrdersModal.module.css';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  date_joined: string;
  last_visit: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  favorite_items: string[];
  loyalty_points: number;
  status: 'active' | 'inactive' | 'vip';
  preferences: {
    dietary_restrictions: string[];
    preferred_table: string;
    special_occasions: string[];
  };
  visit_frequency: 'regular' | 'occasional' | 'rare';
  customer_segment: 'new' | 'returning' | 'loyal' | 'vip';
}

interface Order {
  id: number;
  order_number: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  service_charge: number;
  total: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  table_number?: number;
  delivery_address?: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  special_instructions?: string;
}

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  isOpen,
  onClose,
  customer
}) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!isOpen || !customer) return null;

  // Generate mock orders based on customer data
  const generateOrders = (customer: Customer): Order[] => {
    const orders: Order[] = [];
    const orderTypes: ('dine_in' | 'takeaway' | 'delivery')[] = ['dine_in', 'takeaway', 'delivery'];
    const statuses: Order['status'][] = ['completed', 'completed', 'completed', 'pending', 'cancelled'];
    const paymentMethods = ['Cash', 'Card', 'Mobile Money', 'Corporate Account'];
    
    for (let i = 0; i < customer.total_orders; i++) {
      const orderDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const items = [
        { name: 'Nyama Choma', quantity: 1, price: 25000, total: 25000 },
        { name: 'Ugali', quantity: 2, price: 5000, total: 10000 },
        { name: 'Pilau', quantity: 1, price: 15000, total: 15000 },
        { name: 'Soda', quantity: 2, price: 3000, total: 6000 }
      ].slice(0, Math.floor(Math.random() * 4) + 1);
      
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.18;
      const service_charge = subtotal * 0.10;
      const total = subtotal + tax + service_charge;
      
      orders.push({
        id: 1000 + i,
        order_number: `ORD-${(1000 + i).toString().padStart(4, '0')}`,
        date: orderDate.toISOString().split('T')[0],
        time: orderDate.toTimeString().split(' ')[0].substring(0, 5),
        status,
        items,
        subtotal,
        tax,
        service_charge,
        total,
        payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        payment_status: status === 'completed' ? 'paid' : status === 'cancelled' ? 'refunded' : 'pending',
        table_number: orderType === 'dine_in' ? Math.floor(Math.random() * 20) + 1 : undefined,
        delivery_address: orderType === 'delivery' ? customer.address : undefined,
        order_type: orderType,
        special_instructions: Math.random() > 0.7 ? 'Extra spicy, no onions' : undefined
      });
    }
    
    return orders.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
  };

  const orders = generateOrders(customer);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'preparing': return '#3b82f6';
      case 'ready': return '#8b5cf6';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getOrderTypeIcon = (type: Order['order_type']) => {
    switch (type) {
      case 'dine_in': return FiUser;
      case 'takeaway': return FiShoppingCart;
      case 'delivery': return FiTruck;
      default: return FiShoppingCart;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const orderStats = {
    total: orders.length,
    completed: orders.filter(o => o.status === 'completed').length,
    pending: orders.filter(o => o.status === 'pending').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalValue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0)
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.customerHeader}>
            <div className={styles.customerInfo}>
              <h2>{customer.name} - Order History</h2>
              <p>{customer.total_orders} total orders • {formatCurrency(customer.total_spent)} spent</p>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          {/* Order Statistics */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: '#3b82f6' }}>
                <FiShoppingCart />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{orderStats.total}</span>
                <span className={styles.statLabel}>Total Orders</span>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: '#10b981' }}>
                <FiCheck />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{orderStats.completed}</span>
                <span className={styles.statLabel}>Completed</span>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: '#f59e0b' }}>
                <FiClock />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{orderStats.pending}</span>
                <span className={styles.statLabel}>Pending</span>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: '#ef4444' }}>
                <FiX />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{orderStats.cancelled}</span>
                <span className={styles.statLabel}>Cancelled</span>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filters}>
              <button 
                className={`${styles.filterButton} ${filter === 'all' ? styles.activeFilter : ''}`}
                onClick={() => setFilter('all')}
              >
                All Orders
              </button>
              <button 
                className={`${styles.filterButton} ${filter === 'completed' ? styles.activeFilter : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
              <button 
                className={`${styles.filterButton} ${filter === 'pending' ? styles.activeFilter : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={`${styles.filterButton} ${filter === 'cancelled' ? styles.activeFilter : ''}`}
                onClick={() => setFilter('cancelled')}
              >
                Cancelled
              </button>
            </div>
            
            <div className={styles.actions}>
              <button className={styles.actionButton}>
                <FiDownload /> Export
              </button>
              <button className={styles.actionButton}>
                <FiRefreshCw /> Refresh
              </button>
            </div>
          </div>

          {/* Orders List */}
          <div className={styles.ordersList}>
            {filteredOrders.map((order) => {
              const OrderTypeIcon = getOrderTypeIcon(order.order_type);
              
              return (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderInfo}>
                      <div className={styles.orderMeta}>
                        <h3 className={styles.orderNumber}>{order.order_number}</h3>
                        <div className={styles.orderBadges}>
                          <span 
                            className={styles.statusBadge}
                            style={{ backgroundColor: getStatusColor(order.status) }}
                          >
                            {order.status}
                          </span>
                          <span className={styles.typeBadge}>
                            <OrderTypeIcon /> {order.order_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className={styles.orderDetails}>
                        <span className={styles.orderDate}>
                          <FiCalendar /> {new Date(order.date).toLocaleDateString()} at {order.time}
                        </span>
                        <span className={styles.orderTotal}>
                          <FiTrendingUp /> {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      className={styles.viewButton}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <FiEye /> View Details
                    </button>
                  </div>
                  
                  <div className={styles.orderItems}>
                    <h4>Items:</h4>
                    <div className={styles.itemsList}>
                      {order.items.map((item, index) => (
                        <span key={index} className={styles.orderItem}>
                          {item.quantity}x {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {order.special_instructions && (
                    <div className={styles.specialInstructions}>
                      <strong>Special Instructions:</strong> {order.special_instructions}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredOrders.length === 0 && (
            <div className={styles.emptyState}>
              <FiShoppingCart size={64} />
              <h3>No orders found</h3>
              <p>
                {filter === 'all' 
                  ? 'This customer has no orders yet.' 
                  : `No ${filter} orders found.`}
              </p>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className={styles.orderDetailsOverlay} onClick={() => setSelectedOrder(null)}>
            <div className={styles.orderDetailsModal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.orderDetailsHeader}>
                <h3>Order Details - {selectedOrder.order_number}</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => setSelectedOrder(null)}
                >
                  <FiX />
                </button>
              </div>
              
              <div className={styles.orderDetailsContent}>
                <div className={styles.orderDetailsGrid}>
                  <div className={styles.orderDetailsSection}>
                    <h4>Order Information</h4>
                    <p><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {selectedOrder.time}</p>
                    <p><strong>Type:</strong> {selectedOrder.order_type.replace('_', ' ')}</p>
                    <p><strong>Status:</strong> {selectedOrder.status}</p>
                    {selectedOrder.table_number && (
                      <p><strong>Table:</strong> {selectedOrder.table_number}</p>
                    )}
                  </div>
                  
                  <div className={styles.orderDetailsSection}>
                    <h4>Payment Information</h4>
                    <p><strong>Method:</strong> {selectedOrder.payment_method}</p>
                    <p><strong>Status:</strong> {selectedOrder.payment_status}</p>
                    <p><strong>Subtotal:</strong> {formatCurrency(selectedOrder.subtotal)}</p>
                    <p><strong>Tax:</strong> {formatCurrency(selectedOrder.tax)}</p>
                    <p><strong>Service Charge:</strong> {formatCurrency(selectedOrder.service_charge)}</p>
                    <p><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</p>
                  </div>
                </div>
                
                <div className={styles.orderDetailsSection}>
                  <h4>Items Ordered</h4>
                  <div className={styles.itemsTable}>
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className={styles.itemRow}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemQuantity}>x{item.quantity}</span>
                        <span className={styles.itemPrice}>{formatCurrency(item.price)}</span>
                        <span className={styles.itemTotal}>{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrdersModal;
