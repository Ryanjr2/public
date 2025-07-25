// src/components/ReservationModal.tsx
import React, { useState, useEffect } from 'react';
import {
  FiX, FiUser, FiPhone, FiMail, FiCalendar, FiClock,
  FiUsers, FiMapPin, FiAlertCircle, FiCheck
} from 'react-icons/fi';
// Define types locally for now
interface Table {
  id: number;
  number: string;
  capacity: number;
  location: 'indoor' | 'outdoor' | 'private' | 'bar';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  position: { x: number; y: number; };
  shape: 'round' | 'square' | 'rectangle';
  features: string[];
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  preferences: string[];
  special_occasions: string[];
  visit_count: number;
  last_visit?: string;
  notes?: string;
}

interface Reservation {
  id: number;
  reservation_number: string;
  customer: Customer;
  table: Table;
  date: string;
  time: string;
  duration: number;
  party_size: number;
  status: 'confirmed' | 'pending' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  special_requests?: string;
  occasion?: string;
  created_at: string;
  confirmed_at?: string;
  seated_at?: string;
  completed_at?: string;
  deposit_required?: boolean;
  deposit_amount?: number;
  deposit_paid?: boolean;
  assigned_staff?: string;
  notes?: string;
}
import styles from './ReservationModal.module.css';

interface ReservationFormData {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  date: string;
  time: string;
  party_size: number;
  duration: number;
  table_id: number;
  special_requests: string;
  occasion: string;
}

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reservationData: ReservationFormData) => void;
  reservation?: Reservation | null;
  tables: Table[];
}

const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  reservation,
  tables
}) => {
  const [formData, setFormData] = useState<ReservationFormData>({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    party_size: 2,
    duration: 120,
    table_id: 0,
    special_requests: '',
    occasion: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);

  useEffect(() => {
    if (reservation) {
      setFormData({
        customer_name: reservation.customer.name,
        customer_phone: reservation.customer.phone,
        customer_email: reservation.customer.email || '',
        date: reservation.date,
        time: reservation.time,
        party_size: reservation.party_size,
        duration: reservation.duration,
        table_id: reservation.table.id,
        special_requests: reservation.special_requests || '',
        occasion: reservation.occasion || ''
      });
    } else {
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        party_size: 2,
        duration: 120,
        table_id: 0,
        special_requests: '',
        occasion: ''
      });
    }
    setErrors({});
  }, [reservation, isOpen]);

  useEffect(() => {
    // Filter available tables based on party size and time
    const filtered = tables.filter(table => 
      table.capacity >= formData.party_size && 
      (table.status === 'available' || table.id === formData.table_id)
    );
    setAvailableTables(filtered);
    
    // Auto-select first available table if none selected
    if (formData.table_id === 0 && filtered.length > 0) {
      setFormData(prev => ({ ...prev, table_id: filtered[0].id }));
    }
  }, [formData.party_size, formData.date, formData.time, tables]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Phone number is required';
    } else if (!/^\+255\s?\d{9}$/.test(formData.customer_phone.replace(/\s/g, ''))) {
      newErrors.customer_phone = 'Please enter a valid Tanzanian phone number (+255...)';
    }

    if (formData.customer_email && !/\S+@\S+\.\S+/.test(formData.customer_email)) {
      newErrors.customer_email = 'Please enter a valid email address';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (new Date(formData.date) < new Date(new Date().toDateString())) {
      newErrors.date = 'Date cannot be in the past';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    if (formData.party_size < 1) {
      newErrors.party_size = 'Party size must be at least 1';
    } else if (formData.party_size > 20) {
      newErrors.party_size = 'Party size cannot exceed 20';
    }

    if (formData.table_id === 0) {
      newErrors.table_id = 'Please select a table';
    }

    if (formData.duration < 30) {
      newErrors.duration = 'Duration must be at least 30 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save reservation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ReservationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Auto-format Tanzanian phone numbers
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('255')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    } else if (cleaned.startsWith('0')) {
      return `+255 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
  };

  const occasionOptions = [
    { value: '', label: 'No special occasion' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'business', label: 'Business Meeting' },
    { value: 'date', label: 'Date Night' },
    { value: 'family', label: 'Family Gathering' },
    { value: 'celebration', label: 'Celebration' },
    { value: 'other', label: 'Other' }
  ];

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{reservation ? 'Edit Reservation' : 'New Reservation'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formContent}>
            {/* Customer Information */}
            <div className={styles.section}>
              <h3>Customer Information</h3>
              
              <div className={styles.formGroup}>
                <label htmlFor="customer_name">Customer Name *</label>
                <div className={styles.inputWithIcon}>
                  <FiUser className={styles.inputIcon} />
                  <input
                    id="customer_name"
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    className={errors.customer_name ? styles.error : ''}
                    placeholder="Enter customer name"
                  />
                </div>
                {errors.customer_name && <span className={styles.errorText}>{errors.customer_name}</span>}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="customer_phone">Phone Number *</label>
                  <div className={styles.inputWithIcon}>
                    <FiPhone className={styles.inputIcon} />
                    <input
                      id="customer_phone"
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) => handleInputChange('customer_phone', formatPhoneNumber(e.target.value))}
                      className={errors.customer_phone ? styles.error : ''}
                      placeholder="+255 712 345 678"
                    />
                  </div>
                  {errors.customer_phone && <span className={styles.errorText}>{errors.customer_phone}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="customer_email">Email (Optional)</label>
                  <div className={styles.inputWithIcon}>
                    <FiMail className={styles.inputIcon} />
                    <input
                      id="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => handleInputChange('customer_email', e.target.value)}
                      className={errors.customer_email ? styles.error : ''}
                      placeholder="customer@example.com"
                    />
                  </div>
                  {errors.customer_email && <span className={styles.errorText}>{errors.customer_email}</span>}
                </div>
              </div>
            </div>

            {/* Reservation Details */}
            <div className={styles.section}>
              <h3>Reservation Details</h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="date">Date *</label>
                  <div className={styles.inputWithIcon}>
                    <FiCalendar className={styles.inputIcon} />
                    <input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className={errors.date ? styles.error : ''}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  {errors.date && <span className={styles.errorText}>{errors.date}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="time">Time *</label>
                  <div className={styles.inputWithIcon}>
                    <FiClock className={styles.inputIcon} />
                    <select
                      id="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className={`${styles.select} ${errors.time ? styles.error : ''}`}
                    >
                      <option value="18:00">6:00 PM</option>
                      <option value="18:30">6:30 PM</option>
                      <option value="19:00">7:00 PM</option>
                      <option value="19:30">7:30 PM</option>
                      <option value="20:00">8:00 PM</option>
                      <option value="20:30">8:30 PM</option>
                      <option value="21:00">9:00 PM</option>
                      <option value="21:30">9:30 PM</option>
                    </select>
                  </div>
                  {errors.time && <span className={styles.errorText}>{errors.time}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="party_size">Party Size *</label>
                  <div className={styles.inputWithIcon}>
                    <FiUsers className={styles.inputIcon} />
                    <input
                      id="party_size"
                      type="number"
                      value={formData.party_size}
                      onChange={(e) => handleInputChange('party_size', parseInt(e.target.value) || 1)}
                      className={errors.party_size ? styles.error : ''}
                      min="1"
                      max="20"
                    />
                  </div>
                  {errors.party_size && <span className={styles.errorText}>{errors.party_size}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="duration">Duration (minutes) *</label>
                  <div className={styles.inputWithIcon}>
                    <FiClock className={styles.inputIcon} />
                    <select
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                      className={`${styles.select} ${errors.duration ? styles.error : ''}`}
                    >
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                      <option value="150">2.5 hours</option>
                      <option value="180">3 hours</option>
                    </select>
                  </div>
                  {errors.duration && <span className={styles.errorText}>{errors.duration}</span>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="table_id">Table *</label>
                <div className={styles.inputWithIcon}>
                  <FiMapPin className={styles.inputIcon} />
                  <select
                    id="table_id"
                    value={formData.table_id}
                    onChange={(e) => handleInputChange('table_id', parseInt(e.target.value))}
                    className={`${styles.select} ${errors.table_id ? styles.error : ''}`}
                  >
                    <option value="0">Select a table</option>
                    {availableTables.map(table => (
                      <option key={table.id} value={table.id}>
                        Table {table.number} - {table.capacity} seats ({table.location})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.table_id && <span className={styles.errorText}>{errors.table_id}</span>}
                {availableTables.length === 0 && (
                  <div className={styles.warningText}>
                    <FiAlertCircle />
                    No tables available for this party size and time
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className={styles.section}>
              <h3>Additional Information</h3>
              
              <div className={styles.formGroup}>
                <label htmlFor="occasion">Occasion</label>
                <select
                  id="occasion"
                  value={formData.occasion}
                  onChange={(e) => handleInputChange('occasion', e.target.value)}
                  className={styles.select}
                >
                  {occasionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="special_requests">Special Requests</label>
                <textarea
                  id="special_requests"
                  value={formData.special_requests}
                  onChange={(e) => handleInputChange('special_requests', e.target.value)}
                  className={styles.textarea}
                  placeholder="Any special requests or dietary requirements..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSubmitting || availableTables.length === 0}
            >
              {isSubmitting ? 'Saving...' : (
                <>
                  <FiCheck />
                  {reservation ? 'Update Reservation' : 'Create Reservation'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;
