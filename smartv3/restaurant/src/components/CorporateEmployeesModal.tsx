// src/components/CorporateEmployeesModal.tsx
import React, { useState, useEffect } from 'react';
import {
  FiX, FiPlus, FiEdit, FiTrash2, FiUser, FiMail, FiPhone,
  FiBriefcase, FiTrendingUp, FiSave, FiSearch, FiUsers, FiUpload
} from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import { corporateService, type CorporateAccount, type CorporateEmployee } from '../services/corporateService';
import CSVImportModal from './CSVImportModal';
import styles from './CorporateEmployeesModal.module.css';

interface CorporateEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: CorporateAccount;
}

const CorporateEmployeesModal: React.FC<CorporateEmployeesModalProps> = ({
  isOpen,
  onClose,
  account
}) => {
  const [employees, setEmployees] = useState<CorporateEmployee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<CorporateEmployee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<CorporateEmployee | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    dailyLimit: 50000,
    monthlyLimit: 1000000,
    status: 'active' as const
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen, account.id]);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm]);

  const loadEmployees = () => {
    const corporateEmployees = corporateService.getCorporateEmployees(account.id);
    setEmployees(corporateEmployees);
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      fullName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      dailyLimit: 50000,
      monthlyLimit: 1000000,
      status: 'active'
    });
    setErrors({});
    setEditingEmployee(null);
  };

  const handleAddEmployee = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleEditEmployee = (employee: CorporateEmployee) => {
    setFormData({
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      position: employee.position,
      dailyLimit: employee.dailyLimit,
      monthlyLimit: employee.monthlyLimit,
      status: employee.status
    });
    setEditingEmployee(employee);
    setShowAddForm(true);
  };

  const handleDeleteEmployee = (employee: CorporateEmployee) => {
    const hasOrders = corporateService.getCorporateOrders(account.id)
      .some(order => order.employeeId === employee.id);

    const message = hasOrders
      ? `${employee.fullName} has existing orders. This will deactivate the employee instead of deleting. Continue?`
      : `Are you sure you want to delete ${employee.fullName}? This action cannot be undone.`;

    if (confirm(message)) {
      const success = corporateService.deleteCorporateEmployee(employee.id);
      if (success) {
        loadEmployees();
        if (hasOrders) {
          alert(`${employee.fullName} has been deactivated due to existing orders.`);
        }
      } else {
        alert('Failed to delete employee. Please try again.');
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (formData.dailyLimit <= 0) {
      newErrors.dailyLimit = 'Daily limit must be greater than zero';
    }

    if (formData.monthlyLimit <= 0) {
      newErrors.monthlyLimit = 'Monthly limit must be greater than zero';
    }

    if (formData.dailyLimit * 30 > formData.monthlyLimit) {
      newErrors.monthlyLimit = 'Monthly limit should be reasonable compared to daily limit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEmployee = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const employeeData = {
        ...formData,
        corporateAccountId: account.id
      };

      if (editingEmployee) {
        // Update existing employee
        const updated = corporateService.updateCorporateEmployee(editingEmployee.id, employeeData);
        if (!updated) {
          throw new Error('Failed to update employee');
        }
      } else {
        // Create new employee
        corporateService.createCorporateEmployee(employeeData);
      }

      loadEmployees();
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save employee:', error);
      alert('Failed to save employee. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'suspended':
        return '#f59e0b';
      case 'inactive':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <FiUser className={styles.headerIcon} />
            <div>
              <h2>Corporate Employees</h2>
              <p className={styles.companyName}>{account.companyName}</p>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          {!showAddForm ? (
            <>
              {/* Employee List View */}
              <div className={styles.listHeader}>
                <div className={styles.searchBox}>
                  <FiSearch className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
                <div className={styles.headerActions}>
                  <button className={styles.importButton} onClick={() => setShowCSVImport(true)}>
                    <FiUpload /> Import CSV
                  </button>
                  <button className={styles.addButton} onClick={handleAddEmployee}>
                    <FiPlus /> Add Employee
                  </button>
                </div>
              </div>

              <div className={styles.employeesList}>
                {filteredEmployees.map((employee) => (
                  <div key={employee.id} className={styles.employeeCard}>
                    <div className={styles.employeeHeader}>
                      <div className={styles.employeeInfo}>
                        <h4 className={styles.employeeName}>{employee.fullName}</h4>
                        <span className={styles.employeeId}>ID: {employee.employeeId}</span>
                        <span
                          className={styles.status}
                          style={{ backgroundColor: getStatusColor(employee.status) }}
                        >
                          {employee.status}
                        </span>
                      </div>
                      <div className={styles.employeeActions}>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleEditEmployee(employee)}
                          title="Edit Employee"
                        >
                          <FiEdit />
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleDeleteEmployee(employee)}
                          title="Delete Employee"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    <div className={styles.employeeDetails}>
                      <div className={styles.contactInfo}>
                        <div className={styles.contactItem}>
                          <FiMail className={styles.contactIcon} />
                          <span>{employee.email}</span>
                        </div>
                        <div className={styles.contactItem}>
                          <FiPhone className={styles.contactIcon} />
                          <span>{employee.phone}</span>
                        </div>
                        <div className={styles.contactItem}>
                          <FiUsers className={styles.contactIcon} />
                          <span>{employee.department}</span>
                        </div>
                        <div className={styles.contactItem}>
                          <FiBriefcase className={styles.contactIcon} />
                          <span>{employee.position}</span>
                        </div>
                      </div>

                      <div className={styles.limitsInfo}>
                        <div className={styles.limitItem}>
                          <span className={styles.limitLabel}>Daily Limit:</span>
                          <span className={styles.limitValue}>{formatCurrency(employee.dailyLimit)}</span>
                        </div>
                        <div className={styles.limitItem}>
                          <span className={styles.limitLabel}>Monthly Limit:</span>
                          <span className={styles.limitValue}>{formatCurrency(employee.monthlyLimit)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredEmployees.length === 0 && (
                <div className={styles.emptyState}>
                  <FiUser size={48} />
                  <h3>No employees found</h3>
                  <p>No employees match your search criteria</p>
                  <button className={styles.addButton} onClick={handleAddEmployee}>
                    <FiPlus /> Add First Employee
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Add/Edit Employee Form */}
              <div className={styles.formHeader}>
                <h3>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
                <button
                  className={styles.backButton}
                  onClick={() => setShowAddForm(false)}
                >
                  ← Back to List
                </button>
              </div>

              <div className={styles.employeeForm}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Employee ID *</label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      className={`${styles.input} ${errors.employeeId ? styles.error : ''}`}
                      placeholder="EMP001"
                    />
                    {errors.employeeId && <span className={styles.errorText}>{errors.employeeId}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`${styles.input} ${errors.fullName ? styles.error : ''}`}
                      placeholder="John Doe"
                    />
                    {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`${styles.input} ${errors.email ? styles.error : ''}`}
                      placeholder="john.doe@company.com"
                    />
                    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`${styles.input} ${errors.phone ? styles.error : ''}`}
                      placeholder="+255 XXX XXX XXX"
                    />
                    {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Department *</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className={`${styles.input} ${errors.department ? styles.error : ''}`}
                      placeholder="Finance"
                    />
                    {errors.department && <span className={styles.errorText}>{errors.department}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Position *</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      className={`${styles.input} ${errors.position ? styles.error : ''}`}
                      placeholder="Senior Accountant"
                    />
                    {errors.position && <span className={styles.errorText}>{errors.position}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Daily Limit (TSh) *</label>
                    <input
                      type="number"
                      value={formData.dailyLimit}
                      onChange={(e) => handleInputChange('dailyLimit', parseInt(e.target.value) || 0)}
                      className={`${styles.input} ${errors.dailyLimit ? styles.error : ''}`}
                      placeholder="50000"
                      min="0"
                    />
                    {errors.dailyLimit && <span className={styles.errorText}>{errors.dailyLimit}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Monthly Limit (TSh) *</label>
                    <input
                      type="number"
                      value={formData.monthlyLimit}
                      onChange={(e) => handleInputChange('monthlyLimit', parseInt(e.target.value) || 0)}
                      className={`${styles.input} ${errors.monthlyLimit ? styles.error : ''}`}
                      placeholder="1000000"
                      min="0"
                    />
                    {errors.monthlyLimit && <span className={styles.errorText}>{errors.monthlyLimit}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className={styles.select}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    className={styles.cancelButton}
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.saveButton}
                    onClick={handleSaveEmployee}
                    disabled={saving}
                  >
                    <FiSave />
                    {saving ? 'Saving...' : (editingEmployee ? 'Update Employee' : 'Add Employee')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CSV Import Modal */}
        <CSVImportModal
          isOpen={showCSVImport}
          onClose={() => setShowCSVImport(false)}
          account={account}
          onImportComplete={() => {
            loadEmployees();
            setShowCSVImport(false);
          }}
        />
      </div>
    </div>
  );
};

export default CorporateEmployeesModal;
