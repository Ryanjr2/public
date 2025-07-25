// src/components/StaffModal.tsx
import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiShield, FiTrendingUp } from 'react-icons/fi';
import styles from './StaffModal.module.css';

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

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  isEditing: boolean;
  onSave: (staff: Staff) => void;
}

const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  staff,
  isEditing,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    position: '',
    department: 'service' as const,
    role: 'server' as const,
    salary: '',
    status: 'active' as const,
    permissions: [] as string[],
    emergency_name: '',
    emergency_phone: '',
    emergency_relationship: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availablePermissions = [
    'kitchen_access',
    'pos_access',
    'menu_management',
    'inventory_view',
    'customer_service',
    'order_management',
    'payment_processing',
    'staff_management',
    'financial_reports',
    'system_admin',
    'full_access'
  ];

  useEffect(() => {
    if (staff && isEditing) {
      setFormData({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        address: staff.address,
        position: staff.position,
        department: staff.department,
        role: staff.role,
        salary: staff.salary.toString(),
        status: staff.status,
        permissions: staff.permissions,
        emergency_name: staff.emergency_contact.name,
        emergency_phone: staff.emergency_contact.phone,
        emergency_relationship: staff.emergency_contact.relationship
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        position: '',
        department: 'service',
        role: 'server',
        salary: '',
        status: 'active',
        permissions: [],
        emergency_name: '',
        emergency_phone: '',
        emergency_relationship: ''
      });
    }
    setErrors({});
  }, [staff, isEditing, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Staff name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!formData.salary.trim()) {
      newErrors.salary = 'Salary is required';
    } else if (isNaN(Number(formData.salary)) || Number(formData.salary) <= 0) {
      newErrors.salary = 'Please enter a valid salary amount';
    }

    if (!formData.emergency_name.trim()) {
      newErrors.emergency_name = 'Emergency contact name is required';
    }

    if (!formData.emergency_phone.trim()) {
      newErrors.emergency_phone = 'Emergency contact phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const staffData: Staff = {
      id: staff?.id || Date.now(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      position: formData.position.trim(),
      department: formData.department,
      role: formData.role,
      hire_date: staff?.hire_date || new Date().toISOString().split('T')[0],
      salary: Number(formData.salary),
      status: formData.status,
      permissions: formData.permissions,
      shift_schedule: staff?.shift_schedule || {
        monday: '09:00-17:00',
        tuesday: '09:00-17:00',
        wednesday: '09:00-17:00',
        thursday: '09:00-17:00',
        friday: '09:00-17:00',
        saturday: 'OFF',
        sunday: 'OFF'
      },
      performance: staff?.performance || {
        rating: 4.0,
        orders_handled: 0,
        customer_feedback: 4.0,
        punctuality: 90
      },
      emergency_contact: {
        name: formData.emergency_name.trim(),
        phone: formData.emergency_phone.trim(),
        relationship: formData.emergency_relationship.trim()
      }
    };

    onSave(staffData);
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permission]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permission)
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
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
                <label className={styles.label}>Staff Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`${styles.input} ${errors.name ? styles.error : ''}`}
                  placeholder="Enter staff name"
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`${styles.input} ${errors.email ? styles.error : ''}`}
                  placeholder="staff@restaurant.com"
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number *</label>
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
                <label className={styles.label}>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={styles.textarea}
                  placeholder="Enter staff address"
                  rows={3}
                />
              </div>
            </div>

            {/* Job Information */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <FiShield /> Job Information
              </h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>Position *</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className={`${styles.input} ${errors.position ? styles.error : ''}`}
                  placeholder="e.g., Head Chef, Server, Manager"
                />
                {errors.position && <span className={styles.errorText}>{errors.position}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className={styles.select}
                >
                  <option value="kitchen">Kitchen</option>
                  <option value="service">Service</option>
                  <option value="management">Management</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className={styles.select}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="chef">Chef</option>
                  <option value="server">Server</option>
                  <option value="cashier">Cashier</option>
                  <option value="cleaner">Cleaner</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Monthly Salary (TZS) *</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  className={`${styles.input} ${errors.salary ? styles.error : ''}`}
                  placeholder="800000"
                  min="0"
                />
                {errors.salary && <span className={styles.errorText}>{errors.salary}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={styles.select}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiShield /> Permissions
            </h3>
            <div className={styles.permissionsGrid}>
              {availablePermissions.map(permission => (
                <label key={permission} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission)}
                    onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>
                    {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiPhone /> Emergency Contact
            </h3>
            <div className={styles.emergencyGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Contact Name *</label>
                <input
                  type="text"
                  value={formData.emergency_name}
                  onChange={(e) => handleInputChange('emergency_name', e.target.value)}
                  className={`${styles.input} ${errors.emergency_name ? styles.error : ''}`}
                  placeholder="Emergency contact name"
                />
                {errors.emergency_name && <span className={styles.errorText}>{errors.emergency_name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Contact Phone *</label>
                <input
                  type="tel"
                  value={formData.emergency_phone}
                  onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                  className={`${styles.input} ${errors.emergency_phone ? styles.error : ''}`}
                  placeholder="+255987654321"
                />
                {errors.emergency_phone && <span className={styles.errorText}>{errors.emergency_phone}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Relationship</label>
                <input
                  type="text"
                  value={formData.emergency_relationship}
                  onChange={(e) => handleInputChange('emergency_relationship', e.target.value)}
                  className={styles.input}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
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
              {isEditing ? 'Update Staff' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;
