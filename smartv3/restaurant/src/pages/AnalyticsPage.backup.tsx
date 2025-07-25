// src/pages/AnalyticsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  FiTrendingUp, FiTrendingDown, FiUsers, FiShoppingCart,
  FiCalendar, FiClock, FiTrendingUp, FiBarChart2, FiDownload,
  FiPieChart, FiActivity, FiTarget, FiStar, FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import InteractiveChart from '../components/InteractiveChart';
import AnalyticsFilters from '../components/AnalyticsFilters';
import MetricCard from '../components/MetricCard';
import DataComparison from '../components/DataComparison';
import AdvancedAnalyticsDashboard from '../components/AdvancedAnalyticsDashboard';
import { RealTimeDataProvider } from '../components/RealTimeDataProvider';
import api from '../services/api';
import { formatDisplayCurrency, formatCurrency } from '../utils/currency';
import styles from './Analytics.module.css';

interface AnalyticsData {
  revenue: {
    today: number;
    week: number;
    month: number;
    growth: number;
  };
  orders: {
    total: number;
    completed: number;
    cancelled: number;
    avgValue: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    retention: number;
  };
  popular_items: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
}



const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>(null);
  const [chartData, setChartData] = useState<any>({});
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'orders', 'customers']);
  const [advancedMode, setAdvancedMode] = useState(false);

  // Enhanced Chart Data
  const generateChartData = () => {
    return {
      revenueData: [
        { name: 'Mon', revenue: 2400000, orders: 45, target: 2500000 },
        { name: 'Tue', revenue: 1800000, orders: 38, target: 2000000 },
        { name: 'Wed', revenue: 3200000, orders: 62, target: 2800000 },
        { name: 'Thu', revenue: 2800000, orders: 55, target: 2600000 },
        { name: 'Fri', revenue: 4100000, orders: 78, target: 3800000 },
        { name: 'Sat', revenue: 5200000, orders: 95, target: 4800000 },
        { name: 'Sun', revenue: 3800000, orders: 72, target: 3500000 }
      ],
      orderStatusData: [
        { name: 'Completed', value: 1180, color: '#10b981' },
        { name: 'Cancelled', value: 67, color: '#ef4444' },
        { name: 'Pending', value: 23, color: '#f59e0b' }
      ],
      customerData: [
        { name: 'Jan', new: 45, returning: 120, total: 165 },
        { name: 'Feb', new: 52, returning: 135, total: 187 },
        { name: 'Mar', new: 38, returning: 142, total: 180 },
        { name: 'Apr', new: 61, returning: 158, total: 219 },
        { name: 'May', new: 55, returning: 165, total: 220 },
        { name: 'Jun', new: 67, returning: 178, total: 245 }
      ],
      hourlyActivity: [
        { hour: '6AM', orders: 5, revenue: 125000 },
        { hour: '8AM', orders: 15, revenue: 380000 },
        { hour: '10AM', orders: 25, revenue: 620000 },
        { hour: '12PM', orders: 45, revenue: 1150000 },
        { hour: '2PM', orders: 38, revenue: 950000 },
        { hour: '4PM', orders: 22, revenue: 580000 },
        { hour: '6PM', orders: 52, revenue: 1320000 },
        { hour: '8PM', orders: 48, revenue: 1200000 },
        { hour: '10PM', orders: 28, revenue: 720000 }
      ],
      categoryPerformance: [
        { category: 'Main Courses', revenue: 2850000, orders: 145, growth: 12.5 },
        { category: 'Appetizers', revenue: 1200000, orders: 89, growth: 8.3 },
        { category: 'Desserts', revenue: 850000, orders: 67, growth: -2.1 },
        { category: 'Beverages', revenue: 950000, orders: 156, growth: 15.7 },
        { category: 'Specials', revenue: 1450000, orders: 78, growth: 22.4 }
      ],
      paymentMethods: [
        { method: 'Mobile Money', amount: 3200000, percentage: 45, color: '#10b981' },
        { method: 'Cash', amount: 2400000, percentage: 34, color: '#3b82f6' },
        { method: 'Card', amount: 1100000, percentage: 15, color: '#8b5cf6' },
        { method: 'Corporate', amount: 450000, percentage: 6, color: '#f59e0b' }
      ]
    };
  };

  // Filter and data handling functions
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    // Regenerate chart data based on filters
    setChartData(generateChartData());
  };

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setChartData(generateChartData());
      setLoading(false);
    }, 1000);
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting analytics data as ${format}`);
    // Implement export functionality
  };

  useEffect(() => {
    setChartData(generateChartData());
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // For now, we'll use mock data since the analytics endpoint might not be fully implemented
        const mockData: AnalyticsData = {
          revenue: {
            today: 2850000, // TSh 2,850,000
            week: 18500000, // TSh 18,500,000
            month: 75000000, // TSh 75,000,000
            growth: 12.5
          },
          orders: {
            total: 1247,
            completed: 1180,
            cancelled: 67,
            avgValue: 45000 // TSh 45,000
          },
          customers: {
            total: 892,
            new: 156,
            returning: 736,
            retention: 82.5
          },
          popular_items: [
            { name: 'Nyama Choma', orders: 234, revenue: 8500000 },
            { name: 'Ugali na Samaki', orders: 189, revenue: 6200000 },
            { name: 'Pilau', orders: 167, revenue: 5800000 },
            { name: 'Chapati na Mchuzi', orders: 145, revenue: 4200000 },
            { name: 'Wali wa Nazi', orders: 123, revenue: 3900000 }
          ]
        };

        // Simulate API call delay
        setTimeout(() => {
          setAnalytics(mockData);
          setLoading(false);
        }, 1000);

        // Uncomment when real API is ready:
        // const response = await api.get('/analytics/dashboard/overview/');
        // setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Failed to load analytics data</div>
      </div>
    );
  }

  return (
    <RealTimeDataProvider updateInterval={30000}>
      <div className={styles.container}>
        {/* Enhanced Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>
                <FiBarChart2 className={styles.titleIcon} />
                Interactive Analytics
              </h1>
              <div className={styles.liveIndicator}>
                <div className={styles.liveDot}></div>
                <span>Real-time Data</span>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button
                className={`${styles.modeToggle} ${advancedMode ? styles.active : ''}`}
                onClick={() => setAdvancedMode(!advancedMode)}
              >
                <FiTarget />
                {advancedMode ? 'Basic View' : 'Advanced View'}
              </button>
            </div>
            <p className={styles.subtitle}>
              Comprehensive business insights with interactive visualizations
            </p>
          </div>
        </div>

        {/* Conditional Rendering Based on Mode */}
        {advancedMode ? (
          <AdvancedAnalyticsDashboard />
        ) : (
          <>
            {/* Advanced Filters */}
            <AnalyticsFilters
              onFiltersChange={handleFiltersChange}
              onRefresh={handleRefresh}
              onExport={handleExport}
              loading={loading}
            />

      {/* Enhanced Key Metrics */}
      <div className={styles.metricsGrid}>
        <MetricCard
          title="Total Revenue"
          value={analytics ? formatDisplayCurrency(analytics.revenue.month) : formatDisplayCurrency(7150000)}
          change={analytics ? analytics.revenue.growth : 12.5}
          changeType="increase"
          icon={FiTrendingUp}
          color="#10b981"
          subtitle="Monthly performance"
          trend={[6200000, 6450000, 6800000, 7150000, 6950000, 7350000, 7150000]}
          target={8000000}
          loading={loading}
        />
        <MetricCard
          title="Total Orders"
          value={analytics ? analytics.orders.total.toLocaleString() : "1,247"}
          change={8.2}
          changeType="increase"
          icon={FiShoppingCart}
          color="#3b82f6"
          subtitle="Orders processed"
          trend={[1100, 1150, 1200, 1247, 1180, 1290, 1247]}
          target={1500}
          unit=" orders"
          loading={loading}
        />
        <MetricCard
          title="Active Customers"
          value={analytics ? analytics.customers.total.toLocaleString() : "892"}
          change={15.3}
          changeType="increase"
          icon={FiUsers}
          color="#8b5cf6"
          subtitle="Unique customers"
          trend={[750, 780, 820, 850, 870, 885, 892]}
          target={1000}
          unit=" customers"
          loading={loading}
        />
        <MetricCard
          title="Avg Order Value"
          value={analytics ? formatDisplayCurrency(analytics.orders.avgValue) : formatDisplayCurrency(57350)}
          change={-2.1}
          changeType="decrease"
          icon={FiTrendingUp}
          color="#f59e0b"
          subtitle="Per order average"
          trend={[58000, 57800, 57500, 57350, 57600, 57200, 57350]}
          loading={loading}
        />
        <MetricCard
          title="Customer Satisfaction"
          value="4.8"
          change={5.2}
          changeType="increase"
          icon={FiStar}
          color="#06b6d4"
          subtitle="Average rating"
          trend={[4.6, 4.7, 4.7, 4.8, 4.8, 4.9, 4.8]}
          target={5.0}
          unit="/5"
          loading={loading}
        />
        <MetricCard
          title="Peak Hour Performance"
          value="7-8 PM"
          change={18.5}
          changeType="increase"
          icon={FiClock}
          color="#8b5cf6"
          subtitle="Busiest time slot"
          trend={[45, 48, 52, 55, 58, 62, 65]}
          loading={loading}
        />
      </div>

      {/* Interactive Charts Section */}
      <div className={styles.chartsSection}>
        <div className={styles.chartsGrid}>
          {/* Revenue Trend Chart */}
          <div className={styles.chartWrapper}>
            <InteractiveChart
              title="Revenue Performance"
              subtitle="Daily revenue with targets and trends"
              data={chartData.revenueData || []}
              type="area"
              xKey="name"
              yKey="revenue"
              color="#10b981"
              height={350}
              showBrush={true}
              showGrid={true}
              formatValue={(value) => formatDisplayCurrency(value)}
              loading={loading}
              additionalMetrics={[
                { key: 'target', label: 'Target', color: '#ef4444' }
              ]}
            />
          </div>

          {/* Order Status Distribution */}
          <div className={styles.chartWrapper}>
            <InteractiveChart
              title="Order Status Distribution"
              subtitle="Current order completion rates"
              data={chartData.orderStatusData || []}
              type="pie"
              xKey="name"
              yKey="value"
              height={350}
              showLegend={true}
              formatValue={(value) => `${value} orders`}
              loading={loading}
            />
          </div>

          {/* Customer Analytics */}
          <div className={styles.chartWrapper}>
            <InteractiveChart
              title="Customer Growth"
              subtitle="New vs returning customer trends"
              data={chartData.customerData || []}
              type="bar"
              xKey="name"
              yKey="total"
              color="#8b5cf6"
              height={350}
              showGrid={true}
              showLegend={true}
              formatValue={(value) => `${value} customers`}
              loading={loading}
              additionalMetrics={[
                { key: 'new', label: 'New Customers', color: '#3b82f6' },
                { key: 'returning', label: 'Returning', color: '#10b981' }
              ]}
            />
          </div>

          {/* Hourly Activity */}
          <div className={styles.chartWrapper}>
            <InteractiveChart
              title="Hourly Activity Pattern"
              subtitle="Orders and revenue by hour"
              data={chartData.hourlyActivity || []}
              type="line"
              xKey="hour"
              yKey="orders"
              color="#f59e0b"
              height={350}
              showGrid={true}
              formatValue={(value) => `${value} orders`}
              loading={loading}
              additionalMetrics={[
                { key: 'revenue', label: 'Revenue (TSh)', color: '#06b6d4' }
              ]}
            />
          </div>

          {/* Category Performance */}
          <div className={styles.chartWrapper}>
            <InteractiveChart
              title="Category Performance"
              subtitle="Revenue by food category"
              data={chartData.categoryPerformance || []}
              type="bar"
              xKey="category"
              yKey="revenue"
              color="#ef4444"
              height={350}
              showGrid={true}
              formatValue={(value) => formatDisplayCurrency(value)}
              loading={loading}
            />
          </div>

          {/* Payment Methods */}
          <div className={styles.chartWrapper}>
            <InteractiveChart
              title="Payment Method Distribution"
              subtitle="Revenue breakdown by payment type"
              data={chartData.paymentMethods || []}
              type="pie"
              xKey="method"
              yKey="amount"
              height={350}
              showLegend={true}
              formatValue={(value) => formatDisplayCurrency(value)}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className={styles.summarySection}>
        <div className={styles.summaryCard}>
          <h3>Key Insights</h3>
          <div className={styles.insightsList}>
            <div className={styles.insight}>
              <FiTrendingUp className={styles.insightIcon} />
              <div>
                <h4>Revenue Growth</h4>
                <p>12.5% increase compared to last month</p>
              </div>
            </div>
            <div className={styles.insight}>
              <FiUsers className={styles.insightIcon} />
              <div>
                <h4>Customer Retention</h4>
                <p>85% of customers are returning customers</p>
              </div>
            </div>
            <div className={styles.insight}>
              <FiClock className={styles.insightIcon} />
              <div>
                <h4>Peak Hours</h4>
                <p>7-8 PM shows highest activity with 65 orders/hour</p>
              </div>
            </div>
            <div className={styles.insight}>
              <FiTarget className={styles.insightIcon} />
              <div>
                <h4>Target Achievement</h4>
                <p>89% of monthly revenue target achieved</p>
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </RealTimeDataProvider>
  );
};

export default AnalyticsPage;
