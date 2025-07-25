// src/pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  FiSettings, FiSave, FiRefreshCw, FiUpload, FiDownload, FiMail,
  FiPhone, FiMapPin, FiClock, FiTrendingUp, FiShield, FiUsers,
  FiPrinter, FiWifi, FiDatabase, FiKey, FiGlobe, FiImage,
  FiToggleLeft, FiToggleRight, FiEdit, FiTrash2, FiPlus
} from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import styles from './Settings.module.css';

interface RestaurantSettings {
  // Basic Information
  name: string;
  description: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;

  // Operating Hours
  operating_hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };

  // Financial Settings
  currency: string;
  tax_rate: number;
  service_charge: number;
  payment_methods: string[];

  // System Settings
  timezone: string;
  language: string;
  date_format: string;
  time_format: string;

  // Notification Settings
  email_notifications: boolean;
  sms_notifications: boolean;
  order_notifications: boolean;
  reservation_notifications: boolean;

  // Security Settings
  session_timeout: number;
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_symbols: boolean;
  };

  // Integration Settings
  pos_integration: boolean;
  accounting_integration: boolean;
  inventory_integration: boolean;

  // Table Management
  table_count: number;
  max_party_size: number;
  reservation_advance_days: number;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<RestaurantSettings>({
    // Basic Information
    name: 'Smart Restaurant',
    description: 'A modern dining experience with exceptional cuisine and service',
    logo: '/logo.png',
    address: '123 Restaurant Street, Dar es Salaam, Tanzania',
    phone: '+255123456789',
    email: 'info@smartrestaurant.co.tz',
    website: 'https://smartrestaurant.co.tz',

    // Operating Hours
    operating_hours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '23:00', closed: false },
      saturday: { open: '09:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    },

    // Financial Settings
    currency: 'TZS',
    tax_rate: 18,
    service_charge: 10,
    payment_methods: ['cash', 'card', 'mobile_money', 'corporate'],

    // System Settings
    timezone: 'Africa/Dar_es_Salaam',
    language: 'en',
    date_format: 'DD/MM/YYYY',
    time_format: '24h',

    // Notification Settings
    email_notifications: true,
    sms_notifications: true,
    order_notifications: true,
    reservation_notifications: true,

    // Security Settings
    session_timeout: 30,
    password_policy: {
      min_length: 8,
      require_uppercase: true,
      require_lowercase: true,
      require_numbers: true,
      require_symbols: false
    },

    // Integration Settings
    pos_integration: false,
    accounting_integration: false,
    inventory_integration: false,

    // Table Management
    table_count: 25,
    max_party_size: 12,
    reservation_advance_days: 30
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'financial' | 'system' | 'notifications' | 'security' | 'integrations'>('general');
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof RestaurantSettings],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleOperatingHoursChange = (day: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: {
          ...prev.operating_hours[day as keyof typeof prev.operating_hours],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handlePaymentMethodToggle = (method: string) => {
    setSettings(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(method)
        ? prev.payment_methods.filter(m => m !== method)
        : [...prev.payment_methods, method]
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Save settings to localStorage for demo
      localStorage.setItem('restaurant_settings', JSON.stringify(settings));

      setHasChanges(false);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      window.location.reload();
    }
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

  const paymentMethods = [
    { key: 'cash', label: 'Cash', icon: FiTrendingUp },
    { key: 'card', label: 'Credit/Debit Card', icon: FiKey },
    { key: 'mobile_money', label: 'Mobile Money', icon: FiPhone },
    { key: 'corporate', label: 'Corporate Account', icon: FiUsers }
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Restaurant Settings</h1>
          <p className={styles.subtitle}>
            Configure your restaurant's operational settings and preferences
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.resetButton}
            onClick={handleReset}
            disabled={loading}
          >
            <FiRefreshCw /> Reset
          </button>
          <button
            className={`${styles.saveButton} ${hasChanges ? styles.hasChanges : ''}`}
            onClick={handleSave}
            disabled={loading || !hasChanges}
          >
            {loading ? <FiRefreshCw className={styles.spinning} /> : <FiSave />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tab} ${activeTab === 'general' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <FiSettings /> General
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'hours' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('hours')}
        >
          <FiClock /> Operating Hours
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'financial' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('financial')}
        >
          <FiTrendingUp /> Financial
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'system' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('system')}
        >
          <FiGlobe /> System
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'notifications' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <FiMail /> Notifications
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'security' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <FiShield /> Security
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'integrations' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          <FiDatabase /> Integrations
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>General Information</h2>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Restaurant Name</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={styles.input}
                  placeholder="Enter restaurant name"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={styles.input}
                  placeholder="+255123456789"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={styles.input}
                  placeholder="info@restaurant.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Website</label>
                <input
                  type="url"
                  value={settings.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={styles.input}
                  placeholder="https://restaurant.com"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                value={settings.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={styles.textarea}
                placeholder="Brief description of your restaurant"
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Address</label>
              <textarea
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={styles.textarea}
                placeholder="Full restaurant address"
                rows={2}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Restaurant Logo</label>
              <div className={styles.logoUpload}>
                <div className={styles.logoPreview}>
                  <FiImage size={48} />
                  <span>Current Logo</span>
                </div>
                <button className={styles.uploadButton}>
                  <FiUpload /> Upload New Logo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Operating Hours */}
        {activeTab === 'hours' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Operating Hours</h2>

            <div className={styles.hoursGrid}>
              {daysOfWeek.map(day => (
                <div key={day.key} className={styles.dayRow}>
                  <div className={styles.dayLabel}>
                    <span>{day.label}</span>
                    <label className={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        checked={!settings.operating_hours[day.key as keyof typeof settings.operating_hours].closed}
                        onChange={(e) => handleOperatingHoursChange(day.key, 'closed', !e.target.checked)}
                        className={styles.toggleInput}
                      />
                      <span className={styles.toggleSlider}>
                        {settings.operating_hours[day.key as keyof typeof settings.operating_hours].closed ?
                          <FiToggleLeft /> : <FiToggleRight />}
                      </span>
                      {settings.operating_hours[day.key as keyof typeof settings.operating_hours].closed ? 'Closed' : 'Open'}
                    </label>
                  </div>

                  {!settings.operating_hours[day.key as keyof typeof settings.operating_hours].closed && (
                    <div className={styles.timeInputs}>
                      <input
                        type="time"
                        value={settings.operating_hours[day.key as keyof typeof settings.operating_hours].open}
                        onChange={(e) => handleOperatingHoursChange(day.key, 'open', e.target.value)}
                        className={styles.timeInput}
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={settings.operating_hours[day.key as keyof typeof settings.operating_hours].close}
                        onChange={(e) => handleOperatingHoursChange(day.key, 'close', e.target.value)}
                        className={styles.timeInput}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial Settings */}
        {activeTab === 'financial' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Financial Settings</h2>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className={styles.select}
                >
                  <option value="TZS">Tanzanian Shilling (TZS)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="KES">Kenyan Shilling (KES)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tax Rate (%)</label>
                <input
                  type="number"
                  value={settings.tax_rate}
                  onChange={(e) => handleInputChange('tax_rate', Number(e.target.value))}
                  className={styles.input}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Service Charge (%)</label>
                <input
                  type="number"
                  value={settings.service_charge}
                  onChange={(e) => handleInputChange('service_charge', Number(e.target.value))}
                  className={styles.input}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Accepted Payment Methods</label>
              <div className={styles.paymentMethods}>
                {paymentMethods.map(method => (
                  <label key={method.key} className={styles.paymentMethod}>
                    <input
                      type="checkbox"
                      checked={settings.payment_methods.includes(method.key)}
                      onChange={() => handlePaymentMethodToggle(method.key)}
                      className={styles.checkbox}
                    />
                    <method.icon className={styles.paymentIcon} />
                    <span>{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>System Configuration</h2>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className={styles.select}
                >
                  <option value="Africa/Dar_es_Salaam">Africa/Dar es Salaam</option>
                  <option value="Africa/Nairobi">Africa/Nairobi</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New York</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className={styles.select}
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Date Format</label>
                <select
                  value={settings.date_format}
                  onChange={(e) => handleInputChange('date_format', e.target.value)}
                  className={styles.select}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Time Format</label>
                <select
                  value={settings.time_format}
                  onChange={(e) => handleInputChange('time_format', e.target.value)}
                  className={styles.select}
                >
                  <option value="24h">24 Hour</option>
                  <option value="12h">12 Hour (AM/PM)</option>
                </select>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Table Count</label>
                <input
                  type="number"
                  value={settings.table_count}
                  onChange={(e) => handleInputChange('table_count', Number(e.target.value))}
                  className={styles.input}
                  min="1"
                  max="200"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Max Party Size</label>
                <input
                  type="number"
                  value={settings.max_party_size}
                  onChange={(e) => handleInputChange('max_party_size', Number(e.target.value))}
                  className={styles.input}
                  min="1"
                  max="50"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Reservation Advance Days</label>
                <input
                  type="number"
                  value={settings.reservation_advance_days}
                  onChange={(e) => handleInputChange('reservation_advance_days', Number(e.target.value))}
                  className={styles.input}
                  min="1"
                  max="365"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Notification Settings</h2>

            <div className={styles.notificationSettings}>
              <div className={styles.notificationItem}>
                <div className={styles.notificationInfo}>
                  <FiMail className={styles.notificationIcon} />
                  <div>
                    <h4>Email Notifications</h4>
                    <p>Receive notifications via email</p>
                  </div>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={settings.email_notifications}
                    onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleSlider}>
                    {settings.email_notifications ? <FiToggleRight /> : <FiToggleLeft />}
                  </span>
                </label>
              </div>

              <div className={styles.notificationItem}>
                <div className={styles.notificationInfo}>
                  <FiPhone className={styles.notificationIcon} />
                  <div>
                    <h4>SMS Notifications</h4>
                    <p>Receive notifications via SMS</p>
                  </div>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={settings.sms_notifications}
                    onChange={(e) => handleInputChange('sms_notifications', e.target.checked)}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleSlider}>
                    {settings.sms_notifications ? <FiToggleRight /> : <FiToggleLeft />}
                  </span>
                </label>
              </div>

              <div className={styles.notificationItem}>
                <div className={styles.notificationInfo}>
                  <FiShield className={styles.notificationIcon} />
                  <div>
                    <h4>Order Notifications</h4>
                    <p>Get notified about new orders and updates</p>
                  </div>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={settings.order_notifications}
                    onChange={(e) => handleInputChange('order_notifications', e.target.checked)}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleSlider}>
                    {settings.order_notifications ? <FiToggleRight /> : <FiToggleLeft />}
                  </span>
                </label>
              </div>

              <div className={styles.notificationItem}>
                <div className={styles.notificationInfo}>
                  <FiClock className={styles.notificationIcon} />
                  <div>
                    <h4>Reservation Notifications</h4>
                    <p>Get notified about reservations and cancellations</p>
                  </div>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={settings.reservation_notifications}
                    onChange={(e) => handleInputChange('reservation_notifications', e.target.checked)}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleSlider}>
                    {settings.reservation_notifications ? <FiToggleRight /> : <FiToggleLeft />}
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Security Settings</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.session_timeout}
                onChange={(e) => handleInputChange('session_timeout', Number(e.target.value))}
                className={styles.input}
                min="5"
                max="480"
              />
              <span className={styles.helpText}>
                Users will be automatically logged out after this period of inactivity
              </span>
            </div>

            <div className={styles.passwordPolicy}>
              <h3>Password Policy</h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>Minimum Length</label>
                <input
                  type="number"
                  value={settings.password_policy.min_length}
                  onChange={(e) => handleNestedInputChange('password_policy', 'min_length', Number(e.target.value))}
                  className={styles.input}
                  min="4"
                  max="32"
                />
              </div>

              <div className={styles.policyOptions}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.password_policy.require_uppercase}
                    onChange={(e) => handleNestedInputChange('password_policy', 'require_uppercase', e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>Require uppercase letters</span>
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.password_policy.require_lowercase}
                    onChange={(e) => handleNestedInputChange('password_policy', 'require_lowercase', e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>Require lowercase letters</span>
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.password_policy.require_numbers}
                    onChange={(e) => handleNestedInputChange('password_policy', 'require_numbers', e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>Require numbers</span>
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.password_policy.require_symbols}
                    onChange={(e) => handleNestedInputChange('password_policy', 'require_symbols', e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>Require special symbols</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Integrations */}
        {activeTab === 'integrations' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>System Integrations</h2>

            <div className={styles.integrationSettings}>
              <div className={styles.integrationItem}>
                <div className={styles.integrationInfo}>
                  <FiPrinter className={styles.integrationIcon} />
                  <div>
                    <h4>POS Integration</h4>
                    <p>Connect with Point of Sale systems</p>
                  </div>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={settings.pos_integration}
                    onChange={(e) => handleInputChange('pos_integration', e.target.checked)}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleSlider}>
                    {settings.pos_integration ? <FiToggleRight /> : <FiToggleLeft />}
                  </span>
                </label>
              </div>

              <div className={styles.integrationItem}>
                <div className={styles.integrationInfo}>
                  <FiTrendingUp className={styles.integrationIcon} />
                  <div>
                    <h4>Accounting Integration</h4>
                    <p>Sync with accounting software</p>
                  </div>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={settings.accounting_integration}
                    onChange={(e) => handleInputChange('accounting_integration', e.target.checked)}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleSlider}>
                    {settings.accounting_integration ? <FiToggleRight /> : <FiToggleLeft />}
                  </span>
                </label>
              </div>

              <div className={styles.integrationItem}>
                <div className={styles.integrationInfo}>
                  <FiDatabase className={styles.integrationIcon} />
                  <div>
                    <h4>Inventory Integration</h4>
                    <p>Connect with inventory management systems</p>
                  </div>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={settings.inventory_integration}
                    onChange={(e) => handleInputChange('inventory_integration', e.target.checked)}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleSlider}>
                    {settings.inventory_integration ? <FiToggleRight /> : <FiToggleLeft />}
                  </span>
                </label>
              </div>
            </div>

            <div className={styles.backupSection}>
              <h3>Data Management</h3>
              <div className={styles.backupActions}>
                <button className={styles.backupButton}>
                  <FiDownload /> Export Data
                </button>
                <button className={styles.backupButton}>
                  <FiUpload /> Import Data
                </button>
                <button className={styles.backupButton}>
                  <FiDatabase /> Backup Database
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;