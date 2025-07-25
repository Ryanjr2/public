// src/components/CorporateAccountModal.tsx
import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiBriefcase } from 'react-icons/fi';
import { corporateService, type CorporateAccount } from '../services/corporateService';
import styles from './CorporateAccountModal.module.css';

interface CorporateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: CorporateAccount | null;
  isEditing: boolean;
  onSave: () => void;
}

const CorporateAccountModal: React.FC<CorporateAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  isEditing,
  onSave
}) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    creditLimit: 1000000, // Default 1M TSh
    paymentTerms: 30,
    status: 'active' as const,
    contractStartDate: new Date().toISOString().split('T')[0],
    contractEndDate: '',
    billingAddress: '',
    accountManager: 'Admin User',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && account) {
        setFormData({
          companyName: account.companyName,
          contactPerson: account.contactPerson,
          email: account.email,
          phone: account.phone,
          address: account.address,
          taxId: account.taxId || '',
          creditLimit: account.creditLimit,
          paymentTerms: account.paymentTerms,
          status: account.status,
          contractStartDate: account.contractStartDate.split('T')[0],
          contractEndDate: account.contractEndDate ? account.contractEndDate.split('T')[0] : '',
          billingAddress: account.billingAddress,
          accountManager: account.accountManager,
          notes: account.notes || ''
        });
      } else {
        // Reset form for new account
        setFormData({
          companyName: '',
          contactPerson: '',
          email: '',
          phone: '',
          address: '',
          taxId: '',
          creditLimit: 1000000,
          paymentTerms: 30,
          status: 'active',
          contractStartDate: new Date().toISOString().split('T')[0],
          contractEndDate: '',
          billingAddress: '',
          accountManager: 'Admin User',
          notes: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditing, account]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.billingAddress.trim()) {
      newErrors.billingAddress = 'Billing address is required';
    }

    if (formData.creditLimit <= 0) {
      newErrors.creditLimit = 'Credit limit must be greater than zero';
    }

    if (formData.paymentTerms <= 0) {
      newErrors.paymentTerms = 'Payment terms must be greater than zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const accountData = {
        ...formData,
        contractStartDate: new Date(formData.contractStartDate).toISOString(),
        contractEndDate: formData.contractEndDate ? new Date(formData.contractEndDate).toISOString() : undefined,
        currentBalance: account?.currentBalance || 0
      };

      if (isEditing && account) {
        corporateService.updateCorporateAccount(account.id, accountData);
      } else {
        corporateService.createCorporateAccount(accountData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save corporate account:', error);
      alert('Failed to save account. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <FiBriefcase className={styles.headerIcon} />
            <h2>{isEditing ? 'Edit Corporate Account' : 'Create Corporate Account'}</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.formGrid}>
            {/* Company Information */}
            <div className={styles.section}>
              <h3>Company Information</h3>
              
              <div className={styles.formGroup}>
                <label>Company Name *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className={`${styles.input} ${errors.companyName ? styles.error : ''}`}
                  placeholder="Enter company name"
                />
                {errors.companyName && <span className={styles.errorText}>{errors.companyName}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Tax ID</label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  className={styles.input}
                  placeholder="TIN-123456789"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`${styles.textarea} ${errors.address ? styles.error : ''}`}
                  placeholder="Enter company address"
                  rows={3}
                />
                {errors.address && <span className={styles.errorText}>{errors.address}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Billing Address *</label>
                <textarea
                  value={formData.billingAddress}
                  onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                  className={`${styles.textarea} ${errors.billingAddress ? styles.error : ''}`}
                  placeholder="Enter billing address"
                  rows={3}
                />
                {errors.billingAddress && <span className={styles.errorText}>{errors.billingAddress}</span>}
              </div>
            </div>

            {/* Contact Information */}
            <div className={styles.section}>
              <h3>Contact Information</h3>
              
              <div className={styles.formGroup}>
                <label>Contact Person *</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  className={`${styles.input} ${errors.contactPerson ? styles.error : ''}`}
                  placeholder="Enter contact person name"
                />
                {errors.contactPerson && <span className={styles.errorText}>{errors.contactPerson}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`${styles.input} ${errors.email ? styles.error : ''}`}
                  placeholder="contact@company.com"
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
                  placeholder="+255 XX XXX XXXX"
                />
                {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Account Manager</label>
                <input
                  type="text"
                  value={formData.accountManager}
                  onChange={(e) => handleInputChange('accountManager', e.target.value)}
                  className={styles.input}
                  placeholder="Enter account manager name"
                />
              </div>
            </div>

            {/* Financial Terms */}
            <div className={styles.section}>
              <h3>Financial Terms</h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Credit Limit (TSh) *</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => handleInputChange('creditLimit', parseInt(e.target.value) || 0)}
                    className={`${styles.input} ${errors.creditLimit ? styles.error : ''}`}
                    placeholder="1000000"
                    min="0"
                  />
                  {errors.creditLimit && <span className={styles.errorText}>{errors.creditLimit}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>Payment Terms (Days) *</label>
                  <input
                    type="number"
                    value={formData.paymentTerms}
                    onChange={(e) => handleInputChange('paymentTerms', parseInt(e.target.value) || 0)}
                    className={`${styles.input} ${errors.paymentTerms ? styles.error : ''}`}
                    placeholder="30"
                    min="1"
                  />
                  {errors.paymentTerms && <span className={styles.errorText}>{errors.paymentTerms}</span>}
                </div>
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

            {/* Contract Information */}
            <div className={styles.section}>
              <h3>Contract Information</h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Contract Start Date *</label>
                  <input
                    type="date"
                    value={formData.contractStartDate}
                    onChange={(e) => handleInputChange('contractStartDate', e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Contract End Date</label>
                  <input
                    type="date"
                    value={formData.contractEndDate}
                    onChange={(e) => handleInputChange('contractEndDate', e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className={styles.textarea}
                  placeholder="Additional notes about this account..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button 
            className={styles.saveButton} 
            onClick={handleSave}
            disabled={saving}
          >
            <FiSave />
            {saving ? 'Saving...' : (isEditing ? 'Update Account' : 'Create Account')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorporateAccountModal;
