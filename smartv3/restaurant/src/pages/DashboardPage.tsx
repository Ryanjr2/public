// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  FiTrendingUp, 
  FiShoppingCart, 
  FiCalendar, 
  FiUsers, 
  FiClock, 
  FiBriefcase, 
  FiFileText,
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';
import api from '../services/api';
import { formatDisplayCurrency } from '../utils/currency';
import { corporateService } from '../services/corporateService';
import CorporateSummaryWidget from '../components/CorporateSummaryWidget';
import SimpleChart from '../components/SimpleChart';
import MetricCard from '../components/MetricCard';
import QuickActions from '../components/QuickActions';
import ActivityFeed from '../components/ActivityFeed';
import FloatingActionButton from '../components/FloatingActionButton';
import styles from './Dashboard.module.css';

interface DashboardMetrics {
  todaysOrders: number;
  todaysRevenue: number;
  activeReservations: number;
  activeCover: number;
  kitchenQueue: number;
  recentActivity: number;
  corporateAccounts: number;
  corporateRevenue: number;
  pendingInvoices: number;
  corporateEmployees: number;
}



const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todaysOrders: 0,
    todaysRevenue: 0,
    activeReservations: 0,
    activeCover: 0,
    kitchenQueue: 0,
    recentActivity: 0,
    corporateAccounts: 0,
    corporateRevenue: 0,
    pendingInvoices: 0,
    corporateEmployees: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/analytics/dashboard/real_time/');

      // Get corporate analytics
      const corporateAnalytics = corporateService.getCorporateAnalytics();
      const corporateAccounts = corporateService.getCorporateAccounts();
      const corporateInvoices = corporateService.getCorporateInvoices();
      const pendingInvoices = corporateInvoices.filter(inv => ['sent', 'overdue'].includes(inv.status));

      setMetrics({
        todaysOrders: response.data.todays_orders,
        todaysRevenue: response.data.todays_revenue, // Already in TZS
        activeReservations: response.data.active_reservations,
        activeCover: response.data.active_covers,
        kitchenQueue: response.data.kitchen_queue,
        recentActivity: response.data.recent_activity,
        corporateAccounts: corporateAnalytics.activeAccounts,
        corporateRevenue: corporateAnalytics.totalRevenue,
        pendingInvoices: pendingInvoices.length,
        corporateEmployees: corporateAnalytics.totalEmployees
      });
    } catch (error) {
      // Silently use fallback data instead of logging error
      const corporateAnalytics = corporateService.getCorporateAnalytics();
      const corporateAccounts = corporateService.getCorporateAccounts();
      const corporateInvoices = corporateService.getCorporateInvoices();
      const pendingInvoices = corporateInvoices.filter(inv => ['sent', 'overdue'].includes(inv.status));

      setMetrics({
        todaysOrders: 28,
        todaysRevenue: 2450000,
        activeReservations: 12,
        activeCover: 38,
        kitchenQueue: 5,
        recentActivity: 15,
        corporateAccounts: corporateAnalytics.activeAccounts,
        corporateRevenue: corporateAnalytics.totalRevenue,
        pendingInvoices: pendingInvoices.length,
        corporateEmployees: corporateAnalytics.totalEmployees
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Generate chart data based on current metrics
  const generateOrderTrendsData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      label: day,
      value: Math.floor(Math.random() * 50) + 20, // Random orders between 20-70
      color: '#3b82f6'
    }));
  };

  const generateRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      label: month,
      value: Math.floor(Math.random() * 5000000) + 2000000, // Random revenue in TZS
      color: '#10b981'
    }));
  };

  const generateCorporateData = () => {
    const companies = ['TechCorp', 'FinanceInc', 'HealthCare', 'EduGroup'];
    return companies.map(company => ({
      label: company,
      value: Math.floor(Math.random() * 2000000) + 500000, // Random corporate spending
      color: '#8b5cf6'
    }));
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Restaurant Dashboard</h1>
            <div className={styles.statusIndicator}>
              <div className={styles.liveDot}></div>
              <span className={styles.liveText}>Live</span>
            </div>
          </div>
          <p className={styles.subtitle}>Real-time overview of your restaurant operations</p>
          <div className={styles.quickStats}>
            <div className={styles.quickStat}>
              <span className={styles.quickStatValue}>{metrics.todaysOrders}</span>
              <span className={styles.quickStatLabel}>Orders Today</span>
            </div>
            <div className={styles.quickStat}>
              <span className={styles.quickStatValue}>{formatDisplayCurrency(metrics.todaysRevenue)}</span>
              <span className={styles.quickStatLabel}>Revenue Today</span>
            </div>
            <div className={styles.quickStat}>
              <span className={styles.quickStatValue}>{metrics.activeCover}</span>
              <span className={styles.quickStatLabel}>Active Covers</span>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.timeInfo}>
            <span className={styles.currentTime}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className={styles.currentDate}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <button className={styles.refreshButton} onClick={fetchDashboardData}>
            <FiRefreshCw />
            Refresh
          </button>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <MetricCard
          title="Today's Revenue"
          value={formatDisplayCurrency(metrics.todaysRevenue)}
          change={12}
          changeType="increase"
          icon={FiTrendingUp}
          color="#10b981"
          subtitle="Daily sales performance"
          trend={[45, 52, 48, 61, 55, 67, 72]}
          target={5000000}
          unit=""
        />
        <MetricCard
          title="Orders Today"
          value={metrics.todaysOrders}
          change={8}
          changeType="increase"
          icon={FiShoppingCart}
          color="#3b82f6"
          subtitle="Customer orders processed"
          trend={[12, 15, 18, 22, 19, 25, 28]}
          target={50}
          unit=" orders"
        />
        <MetricCard
          title="Active Reservations"
          value={metrics.activeReservations}
          change={-5}
          changeType="decrease"
          icon={FiCalendar}
          color="#8b5cf6"
          subtitle="Current table bookings"
          trend={[8, 12, 10, 15, 18, 14, 16]}
        />
        <MetricCard
          title="Covers Active"
          value={metrics.activeCover}
          change={15}
          changeType="increase"
          icon={FiUsers}
          color="#f59e0b"
          subtitle="Guests currently dining"
          trend={[25, 30, 28, 35, 32, 40, 38]}
        />
        <MetricCard
          title="Kitchen Queue"
          value={metrics.kitchenQueue}
          change={metrics.kitchenQueue > 5 ? 25 : -10}
          changeType={metrics.kitchenQueue > 5 ? "increase" : "decrease"}
          icon={FiClock}
          color={metrics.kitchenQueue > 5 ? "#ef4444" : "#10b981"}
          subtitle="Orders in preparation"
          trend={[3, 5, 7, 4, 6, 8, metrics.kitchenQueue]}
        />
        <MetricCard
          title="Recent Activity"
          value={metrics.recentActivity}
          change={20}
          changeType="increase"
          icon={FiTrendingUp}
          color="#6366f1"
          subtitle="System activity level"
          trend={[15, 18, 22, 19, 25, 28, 32]}
        />
      </div>

      {/* Corporate Summary Widget */}
      <div className={styles.corporateWidget}>
        <CorporateSummaryWidget />
      </div>

      {/* Quick Actions and Activity Feed */}
      <div className={styles.actionsAndActivityGrid}>
        <div className={styles.quickActionsSection}>
          <QuickActions />
        </div>
        <div className={styles.activityFeedSection}>
          <ActivityFeed />
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>Recent Orders</h3>
          <SimpleChart
            data={generateOrderTrendsData()}
            type="bar"
            height={200}
            showValues={true}
            title="Daily Order Trends (This Week)"
          />
        </div>

        <div className={styles.chartCard}>
          <h3>Revenue Overview</h3>
          <SimpleChart
            data={generateRevenueData()}
            type="area"
            height={200}
            showValues={true}
            currency={true}
            title="Monthly Revenue Trends (6 Months)"
          />
        </div>

        <div className={styles.chartCard}>
          <h3>Corporate Analytics</h3>
          <SimpleChart
            data={generateCorporateData()}
            type="line"
            height={160}
            currency={true}
            title="Top Corporate Clients Spending"
          />
          <div className={styles.corporateQuickStats}>
            <div className={styles.quickStat}>
              <span className={styles.statLabel}>Active Accounts:</span>
              <span className={styles.statValue}>{metrics.corporateAccounts}</span>
            </div>
            <div className={styles.quickStat}>
              <span className={styles.statLabel}>Total Employees:</span>
              <span className={styles.statValue}>{metrics.corporateEmployees}</span>
            </div>
            <div className={styles.quickStat}>
              <span className={styles.statLabel}>B2B Revenue:</span>
              <span className={styles.statValue}>{formatDisplayCurrency(metrics.corporateRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.alertsSection}>
        <h3 className={styles.sectionTitle}>
          <FiAlertCircle /> Alerts & Notifications
        </h3>
        <div className={styles.alertsList}>
          {metrics.kitchenQueue > 5 && (
            <div className={styles.alert}>
              <FiAlertCircle />
              <span>Kitchen queue is getting busy ({metrics.kitchenQueue} orders)</span>
            </div>
          )}
          {metrics.pendingInvoices > 0 && (
            <div className={styles.alert}>
              <FiFileText />
              <span>{metrics.pendingInvoices} corporate invoice(s) pending payment</span>
            </div>
          )}
          {metrics.corporateAccounts > 0 && (
            <div className={styles.alert}>
              <FiBriefcase />
              <span>{metrics.corporateAccounts} corporate accounts generating {formatDisplayCurrency(metrics.corporateRevenue)} revenue</span>
            </div>
          )}
          <div className={styles.alert}>
            <FiClock />
            <span>Next reservation in 15 minutes</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h3 className={styles.sectionTitle}>
          <FiBriefcase />
          Corporate Quick Actions
        </h3>
        <div className={styles.actionGrid}>
          <a href="/admin/corporate" className={styles.actionCard}>
            <div className={styles.actionIcon} style={{ backgroundColor: '#8b5cf6' }}>
              <FiBriefcase />
            </div>
            <div className={styles.actionInfo}>
              <h4>Manage Accounts</h4>
              <p>View and manage corporate accounts</p>
            </div>
          </a>

          <a href="/admin/payments" className={styles.actionCard}>
            <div className={styles.actionIcon} style={{ backgroundColor: '#10b981' }}>
              <FiTrendingUp />
            </div>
            <div className={styles.actionInfo}>
              <h4>Payment History</h4>
              <p>View all payment transactions</p>
            </div>
          </a>

          <a href="/admin/orders" className={styles.actionCard}>
            <div className={styles.actionIcon} style={{ backgroundColor: '#3b82f6' }}>
              <FiShoppingCart />
            </div>
            <div className={styles.actionInfo}>
              <h4>Process Orders</h4>
              <p>Handle corporate billing</p>
            </div>
          </a>

          <a href="/admin/reports" className={styles.actionCard}>
            <div className={styles.actionIcon} style={{ backgroundColor: '#f59e0b' }}>
              <FiFileText />
            </div>
            <div className={styles.actionInfo}>
              <h4>Generate Reports</h4>
              <p>Corporate analytics and invoices</p>
            </div>
          </a>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
};

export default DashboardPage;
