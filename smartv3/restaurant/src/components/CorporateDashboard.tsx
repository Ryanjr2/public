// src/components/CorporateDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  FiTrendingUp, FiTrendingDown, FiMinus, FiUsers, FiBarChart,
  FiFileText, FiAlertTriangle, FiCalendar, FiBarChart2, FiPieChart
} from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import { corporateService, type CorporateAccount } from '../services/corporateService';
import styles from './CorporateDashboard.module.css';

interface CorporateDashboardProps {
  account: CorporateAccount;
}

const CorporateDashboard: React.FC<CorporateDashboardProps> = ({ account }) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadDashboardData();
  }, [account.id, selectedPeriod]);

  const loadDashboardData = () => {
    setLoading(true);
    try {
      const accountSummary = corporateService.getCorporateAccountSummary(account.id);
      setSummary(accountSummary);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <FiTrendingUp className={styles.trendUp} />;
      case 'decreasing':
        return <FiTrendingDown className={styles.trendDown} />;
      default:
        return <FiMinus className={styles.trendStable} />;
    }
  };

  const getCreditStatusColor = (percentage: number) => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 70) return '#f59e0b';
    return '#10b981';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Failed to load dashboard data</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{account.companyName}</h2>
          <p className={styles.subtitle}>Corporate Account Dashboard</p>
        </div>
        <div className={styles.periodSelector}>
          <button
            className={`${styles.periodButton} ${selectedPeriod === 'week' ? styles.active : ''}`}
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </button>
          <button
            className={`${styles.periodButton} ${selectedPeriod === 'month' ? styles.active : ''}`}
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </button>
          <button
            className={`${styles.periodButton} ${selectedPeriod === 'quarter' ? styles.active : ''}`}
            onClick={() => setSelectedPeriod('quarter')}
          >
            Quarter
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: '#3b82f6' }}>
            <FiUsers />
          </div>
          <div className={styles.metricInfo}>
            <h3>Active Employees</h3>
            <p className={styles.metricValue}>{summary.employees.active}</p>
            <span className={styles.metricLabel}>of {summary.employees.total} total</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: '#10b981' }}>
            <FiBarChart />
          </div>
          <div className={styles.metricInfo}>
            <h3>Monthly Spending</h3>
            <p className={styles.metricValue}>{formatCurrency(summary.spending.currentMonth)}</p>
            <span className={styles.metricLabel}>
              {summary.spending.monthlyOrders} orders this month
            </span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: '#8b5cf6' }}>
            <FiBarChart2 />
          </div>
          <div className={styles.metricInfo}>
            <h3>Average Order</h3>
            <p className={styles.metricValue}>{formatCurrency(summary.spending.averageOrderValue)}</p>
            <span className={styles.metricLabel}>per transaction</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: '#f59e0b' }}>
            <FiFileText />
          </div>
          <div className={styles.metricInfo}>
            <h3>Outstanding</h3>
            <p className={styles.metricValue}>{formatCurrency(summary.invoices.totalOutstanding)}</p>
            <span className={styles.metricLabel}>
              {summary.invoices.pending + summary.invoices.overdue} invoices
            </span>
          </div>
        </div>
      </div>

      {/* Credit Status */}
      <div className={styles.creditStatus}>
        <div className={styles.creditHeader}>
          <h3>Credit Utilization</h3>
          <span className={styles.creditPercentage}>
            {summary.creditStatus.utilizationPercentage.toFixed(1)}%
          </span>
        </div>
        <div className={styles.creditBar}>
          <div
            className={styles.creditFill}
            style={{
              width: `${Math.min(summary.creditStatus.utilizationPercentage, 100)}%`,
              backgroundColor: getCreditStatusColor(summary.creditStatus.utilizationPercentage)
            }}
          />
        </div>
        <div className={styles.creditDetails}>
          <div className={styles.creditItem}>
            <span>Used:</span>
            <span>{formatCurrency(summary.creditStatus.used)}</span>
          </div>
          <div className={styles.creditItem}>
            <span>Available:</span>
            <span>{formatCurrency(summary.creditStatus.available)}</span>
          </div>
          <div className={styles.creditItem}>
            <span>Limit:</span>
            <span>{formatCurrency(summary.creditStatus.limit)}</span>
          </div>
        </div>
      </div>

      {/* Department Analytics */}
      {summary.departmentAnalytics && summary.departmentAnalytics.length > 0 && (
        <div className={styles.departmentSection}>
          <h3>Department Spending</h3>
          <div className={styles.departmentGrid}>
            {summary.departmentAnalytics.slice(0, 4).map((dept: any, index: number) => (
              <div key={index} className={styles.departmentCard}>
                <div className={styles.departmentHeader}>
                  <h4>{dept.department}</h4>
                  {getTrendIcon(dept.spendingTrend)}
                </div>
                <div className={styles.departmentMetrics}>
                  <div className={styles.departmentMetric}>
                    <span className={styles.metricLabel}>Total Spent</span>
                    <span className={styles.metricValue}>{formatCurrency(dept.totalSpent)}</span>
                  </div>
                  <div className={styles.departmentMetric}>
                    <span className={styles.metricLabel}>Employees</span>
                    <span className={styles.metricValue}>{dept.employeeCount}</span>
                  </div>
                  <div className={styles.departmentMetric}>
                    <span className={styles.metricLabel}>Avg/Employee</span>
                    <span className={styles.metricValue}>{formatCurrency(dept.averagePerEmployee)}</span>
                  </div>
                  <div className={styles.departmentMetric}>
                    <span className={styles.metricLabel}>Orders</span>
                    <span className={styles.metricValue}>{dept.totalOrders}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice Status */}
      <div className={styles.invoiceSection}>
        <h3>Invoice Status</h3>
        <div className={styles.invoiceGrid}>
          <div className={styles.invoiceCard}>
            <div className={styles.invoiceIcon} style={{ backgroundColor: '#10b981' }}>
              <FiFileText />
            </div>
            <div className={styles.invoiceInfo}>
              <span className={styles.invoiceCount}>{summary.invoices.paid}</span>
              <span className={styles.invoiceLabel}>Paid</span>
            </div>
          </div>

          <div className={styles.invoiceCard}>
            <div className={styles.invoiceIcon} style={{ backgroundColor: '#f59e0b' }}>
              <FiCalendar />
            </div>
            <div className={styles.invoiceInfo}>
              <span className={styles.invoiceCount}>{summary.invoices.pending}</span>
              <span className={styles.invoiceLabel}>Pending</span>
            </div>
          </div>

          <div className={styles.invoiceCard}>
            <div className={styles.invoiceIcon} style={{ backgroundColor: '#ef4444' }}>
              <FiAlertTriangle />
            </div>
            <div className={styles.invoiceInfo}>
              <span className={styles.invoiceCount}>{summary.invoices.overdue}</span>
              <span className={styles.invoiceLabel}>Overdue</span>
            </div>
          </div>

          <div className={styles.invoiceCard}>
            <div className={styles.invoiceIcon} style={{ backgroundColor: '#6b7280' }}>
              <FiPieChart />
            </div>
            <div className={styles.invoiceInfo}>
              <span className={styles.invoiceCount}>{summary.invoices.total}</span>
              <span className={styles.invoiceLabel}>Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.activitySection}>
        <h3>Recent Activity</h3>
        <div className={styles.activityList}>
          {summary.recentActivity.slice(0, 5).map((order: any, index: number) => (
            <div key={index} className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <FiBarChart />
              </div>
              <div className={styles.activityInfo}>
                <span className={styles.activityTitle}>
                  {order.employeeName} - {order.department}
                </span>
                <span className={styles.activityDescription}>
                  Order #{order.orderNumber} • {formatCurrency(order.total)}
                </span>
              </div>
              <div className={styles.activityTime}>
                {new Date(order.orderDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CorporateDashboard;
