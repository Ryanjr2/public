// src/components/StaffDetailsModal.tsx
import React from 'react';
import {
  FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield,
  FiTrendingUp, FiStar, FiClock, FiTarget, FiAward, FiKey,
  FiUsers, FiHeart
} from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import styles from './StaffDetailsModal.module.css';

interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  department: 'kitchen' | 'service' | 'management' | 'admin';
  role: 'admin' | 'manager' | 'chef' | 'server' | 'cashier' | 'cleaner';
  hire_date: string;
  salary: number;
  status: 'active' | 'inactive' | 'on_leave';
  permissions: string[];
  shift_schedule: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  performance: {
    rating: number;
    orders_handled: number;
    customer_feedback: number;
    punctuality: number;
  };
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface StaffDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
}

const StaffDetailsModal: React.FC<StaffDetailsModalProps> = ({
  isOpen,
  onClose,
  staff
}) => {
  if (!isOpen || !staff) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'on_leave': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'kitchen': return '#ef4444';
      case 'service': return '#3b82f6';
      case 'management': return '#8b5cf6';
      case 'admin': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatPermission = (permission: string) => {
    return permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return '#10b981';
    if (rating >= 4.0) return '#f59e0b';
    if (rating >= 3.5) return '#f97316';
    return '#ef4444';
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.staffHeader}>
            <div className={styles.staffAvatar}>
              <FiUser />
            </div>
            <div className={styles.staffInfo}>
              <h2>{staff.name}</h2>
              <p className={styles.staffPosition}>{staff.position}</p>
              <div className={styles.badges}>
                <span 
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(staff.status) }}
                >
                  {staff.status.replace('_', ' ')}
                </span>
                <span 
                  className={styles.departmentBadge}
                  style={{ backgroundColor: getDepartmentColor(staff.department) }}
                >
                  {staff.department}
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
                  <span className={styles.contactValue}>{staff.email}</span>
                </div>
              </div>
              <div className={styles.contactItem}>
                <FiPhone className={styles.contactIcon} />
                <div>
                  <span className={styles.contactLabel}>Phone</span>
                  <span className={styles.contactValue}>{staff.phone}</span>
                </div>
              </div>
              <div className={styles.contactItem}>
                <FiMapPin className={styles.contactIcon} />
                <div>
                  <span className={styles.contactLabel}>Address</span>
                  <span className={styles.contactValue}>{staff.address}</span>
                </div>
              </div>
              <div className={styles.contactItem}>
                <FiCalendar className={styles.contactIcon} />
                <div>
                  <span className={styles.contactLabel}>Hire Date</span>
                  <span className={styles.contactValue}>
                    {new Date(staff.hire_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiShield /> Job Information
            </h3>
            <div className={styles.jobGrid}>
              <div className={styles.jobItem}>
                <span className={styles.jobLabel}>Department:</span>
                <span className={styles.jobValue}>{staff.department}</span>
              </div>
              <div className={styles.jobItem}>
                <span className={styles.jobLabel}>Role:</span>
                <span className={styles.jobValue}>{staff.role}</span>
              </div>
              <div className={styles.jobItem}>
                <span className={styles.jobLabel}>Monthly Salary:</span>
                <span className={styles.jobValue}>{formatCurrency(staff.salary)}</span>
              </div>
              <div className={styles.jobItem}>
                <span className={styles.jobLabel}>Status:</span>
                <span className={styles.jobValue}>{staff.status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiTrendingUp /> Performance Metrics
            </h3>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ backgroundColor: getPerformanceColor(staff.performance.rating) }}>
                  <FiStar />
                </div>
                <div className={styles.metricInfo}>
                  <span className={styles.metricValue}>{staff.performance.rating}/5</span>
                  <span className={styles.metricLabel}>Overall Rating</span>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ backgroundColor: '#3b82f6' }}>
                  <FiTarget />
                </div>
                <div className={styles.metricInfo}>
                  <span className={styles.metricValue}>{staff.performance.orders_handled}</span>
                  <span className={styles.metricLabel}>Orders Handled</span>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ backgroundColor: '#10b981' }}>
                  <FiHeart />
                </div>
                <div className={styles.metricInfo}>
                  <span className={styles.metricValue}>{staff.performance.customer_feedback}/5</span>
                  <span className={styles.metricLabel}>Customer Feedback</span>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ backgroundColor: '#f59e0b' }}>
                  <FiClock />
                </div>
                <div className={styles.metricInfo}>
                  <span className={styles.metricValue}>{staff.performance.punctuality}%</span>
                  <span className={styles.metricLabel}>Punctuality</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiClock /> Weekly Schedule
            </h3>
            <div className={styles.scheduleGrid}>
              {daysOfWeek.map(day => (
                <div key={day.key} className={styles.scheduleItem}>
                  <span className={styles.dayLabel}>{day.label}</span>
                  <span className={styles.scheduleTime}>
                    {staff.shift_schedule[day.key as keyof typeof staff.shift_schedule]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiKey /> Permissions & Access
            </h3>
            <div className={styles.permissionsGrid}>
              {staff.permissions.map((permission, index) => (
                <span key={index} className={styles.permission}>
                  <FiShield /> {formatPermission(permission)}
                </span>
              ))}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiPhone /> Emergency Contact
            </h3>
            <div className={styles.emergencyContact}>
              <div className={styles.emergencyItem}>
                <span className={styles.emergencyLabel}>Name:</span>
                <span className={styles.emergencyValue}>{staff.emergency_contact.name}</span>
              </div>
              <div className={styles.emergencyItem}>
                <span className={styles.emergencyLabel}>Phone:</span>
                <span className={styles.emergencyValue}>{staff.emergency_contact.phone}</span>
              </div>
              <div className={styles.emergencyItem}>
                <span className={styles.emergencyLabel}>Relationship:</span>
                <span className={styles.emergencyValue}>{staff.emergency_contact.relationship}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiUsers /> Quick Actions
            </h3>
            <div className={styles.actionButtons}>
              <button className={styles.actionButton}>
                <FiClock /> Edit Schedule
              </button>
              <button className={styles.actionButton}>
                <FiTrendingUp /> Adjust Salary
              </button>
              <button className={styles.actionButton}>
                <FiKey /> Manage Permissions
              </button>
              <button className={styles.actionButton}>
                <FiAward /> Performance Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailsModal;
