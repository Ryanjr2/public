// src/components/CustomerDetailsModal.tsx
import React from 'react';
import {
  FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar,
  FiShoppingCart, FiTrendingUp, FiStar, FiHeart, FiClock,
  FiTrendingUp as FiRevenue, FiGift, FiTag
} from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import styles from './CustomerDetailsModal.module.css';

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

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  isOpen,
  onClose,
  customer
}) => {
  if (!isOpen || !customer) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip': return '#f59e0b';
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'vip': return '#8b5cf6';
      case 'loyal': return '#3b82f6';
      case 'returning': return '#10b981';
      case 'new': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'regular': return 'Regular Visitor';
      case 'occasional': return 'Occasional Visitor';
      case 'rare': return 'Rare Visitor';
      default: return 'Unknown';
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.customerHeader}>
            <div className={styles.customerAvatar}>
              <FiUser />
            </div>
            <div className={styles.customerInfo}>
              <h2>{customer.name}</h2>
              <div className={styles.badges}>
                <span 
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(customer.status) }}
                >
                  {customer.status}
                </span>
                <span 
                  className={styles.segmentBadge}
                  style={{ backgroundColor: getSegmentColor(customer.customer_segment) }}
                >
                  {customer.customer_segment}
                </span>
              </div>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          {/* Contact Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiUser /> Contact Information
            </h3>
            <div className={styles.contactGrid}>
              <div className={styles.contactItem}>
                <FiMail className={styles.contactIcon} />
                <div>
                  <span className={styles.contactLabel}>Email</span>
                  <span className={styles.contactValue}>{customer.email}</span>
                </div>
              </div>
              <div className={styles.contactItem}>
                <FiPhone className={styles.contactIcon} />
                <div>
                  <span className={styles.contactLabel}>Phone</span>
                  <span className={styles.contactValue}>{customer.phone}</span>
                </div>
              </div>
              <div className={styles.contactItem}>
                <FiMapPin className={styles.contactIcon} />
                <div>
                  <span className={styles.contactLabel}>Address</span>
                  <span className={styles.contactValue}>{customer.address}</span>
                </div>
              </div>
              <div className={styles.contactItem}>
                <FiCalendar className={styles.contactIcon} />
                <div>
                  <span className={styles.contactLabel}>Member Since</span>
                  <span className={styles.contactValue}>
                    {new Date(customer.date_joined).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Metrics */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiTrendingUp /> Customer Metrics
            </h3>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ backgroundColor: '#3b82f6' }}>
                  <FiShoppingCart />
                </div>
                <div className={styles.metricInfo}>
                  <span className={styles.metricValue}>{customer.total_orders}</span>
                  <span className={styles.metricLabel}>Total Orders</span>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ backgroundColor: '#10b981' }}>
                  <FiTrendingUp />
                </div>
                <div className={styles.metricInfo}>
                  <span className={styles.metricValue}>{formatCurrency(customer.total_spent)}</span>
                  <span className={styles.metricLabel}>Total Spent</span>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ backgroundColor: '#f59e0b' }}>
                  <FiTrendingUp />
                </div>
                <div className={styles.metricInfo}>
                  <span className={styles.metricValue}>{formatCurrency(customer.average_order_value)}</span>
                  <span className={styles.metricLabel}>Avg Order Value</span>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ backgroundColor: '#8b5cf6' }}>
                  <FiStar />
                </div>
                <div className={styles.metricInfo}>
                  <span className={styles.metricValue}>{customer.loyalty_points}</span>
                  <span className={styles.metricLabel}>Loyalty Points</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visit Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiClock /> Visit Information
            </h3>
            <div className={styles.visitInfo}>
              <div className={styles.visitItem}>
                <span className={styles.visitLabel}>Last Visit:</span>
                <span className={styles.visitValue}>
                  {new Date(customer.last_visit).toLocaleDateString()}
                </span>
              </div>
              <div className={styles.visitItem}>
                <span className={styles.visitLabel}>Visit Frequency:</span>
                <span className={styles.visitValue}>
                  {getFrequencyText(customer.visit_frequency)}
                </span>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiHeart /> Preferences & Notes
            </h3>
            <div className={styles.preferencesGrid}>
              <div className={styles.preferenceItem}>
                <h4>Favorite Items</h4>
                <div className={styles.favoriteItems}>
                  {customer.favorite_items.length > 0 ? (
                    customer.favorite_items.map((item, index) => (
                      <span key={index} className={styles.favoriteItem}>
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className={styles.noData}>No favorite items recorded</span>
                  )}
                </div>
              </div>
              
              <div className={styles.preferenceItem}>
                <h4>Dietary Restrictions</h4>
                <div className={styles.restrictions}>
                  {customer.preferences.dietary_restrictions.length > 0 ? (
                    customer.preferences.dietary_restrictions.map((restriction, index) => (
                      <span key={index} className={styles.restriction}>
                        {restriction}
                      </span>
                    ))
                  ) : (
                    <span className={styles.noData}>No dietary restrictions</span>
                  )}
                </div>
              </div>
              
              <div className={styles.preferenceItem}>
                <h4>Preferred Table</h4>
                <p className={styles.preferenceValue}>
                  {customer.preferences.preferred_table || 'No preference specified'}
                </p>
              </div>
              
              <div className={styles.preferenceItem}>
                <h4>Special Occasions</h4>
                <div className={styles.occasions}>
                  {customer.preferences.special_occasions.length > 0 ? (
                    customer.preferences.special_occasions.map((occasion, index) => (
                      <span key={index} className={styles.occasion}>
                        <FiGift /> {occasion}
                      </span>
                    ))
                  ) : (
                    <span className={styles.noData}>No special occasions recorded</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiTag /> Quick Actions
            </h3>
            <div className={styles.actionButtons}>
              <button className={styles.actionButton}>
                <FiShoppingCart /> View Order History
              </button>
              <button className={styles.actionButton}>
                <FiGift /> Add Loyalty Points
              </button>
              <button className={styles.actionButton}>
                <FiMail /> Send Email
              </button>
              <button className={styles.actionButton}>
                <FiCalendar /> Make Reservation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
