// src/components/AnalyticsFilters.tsx
import React, { useState, useEffect } from 'react';
import {
  FiCalendar, FiFilter, FiX, FiChevronDown, FiRefreshCw,
  FiDownload, FiSettings, FiSearch, FiClock
} from 'react-icons/fi';
import styles from './AnalyticsFilters.module.css';

interface DateRange {
  start: Date;
  end: Date;
}

interface FilterOptions {
  dateRange: DateRange;
  timeRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  metrics: string[];
  categories: string[];
  orderStatus: string[];
  customerType: string[];
  paymentMethod: string[];
}

interface AnalyticsFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  onRefresh: () => void;
  onExport: (format: 'csv' | 'pdf' | 'excel') => void;
  loading?: boolean;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  onFiltersChange,
  onRefresh,
  onExport,
  loading = false
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      end: new Date()
    },
    timeRange: 'week',
    metrics: ['revenue', 'orders', 'customers'],
    categories: [],
    orderStatus: ['completed'],
    customerType: ['all'],
    paymentMethod: ['all']
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const timeRangeOptions = [
    { value: 'today', label: 'Today', icon: FiClock },
    { value: 'week', label: 'This Week', icon: FiCalendar },
    { value: 'month', label: 'This Month', icon: FiCalendar },
    { value: 'quarter', label: 'This Quarter', icon: FiCalendar },
    { value: 'year', label: 'This Year', icon: FiCalendar },
    { value: 'custom', label: 'Custom Range', icon: FiCalendar }
  ];

  const metricOptions = [
    { value: 'revenue', label: 'Revenue', color: '#10b981' },
    { value: 'orders', label: 'Orders', color: '#3b82f6' },
    { value: 'customers', label: 'Customers', color: '#8b5cf6' },
    { value: 'avgOrderValue', label: 'Avg Order Value', color: '#f59e0b' },
    { value: 'retention', label: 'Customer Retention', color: '#ef4444' },
    { value: 'satisfaction', label: 'Satisfaction Score', color: '#06b6d4' }
  ];

  const categoryOptions = [
    'Appetizers', 'Main Courses', 'Desserts', 'Beverages', 'Specials'
  ];

  const orderStatusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'pending', label: 'Pending' }
  ];

  const customerTypeOptions = [
    { value: 'all', label: 'All Customers' },
    { value: 'new', label: 'New Customers' },
    { value: 'returning', label: 'Returning Customers' },
    { value: 'vip', label: 'VIP Customers' },
    { value: 'corporate', label: 'Corporate Customers' }
  ];

  const paymentMethodOptions = [
    { value: 'all', label: 'All Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'mobile', label: 'Mobile Money' },
    { value: 'corporate', label: 'Corporate Account' }
  ];

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleTimeRangeChange = (timeRange: FilterOptions['timeRange']) => {
    let dateRange = filters.dateRange;

    if (timeRange !== 'custom') {
      const now = new Date();
      switch (timeRange) {
        case 'today':
          dateRange = { start: new Date(now.setHours(0, 0, 0, 0)), end: new Date() };
          break;
        case 'week':
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
          dateRange = { start: weekStart, end: new Date() };
          break;
        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          dateRange = { start: monthStart, end: new Date() };
          break;
        case 'quarter':
          const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          dateRange = { start: quarterStart, end: new Date() };
          break;
        case 'year':
          const yearStart = new Date(now.getFullYear(), 0, 1);
          dateRange = { start: yearStart, end: new Date() };
          break;
      }
    }

    setFilters(prev => ({ ...prev, timeRange, dateRange }));
  };

  const handleMetricToggle = (metric: string) => {
    setFilters(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metric)
        ? prev.metrics.filter(m => m !== metric)
        : [...prev.metrics, metric]
    }));
  };

  const handleArrayFilterChange = (
    filterKey: keyof FilterOptions,
    value: string,
    isMultiple: boolean = true
  ) => {
    setFilters(prev => {
      const currentArray = prev[filterKey] as string[];
      
      if (!isMultiple) {
        return { ...prev, [filterKey]: [value] };
      }

      return {
        ...prev,
        [filterKey]: currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };

  const clearFilters = () => {
    setFilters({
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      timeRange: 'week',
      metrics: ['revenue', 'orders', 'customers'],
      categories: [],
      orderStatus: ['completed'],
      customerType: ['all'],
      paymentMethod: ['all']
    });
    setSearchTerm('');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      {/* Main Filter Bar */}
      <div className={styles.mainFilters}>
        <div className={styles.leftSection}>
          {/* Time Range Selector */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Time Period</label>
            <div className={styles.timeRangeButtons}>
              {timeRangeOptions.map(option => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    className={`${styles.timeButton} ${
                      filters.timeRange === option.value ? styles.active : ''
                    }`}
                    onClick={() => handleTimeRangeChange(option.value as FilterOptions['timeRange'])}
                  >
                    <IconComponent className={styles.timeIcon} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Date Range */}
          {filters.timeRange === 'custom' && (
            <div className={styles.dateRangeGroup}>
              <div className={styles.dateInput}>
                <label>From</label>
                <input
                  type="date"
                  value={filters.dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: new Date(e.target.value) }
                  }))}
                  className={styles.dateField}
                />
              </div>
              <div className={styles.dateInput}>
                <label>To</label>
                <input
                  type="date"
                  value={filters.dateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: new Date(e.target.value) }
                  }))}
                  className={styles.dateField}
                />
              </div>
            </div>
          )}

          {/* Search */}
          <div className={styles.searchGroup}>
            <div className={styles.searchInput}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search metrics, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchField}
              />
            </div>
          </div>
        </div>

        <div className={styles.rightSection}>
          {/* Action Buttons */}
          <button
            className={styles.actionButton}
            onClick={() => setShowAdvanced(!showAdvanced)}
            title="Advanced Filters"
          >
            <FiFilter />
            Filters
            <FiChevronDown className={`${styles.chevron} ${showAdvanced ? styles.rotated : ''}`} />
          </button>

          <button
            className={`${styles.actionButton} ${loading ? styles.loading : ''}`}
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Data"
          >
            <FiRefreshCw className={loading ? styles.spinning : ''} />
            Refresh
          </button>

          <div className={styles.exportGroup}>
            <button
              className={styles.actionButton}
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Export Data"
            >
              <FiDownload />
              Export
            </button>
            {showExportMenu && (
              <div className={styles.exportMenu}>
                <button onClick={() => onExport('csv')}>Export as CSV</button>
                <button onClick={() => onExport('pdf')}>Export as PDF</button>
                <button onClick={() => onExport('excel')}>Export as Excel</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className={styles.advancedFilters}>
          <div className={styles.advancedHeader}>
            <h3>Advanced Filters</h3>
            <button className={styles.clearButton} onClick={clearFilters}>
              <FiX />
              Clear All
            </button>
          </div>

          <div className={styles.filterGrid}>
            {/* Metrics Selection */}
            <div className={styles.filterSection}>
              <h4>Metrics to Display</h4>
              <div className={styles.checkboxGrid}>
                {metricOptions.map(metric => (
                  <label key={metric.value} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={filters.metrics.includes(metric.value)}
                      onChange={() => handleMetricToggle(metric.value)}
                      className={styles.checkbox}
                    />
                    <span 
                      className={styles.checkboxIndicator}
                      style={{ backgroundColor: metric.color }}
                    />
                    {metric.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Order Status */}
            <div className={styles.filterSection}>
              <h4>Order Status</h4>
              <div className={styles.radioGroup}>
                {orderStatusOptions.map(option => (
                  <label key={option.value} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="orderStatus"
                      checked={filters.orderStatus.includes(option.value)}
                      onChange={() => handleArrayFilterChange('orderStatus', option.value, false)}
                      className={styles.radio}
                    />
                    <span className={styles.radioIndicator} />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Customer Type */}
            <div className={styles.filterSection}>
              <h4>Customer Type</h4>
              <div className={styles.radioGroup}>
                {customerTypeOptions.map(option => (
                  <label key={option.value} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="customerType"
                      checked={filters.customerType.includes(option.value)}
                      onChange={() => handleArrayFilterChange('customerType', option.value, false)}
                      className={styles.radio}
                    />
                    <span className={styles.radioIndicator} />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className={styles.filterSection}>
              <h4>Payment Method</h4>
              <div className={styles.radioGroup}>
                {paymentMethodOptions.map(option => (
                  <label key={option.value} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={filters.paymentMethod.includes(option.value)}
                      onChange={() => handleArrayFilterChange('paymentMethod', option.value, false)}
                      className={styles.radio}
                    />
                    <span className={styles.radioIndicator} />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      <div className={styles.activeFilters}>
        <span className={styles.activeLabel}>Active:</span>
        <span className={styles.activeItem}>
          {formatDate(filters.dateRange.start)} - {formatDate(filters.dateRange.end)}
        </span>
        <span className={styles.activeItem}>
          {filters.metrics.length} metrics
        </span>
        {filters.categories.length > 0 && (
          <span className={styles.activeItem}>
            {filters.categories.length} categories
          </span>
        )}
      </div>
    </div>
  );
};

export default AnalyticsFilters;
