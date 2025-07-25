// src/components/OrderDetailsModal.tsx
import React, { useState } from 'react';
import {
  FiX, FiUser, FiPhone, FiMapPin, FiClock, FiTrendingUp,
  FiCheck, FiAlertCircle, FiCalendar, FiEdit2
} from 'react-icons/fi';
import { formatCurrency, formatDisplayCurrency } from '../utils/currency';
import styles from './OrderDetailsModal.module.css';

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
  customer_phone: string;
  customer_email?: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  table_number?: number;
  delivery_address?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  priority: 'normal' | 'high' | 'urgent';
  items: OrderItem[];
  total_amount: number;
  created_at: string;
  estimated_completion: string;
  special_instructions?: string;
  assigned_staff?: string;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus: (orderId: number, status: Order['status']) => void;
  onUpdateItemStatus: (orderId: number, itemId: number, status: OrderItem['status']) => void;
  onAssignStaff: (orderId: number, staffName: string) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
  onUpdateItemStatus,
  onAssignStaff
}) => {
  const [assigningStaff, setAssigningStaff] = useState(false);
  const [staffName, setStaffName] = useState('');

  if (!isOpen || !order) return null;

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-TZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAssignStaff = () => {
    if (staffName.trim()) {
      onAssignStaff(order.id, staffName.trim());
      setStaffName('');
      setAssigningStaff(false);
    }
  };

  const getNextStatus = (currentStatus: Order['status']) => {
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'completed';
      default: return null;
    }
  };

  const getStatusAction = (status: Order['status']) => {
    switch (status) {
      case 'pending': return { label: 'Confirm Order', icon: FiCheck };
      case 'confirmed': return { label: 'Start Preparing', icon: FiClock };
      case 'preparing': return { label: 'Mark Ready', icon: FiCheck };
      case 'ready': return { label: 'Complete Order', icon: FiCheck };
      default: return null;
    }
  };

  const statusAction = getStatusAction(order.status);
  const nextStatus = getNextStatus(order.status);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h2>{order.order_number}</h2>
            <span 
              className={styles.statusBadge}
              style={{ backgroundColor: getStatusColor(order.status) }}
            >
              {order.status}
            </span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          {/* Customer Information */}
          <div className={styles.section}>
            <h3>Customer Information</h3>
            <div className={styles.customerDetails}>
              <div className={styles.customerItem}>
                <FiUser className={styles.icon} />
                <span>{order.customer_name}</span>
              </div>
              <div className={styles.customerItem}>
                <FiPhone className={styles.icon} />
                <span>{order.customer_phone}</span>
              </div>
              {order.customer_email && (
                <div className={styles.customerItem}>
                  <span>📧</span>
                  <span>{order.customer_email}</span>
                </div>
              )}
              {order.delivery_address && (
                <div className={styles.customerItem}>
                  <FiMapPin className={styles.icon} />
                  <span>{order.delivery_address}</span>
                </div>
              )}
              {order.table_number && (
                <div className={styles.customerItem}>
                  <span>🪑</span>
                  <span>Table {order.table_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className={styles.section}>
            <h3>Order Details</h3>
            <div className={styles.orderMeta}>
              <div className={styles.metaItem}>
                <FiCalendar className={styles.icon} />
                <div>
                  <span className={styles.metaLabel}>Order Time</span>
                  <span className={styles.metaValue}>{formatDateTime(order.created_at)}</span>
                </div>
              </div>
              <div className={styles.metaItem}>
                <FiClock className={styles.icon} />
                <div>
                  <span className={styles.metaLabel}>Estimated Completion</span>
                  <span className={styles.metaValue}>{formatDateTime(order.estimated_completion)}</span>
                </div>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.typeIcon}>
                  {order.order_type === 'dine_in' ? '🍽️' : order.order_type === 'takeaway' ? '🥡' : '🚚'}
                </span>
                <div>
                  <span className={styles.metaLabel}>Order Type</span>
                  <span className={styles.metaValue}>{order.order_type.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className={styles.section}>
            <h3>Order Items</h3>
            <div className={styles.itemsList}>
              {order.items.map(item => (
                <div key={item.id} className={styles.orderItem}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemQuantity}>x{item.quantity}</span>
                    </div>
                    {item.special_instructions && (
                      <div className={styles.itemInstructions}>
                        <FiAlertCircle size={14} />
                        <span>{item.special_instructions}</span>
                      </div>
                    )}
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
                    <div className={styles.itemStatusButtons}>
                      {item.status === 'pending' && (
                        <button
                          className={styles.statusButton}
                          onClick={() => onUpdateItemStatus(order.id, item.id, 'preparing')}
                        >
                          Start
                        </button>
                      )}
                      {item.status === 'preparing' && (
                        <button
                          className={styles.statusButton}
                          onClick={() => onUpdateItemStatus(order.id, item.id, 'ready')}
                        >
                          Ready
                        </button>
                      )}
                      {item.status === 'ready' && (
                        <button
                          className={styles.statusButton}
                          onClick={() => onUpdateItemStatus(order.id, item.id, 'served')}
                        >
                          Served
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          {order.special_instructions && (
            <div className={styles.section}>
              <h3>Special Instructions</h3>
              <div className={styles.specialInstructions}>
                <FiAlertCircle />
                <span>{order.special_instructions}</span>
              </div>
            </div>
          )}

          {/* Staff Assignment */}
          <div className={styles.section}>
            <h3>Staff Assignment</h3>
            <div className={styles.staffAssignment}>
              {order.assigned_staff ? (
                <div className={styles.assignedStaff}>
                  <FiClock className={styles.icon} />
                  <span>Assigned to: <strong>{order.assigned_staff}</strong></span>
                  <button
                    className={styles.editButton}
                    onClick={() => setAssigningStaff(true)}
                  >
                    <FiEdit2 />
                  </button>
                </div>
              ) : (
                <button
                  className={styles.assignButton}
                  onClick={() => setAssigningStaff(true)}
                >
                  <FiClock /> Assign Staff
                </button>
              )}
              
              {assigningStaff && (
                <div className={styles.assignForm}>
                  <input
                    type="text"
                    placeholder="Enter staff name"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className={styles.staffInput}
                  />
                  <div className={styles.assignActions}>
                    <button
                      className={styles.saveButton}
                      onClick={handleAssignStaff}
                    >
                      Assign
                    </button>
                    <button
                      className={styles.cancelButton}
                      onClick={() => {
                        setAssigningStaff(false);
                        setStaffName('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Total */}
          <div className={styles.section}>
            <div className={styles.orderTotal}>
              <FiTrendingUp className={styles.icon} />
              <span className={styles.totalLabel}>Total Amount:</span>
              <span className={styles.totalAmount}>{formatDisplayCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.footer}>
          {statusAction && nextStatus && (
            <button
              className={styles.primaryAction}
              onClick={() => onUpdateStatus(order.id, nextStatus)}
            >
              <statusAction.icon />
              {statusAction.label}
            </button>
          )}
          {order.status !== 'cancelled' && order.status !== 'completed' && (
            <button
              className={styles.cancelAction}
              onClick={() => onUpdateStatus(order.id, 'cancelled')}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
