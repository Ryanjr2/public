// src/components/CorporateSummaryWidget.tsx
import React, { useState, useEffect } from 'react';
import { 
  FiBriefcase, FiUsers, FiTrendingUp, FiFileText,
  FiAlertTriangle, FiEye
} from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import { corporateService } from '../services/corporateService';
import styles from './CorporateSummaryWidget.module.css';

const CorporateSummaryWidget: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCorporateData();
  }, []);

  const loadCorporateData = () => {
    try {
      const corporateAnalytics = corporateService.getCorporateAnalytics();
      const accounts = corporateService.getCorporateAccounts();
      const invoices = corporateService.getCorporateInvoices();
      const notifications = corporateService.getNotifications();
      
      const pendingInvoices = invoices.filter(inv => ['sent', 'overdue'].includes(inv.status));
      const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
      const recentNotifications = notifications.slice(0, 3);
      
      setAnalytics({
        ...corporateAnalytics,
        pendingInvoices: pendingInvoices.length,
        overdueInvoices: overdueInvoices.length,
        totalOutstanding: pendingInvoices.reduce((sum, inv) => sum + inv.summary.total, 0),
        recentNotifications,
        topAccount: accounts.sort((a, b) => b.currentBalance - a.currentBalance)[0]
      });
    } catch (error) {
      console.error('Failed to load corporate data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.widget}>
        <div className={styles.loading}>Loading corporate data...</div>
      </div>
    );
  }

  if (!analytics || analytics.totalAccounts === 0) {
    return (
      <div className={styles.widget}>
        <div className={styles.header}>
          <h3>
            <FiBriefcase />
            Corporate Accounts
          </h3>
        </div>
        <div className={styles.emptyState}>
          <FiBriefcase size={32} />
          <p>No corporate accounts yet</p>
          <a href="/admin/corporate" className={styles.setupButton}>
            Set up Corporate Accounts
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h3>
          <FiBriefcase />
          Corporate Overview
        </h3>
        <a href="/admin/corporate" className={styles.viewAllLink}>
          <FiEye /> View All
        </a>
      </div>

      <div className={styles.content}>
        {/* Key Metrics */}
        <div className={styles.metricsRow}>
          <div className={styles.metric}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#3b82f6' }}>
              <FiBriefcase />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricValue}>{analytics.activeAccounts}</span>
              <span className={styles.metricLabel}>Active Accounts</span>
            </div>
          </div>

          <div className={styles.metric}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#10b981' }}>
              <FiTrendingUp />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricValue}>{formatCurrency(analytics.totalRevenue)}</span>
              <span className={styles.metricLabel}>Total Revenue</span>
            </div>
          </div>

          <div className={styles.metric}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#8b5cf6' }}>
              <FiUsers />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricValue}>{analytics.totalEmployees}</span>
              <span className={styles.metricLabel}>Employees</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {(analytics.overdueInvoices > 0 || analytics.pendingInvoices > 0) && (
          <div className={styles.alertsSection}>
            {analytics.overdueInvoices > 0 && (
              <div className={styles.alert} style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                <FiAlertTriangle style={{ color: '#dc2626' }} />
                <span>{analytics.overdueInvoices} overdue invoice(s)</span>
              </div>
            )}
            {analytics.pendingInvoices > 0 && (
              <div className={styles.alert} style={{ backgroundColor: '#fef3c7', borderColor: '#fbbf24' }}>
                <FiFileText style={{ color: '#d97706' }} />
                <span>{analytics.pendingInvoices} pending invoice(s)</span>
              </div>
            )}
          </div>
        )}

        {/* Outstanding Balance */}
        {analytics.totalOutstanding > 0 && (
          <div className={styles.outstandingSection}>
            <div className={styles.outstandingHeader}>
              <span className={styles.outstandingLabel}>Outstanding Balance</span>
              <span className={styles.outstandingAmount}>
                {formatCurrency(analytics.totalOutstanding)}
              </span>
            </div>
            <div className={styles.outstandingBar}>
              <div 
                className={styles.outstandingFill}
                style={{ 
                  width: `${Math.min((analytics.totalOutstanding / 10000000) * 100, 100)}%`,
                  backgroundColor: analytics.overdueInvoices > 0 ? '#dc2626' : '#f59e0b'
                }}
              />
            </div>
          </div>
        )}

        {/* Top Account */}
        {analytics.topAccount && (
          <div className={styles.topAccountSection}>
            <h4>Top Account</h4>
            <div className={styles.topAccount}>
              <div className={styles.accountInfo}>
                <span className={styles.accountName}>{analytics.topAccount.companyName}</span>
                <span className={styles.accountBalance}>
                  {formatCurrency(analytics.topAccount.currentBalance)} outstanding
                </span>
              </div>
              <div className={styles.accountTrend}>
                <FiTrendingUp style={{ color: '#10b981' }} />
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {analytics.recentNotifications.length > 0 && (
          <div className={styles.activitySection}>
            <h4>Recent Activity</h4>
            <div className={styles.activityList}>
              {analytics.recentNotifications.map((notification: any, index: number) => (
                <div key={index} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    {notification.type === 'invoice_sent' && <FiFileText />}
                    {notification.type === 'payment_reminder' && <FiAlertTriangle />}
                    {notification.type === 'limit_alert' && <FiAlertTriangle />}
                    {notification.type === 'usage_report' && <FiUsers />}
                  </div>
                  <div className={styles.activityInfo}>
                    <span className={styles.activityTitle}>{notification.title}</span>
                    <span className={styles.activityTime}>
                      {new Date(notification.sentAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <a href="/admin/corporate" className={styles.actionButton}>
            Manage Accounts
          </a>
          <a href="/admin/orders" className={styles.actionButton}>
            Process Orders
          </a>
        </div>
      </div>
    </div>
  );
};

export default CorporateSummaryWidget;
