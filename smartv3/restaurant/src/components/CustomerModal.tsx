// src/components/CustomerModal.tsx
import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiStar, FiHeart } from 'react-icons/fi';
import styles from './CustomerModal.module.css';

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

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  isEditing: boolean;
  onSave: (customer: Customer) => void;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
  isEditing,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active' as const,
    dietary_restrictions: '',
    preferred_table: '',
    special_occasions: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer && isEditing) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        status: customer.status,
        dietary_restrictions: customer.preferences.dietary_restrictions.join(', '),
        preferred_table: customer.preferences.preferred_table,
        special_occasions: customer.preferences.special_occasions.join(', ')
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'active',
        dietary_restrictions: '',
        preferred_table: '',
        special_occasions: ''
      });
    }
    setErrors({});
  }, [customer, isEditing, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const customerData: Customer = {
      id: customer?.id || Date.now(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      status: formData.status,
      date_joined: customer?.date_joined || new Date().toISOString().split('T')[0],
      last_visit: customer?.last_visit || new Date().toISOString().split('T')[0],
      total_orders: customer?.total_orders || 0,
      total_spent: customer?.total_spent || 0,
      average_order_value: customer?.average_order_value || 0,
      favorite_items: customer?.favorite_items || [],
      loyalty_points: customer?.loyalty_points || 0,
      preferences: {
        dietary_restrictions: formData.dietary_restrictions
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0),
        preferred_table: formData.preferred_table.trim(),
        special_occasions: formData.special_occasions
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0)
      },
      visit_frequency: customer?.visit_frequency || 'rare',
      customer_segment: customer?.customer_segment || 'new'
    };

    onSave(customerData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{isEditing ? 'Edit Customer' : 'Add New Customer'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Basic Information */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <FiUser /> Basic Information
              </h3>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`${styles.input} ${errors.name ? styles.error : ''}`}
                  placeholder="Enter customer name"
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`${styles.input} ${errors.email ? styles.error : ''}`}
                  placeholder="customer@email.com"
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`${styles.input} ${errors.phone ? styles.error : ''}`}
                  placeholder="+255123456789"
                />
                {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`${styles.textarea} ${errors.address ? styles.error : ''}`}
                  placeholder="Enter customer address"
                  rows={3}
                />
                {errors.address && <span className={styles.errorText}>{errors.address}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Customer Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={styles.select}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>

            {/* Preferences */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <FiHeart /> Preferences
              </h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Dietary Restrictions
                </label>
                <input
                  type="text"
                  value={formData.dietary_restrictions}
                  onChange={(e) => handleInputChange('dietary_restrictions', e.target.value)}
                  className={styles.input}
                  placeholder="Vegetarian, Gluten-free, etc. (comma separated)"
                />
                <span className={styles.helpText}>
                  Separate multiple restrictions with commas
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Preferred Table
                </label>
                <input
                  type="text"
                  value={formData.preferred_table}
                  onChange={(e) => handleInputChange('preferred_table', e.target.value)}
                  className={styles.input}
                  placeholder="Window seat, Quiet corner, etc."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Special Occasions
                </label>
                <input
                  type="text"
                  value={formData.special_occasions}
                  onChange={(e) => handleInputChange('special_occasions', e.target.value)}
                  className={styles.input}
                  placeholder="Birthday: March 15, Anniversary: June 20, etc."
                />
                <span className={styles.helpText}>
                  Format: Event: Date (comma separated)
                </span>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
            >
              {isEditing ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
