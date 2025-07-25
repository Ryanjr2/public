// src/components/CorporateBillingModal.tsx
import React, { useState, useEffect } from 'react';
import { FiX, FiBriefcase, FiUser, FiTrendingUp, FiSave, FiSearch } from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import { corporateService, type CorporateAccount, type CorporateEmployee } from '../services/corporateService';
import styles from './CorporateBillingModal.module.css';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  total_amount: number;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface CorporateBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSave: () => void;
}

const CorporateBillingModal: React.FC<CorporateBillingModalProps> = ({
  isOpen,
  onClose,
  order,
  onSave
}) => {
  const [step, setStep] = useState<'company' | 'employee' | 'confirm'>('company');
  const [companies, setCompanies] = useState<CorporateAccount[]>([]);
  const [employees, setEmployees] = useState<CorporateEmployee[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CorporateAccount | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<CorporateEmployee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCompanies();
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCompany) {
      loadEmployees();
    }
  }, [selectedCompany]);

  const loadCompanies = () => {
    const corporateAccounts = corporateService.getCorporateAccounts()
      .filter(account => account.status === 'active');
    setCompanies(corporateAccounts);
  };

  const loadEmployees = () => {
    if (selectedCompany) {
      const corporateEmployees = corporateService.getCorporateEmployees(selectedCompany.id)
        .filter(emp => emp.status === 'active');
      setEmployees(corporateEmployees);
    }
  };

  const resetForm = () => {
    setStep('company');
    setSelectedCompany(null);
    setSelectedEmployee(null);
    setSearchTerm('');
    setEmployeeSearchTerm('');
  };

  const handleCompanySelect = (company: CorporateAccount) => {
    setSelectedCompany(company);
    setStep('employee');
  };

  const handleEmployeeSelect = (employee: CorporateEmployee) => {
    setSelectedEmployee(employee);
    setStep('confirm');
  };

  const handleSaveBilling = async () => {
    if (!order || !selectedCompany || !selectedEmployee) return;

    setSaving(true);
    try {
      // Check credit limits
      const availableCredit = selectedCompany.creditLimit - selectedCompany.currentBalance;
      if (order.total_amount > availableCredit) {
        alert(`Insufficient credit limit. Available: ${formatCurrency(availableCredit)}`);
        setSaving(false);
        return;
      }

      // Check employee daily limit (simplified check)
      if (order.total_amount > selectedEmployee.dailyLimit) {
        alert(`Order exceeds employee daily limit: ${formatCurrency(selectedEmployee.dailyLimit)}`);
        setSaving(false);
        return;
      }

      // Create corporate order
      const corporateOrder = {
        orderNumber: order.order_number,
        corporateAccountId: selectedCompany.id,
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.fullName,
        department: selectedEmployee.department,
        items: order.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        subtotal: order.total_amount * 0.87, // Assuming 13% tax
        tax: order.total_amount * 0.13,
        serviceCharge: order.total_amount * 0.02,
        total: order.total_amount,
        orderDate: new Date().toISOString(),
        mealType: 'lunch' as const,
        notes: `Order ${order.order_number} - ${order.customer_name}`,
        status: 'completed' as const
      };

      corporateService.createCorporateOrder(corporateOrder);
      
      console.log('🏢 Corporate order created:', corporateOrder);
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save corporate billing:', error);
      alert('Failed to process corporate billing. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployees = employees.filter(employee =>
    employee.fullName.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  if (!isOpen || !order) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <FiBriefcase className={styles.headerIcon} />
            <div>
              <h2>Corporate Billing</h2>
              <p className={styles.orderInfo}>Order {order.order_number} - {formatCurrency(order.total_amount)}</p>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          {/* Step Indicator */}
          <div className={styles.stepIndicator}>
            <div className={`${styles.step} ${step === 'company' ? styles.active : step !== 'company' ? styles.completed : ''}`}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepLabel}>Select Company</span>
            </div>
            <div className={`${styles.step} ${step === 'employee' ? styles.active : step === 'confirm' ? styles.completed : ''}`}>
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepLabel}>Select Employee</span>
            </div>
            <div className={`${styles.step} ${step === 'confirm' ? styles.active : ''}`}>
              <span className={styles.stepNumber}>3</span>
              <span className={styles.stepLabel}>Confirm</span>
            </div>
          </div>

          {/* Step 1: Company Selection */}
          {step === 'company' && (
            <div className={styles.stepContent}>
              <h3>Select Corporate Account</h3>
              
              <div className={styles.searchBox}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.companyList}>
                {filteredCompanies.map((company) => (
                  <div
                    key={company.id}
                    className={styles.companyCard}
                    onClick={() => handleCompanySelect(company)}
                  >
                    <div className={styles.companyInfo}>
                      <h4 className={styles.companyName}>{company.companyName}</h4>
                      <p className={styles.contactPerson}>{company.contactPerson}</p>
                    </div>
                    <div className={styles.companyFinancials}>
                      <div className={styles.creditInfo}>
                        <span className={styles.label}>Available Credit:</span>
                        <span className={styles.value}>
                          {formatCurrency(company.creditLimit - company.currentBalance)}
                        </span>
                      </div>
                      <div className={styles.balanceInfo}>
                        <span className={styles.label}>Current Balance:</span>
                        <span className={styles.value}>
                          {formatCurrency(company.currentBalance)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCompanies.length === 0 && (
                <div className={styles.emptyState}>
                  <FiBriefcase size={48} />
                  <h4>No companies found</h4>
                  <p>No active corporate accounts match your search</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Employee Selection */}
          {step === 'employee' && selectedCompany && (
            <div className={styles.stepContent}>
              <div className={styles.stepHeader}>
                <button
                  className={styles.backButton}
                  onClick={() => setStep('company')}
                >
                  ← Back to Companies
                </button>
                <h3>Select Employee - {selectedCompany.companyName}</h3>
              </div>

              <div className={styles.searchBox}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.employeeList}>
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className={styles.employeeCard}
                    onClick={() => handleEmployeeSelect(employee)}
                  >
                    <div className={styles.employeeInfo}>
                      <h4 className={styles.employeeName}>{employee.fullName}</h4>
                      <p className={styles.employeeDetails}>
                        {employee.employeeId} • {employee.department} • {employee.position}
                      </p>
                    </div>
                    <div className={styles.employeeLimits}>
                      <div className={styles.limitInfo}>
                        <span className={styles.label}>Daily Limit:</span>
                        <span className={styles.value}>{formatCurrency(employee.dailyLimit)}</span>
                      </div>
                      <div className={styles.limitInfo}>
                        <span className={styles.label}>Monthly Limit:</span>
                        <span className={styles.value}>{formatCurrency(employee.monthlyLimit)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredEmployees.length === 0 && (
                <div className={styles.emptyState}>
                  <FiUser size={48} />
                  <h4>No employees found</h4>
                  <p>No active employees match your search</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && selectedCompany && selectedEmployee && (
            <div className={styles.stepContent}>
              <div className={styles.stepHeader}>
                <button
                  className={styles.backButton}
                  onClick={() => setStep('employee')}
                >
                  ← Back to Employees
                </button>
                <h3>Confirm Corporate Billing</h3>
              </div>

              <div className={styles.confirmationDetails}>
                <div className={styles.section}>
                  <h4>Order Details</h4>
                  <div className={styles.orderSummary}>
                    <div className={styles.summaryRow}>
                      <span>Order Number:</span>
                      <span>{order.order_number}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Customer:</span>
                      <span>{order.customer_name}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Total Amount:</span>
                      <span className={styles.amount}>{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <h4>Corporate Account</h4>
                  <div className={styles.accountSummary}>
                    <div className={styles.summaryRow}>
                      <span>Company:</span>
                      <span>{selectedCompany.companyName}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Employee:</span>
                      <span>{selectedEmployee.fullName} ({selectedEmployee.employeeId})</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Department:</span>
                      <span>{selectedEmployee.department}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <h4>Billing Summary</h4>
                  <div className={styles.billingSummary}>
                    <div className={styles.summaryRow}>
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.total_amount * 0.87)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Tax (13%):</span>
                      <span>{formatCurrency(order.total_amount * 0.13)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Service Charge (2%):</span>
                      <span>{formatCurrency(order.total_amount * 0.02)}</span>
                    </div>
                    <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                      <span>Total to Bill:</span>
                      <span>{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          {step === 'confirm' && (
            <button
              className={styles.saveButton}
              onClick={handleSaveBilling}
              disabled={saving}
            >
              <FiSave />
              {saving ? 'Processing...' : 'Bill to Corporate Account'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorporateBillingModal;
