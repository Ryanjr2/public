// Kitchen Dashboard - Chef Interface for Order Management
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiClock, 
  FiCheck, 
  FiAlertCircle, 
  FiUser,
  FiMapPin,
  FiMessageSquare,
  FiRefreshCw,
  FiPlay,
  FiPause,
  FiCheckCircle,
  FiX
} from 'react-icons/fi';
import api from '../services/api';
import './KitchenDashboard.module.css';

// Types
interface OrderItem {
  id: number;
  menu_item: string;
  quantity: number;
  unit_price: string;
  line_total: string;
  special_instructions?: string;
}

interface Order {
  id: number;
  customer_name: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total: string;
  created_at: string;
  estimated_prep_time?: number;
  is_takeout: boolean;
  kitchen_notes?: string;
  items: OrderItem[];
  table_number?: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

const KitchenDashboard: React.FC = () => {
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch orders from kitchen queue
  const fetchOrders = async () => {
    try {
      setError(null);
      const response = await api.get('/orders/kitchen_queue/');
      setOrders(response.data.results || response.data);
      console.log('✅ Kitchen orders loaded:', response.data);
    } catch (error: any) {
      console.error('Failed to fetch kitchen orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const response = await api.patch(`/orders/${orderId}/`, { status });
      console.log('✅ Order status updated:', response.data);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: status as any } : order
      ));
      
      // Close modal if order is completed
      if (status === 'completed' && selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  // Auto-refresh orders
  useEffect(() => {
    fetchOrders();
    
    if (autoRefresh) {
      const interval = setInterval(fetchOrders, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Format price in TZS
  const formatPrice = (price: string): string => {
    const numPrice = parseFloat(price);
    return `TZS ${(numPrice * 1000).toLocaleString()}`;
  };

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'preparing': return '#17a2b8';
      case 'ready': return '#28a745';
      case 'completed': return '#6c757d';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'normal': return '#28a745';
      case 'low': return '#6c757d';
      default: return '#6c757d';
    }
  };

  // Filter orders by status
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const preparingOrders = orders.filter(order => order.status === 'preparing');
  const readyOrders = orders.filter(order => order.status === 'ready');

  if (loading) {
    return (
      <div className="kitchen-dashboard loading">
        <FiRefreshCw className="spinning" size={48} />
        <p>Loading kitchen orders...</p>
      </div>
    );
  }

  return (
    <div className="kitchen-dashboard">
      {/* Header */}
      <div className="kitchen-header">
        <div className="header-left">
          <h1>Kitchen Dashboard</h1>
          <div className="order-stats">
            <div className="stat pending">
              <span className="count">{pendingOrders.length}</span>
              <span className="label">Pending</span>
            </div>
            <div className="stat preparing">
              <span className="count">{preparingOrders.length}</span>
              <span className="label">Preparing</span>
            </div>
            <div className="stat ready">
              <span className="count">{readyOrders.length}</span>
              <span className="label">Ready</span>
            </div>
          </div>
        </div>

        <div className="header-right">
          <button
            className={`auto-refresh-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? <FiPause /> : <FiPlay />}
            Auto Refresh
          </button>
          <button className="refresh-btn" onClick={fetchOrders}>
            <FiRefreshCw />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <FiAlertCircle />
          {error}
        </div>
      )}

      {/* Orders Grid */}
      <div className="orders-grid">
        {/* Pending Orders */}
        <div className="order-column">
          <div className="column-header pending">
            <FiClock />
            <h3>Pending Orders ({pendingOrders.length})</h3>
          </div>
          <div className="order-list">
            <AnimatePresence>
              {pendingOrders.map((order) => (
                <motion.div
                  key={order.id}
                  className="order-card pending"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="order-header">
                    <span className="order-id">#{order.id}</span>
                    <span className="order-time">{formatTimeAgo(order.created_at)}</span>
                  </div>
                  
                  <div className="order-customer">
                    <FiUser />
                    <span>{order.customer_name}</span>
                    {order.is_takeout ? (
                      <span className="takeout-badge">Takeout</span>
                    ) : (
                      <span className="dinein-badge">
                        <FiMapPin />
                        Table {order.table_number || '?'}
                      </span>
                    )}
                  </div>
                  
                  <div className="order-items">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="item-summary">
                        <span>{item.quantity}× {item.menu_item}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="more-items">
                        +{order.items.length - 2} more items
                      </div>
                    )}
                  </div>
                  
                  <div className="order-footer">
                    <span className="order-total">{formatPrice(order.total)}</span>
                    <button 
                      className="start-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, 'preparing');
                      }}
                    >
                      <FiPlay />
                      Start
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Preparing Orders */}
        <div className="order-column">
          <div className="column-header preparing">
            <FiRefreshCw />
            <h3>Preparing ({preparingOrders.length})</h3>
          </div>
          <div className="order-list">
            <AnimatePresence>
              {preparingOrders.map((order) => (
                <motion.div
                  key={order.id}
                  className="order-card preparing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="order-header">
                    <span className="order-id">#{order.id}</span>
                    <span className="order-time">{formatTimeAgo(order.created_at)}</span>
                  </div>
                  
                  <div className="order-customer">
                    <FiUser />
                    <span>{order.customer_name}</span>
                    {order.is_takeout ? (
                      <span className="takeout-badge">Takeout</span>
                    ) : (
                      <span className="dinein-badge">
                        <FiMapPin />
                        Table {order.table_number || '?'}
                      </span>
                    )}
                  </div>
                  
                  <div className="order-items">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="item-summary">
                        <span>{item.quantity}× {item.menu_item}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="more-items">
                        +{order.items.length - 2} more items
                      </div>
                    )}
                  </div>
                  
                  <div className="order-footer">
                    <span className="order-total">{formatPrice(order.total)}</span>
                    <button 
                      className="ready-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, 'ready');
                      }}
                    >
                      <FiCheck />
                      Ready
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Ready Orders */}
        <div className="order-column">
          <div className="column-header ready">
            <FiCheckCircle />
            <h3>Ready for Pickup ({readyOrders.length})</h3>
          </div>
          <div className="order-list">
            <AnimatePresence>
              {readyOrders.map((order) => (
                <motion.div
                  key={order.id}
                  className="order-card ready"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="order-header">
                    <span className="order-id">#{order.id}</span>
                    <span className="order-time">{formatTimeAgo(order.created_at)}</span>
                  </div>
                  
                  <div className="order-customer">
                    <FiUser />
                    <span>{order.customer_name}</span>
                    {order.is_takeout ? (
                      <span className="takeout-badge">Takeout</span>
                    ) : (
                      <span className="dinein-badge">
                        <FiMapPin />
                        Table {order.table_number || '?'}
                      </span>
                    )}
                  </div>
                  
                  <div className="order-items">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="item-summary">
                        <span>{item.quantity}× {item.menu_item}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="more-items">
                        +{order.items.length - 2} more items
                      </div>
                    )}
                  </div>
                  
                  <div className="order-footer">
                    <span className="order-total">{formatPrice(order.total)}</span>
                    <button 
                      className="complete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, 'completed');
                      }}
                    >
                      <FiCheckCircle />
                      Complete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="order-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              className="order-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Order #{selectedOrder.id}</h2>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  <FiX />
                </button>
              </div>
              
              <div className="modal-content">
                <div className="order-info">
                  <div className="info-row">
                    <span className="label">Customer:</span>
                    <span className="value">{selectedOrder.customer_name}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Type:</span>
                    <span className="value">
                      {selectedOrder.is_takeout ? 'Takeout' : `Dine In - Table ${selectedOrder.table_number || '?'}`}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className={`status-badge ${selectedOrder.status}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Ordered:</span>
                    <span className="value">{formatTimeAgo(selectedOrder.created_at)}</span>
                  </div>
                </div>
                
                {selectedOrder.kitchen_notes && (
                  <div className="kitchen-notes">
                    <FiMessageSquare />
                    <div>
                      <strong>Special Instructions:</strong>
                      <p>{selectedOrder.kitchen_notes}</p>
                    </div>
                  </div>
                )}
                
                <div className="order-items-detail">
                  <h3>Order Items</h3>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="item-detail">
                      <div className="item-main">
                        <span className="item-name">{item.menu_item}</span>
                        <span className="item-quantity">×{item.quantity}</span>
                        <span className="item-price">{formatPrice(item.line_total)}</span>
                      </div>
                      {item.special_instructions && (
                        <div className="item-instructions">
                          <FiMessageSquare size={14} />
                          <span>{item.special_instructions}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="order-total-detail">
                    <strong>Total: {formatPrice(selectedOrder.total)}</strong>
                  </div>
                </div>
                
                <div className="modal-actions">
                  {selectedOrder.status === 'pending' && (
                    <button 
                      className="btn-primary"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                    >
                      <FiPlay />
                      Start Preparing
                    </button>
                  )}
                  {selectedOrder.status === 'preparing' && (
                    <button 
                      className="btn-success"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                    >
                      <FiCheck />
                      Mark as Ready
                    </button>
                  )}
                  {selectedOrder.status === 'ready' && (
                    <button 
                      className="btn-complete"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                    >
                      <FiCheckCircle />
                      Complete Order
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KitchenDashboard;
