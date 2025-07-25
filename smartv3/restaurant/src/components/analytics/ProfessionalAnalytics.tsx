// Professional Analytics Dashboard with Real Charts
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar
} from 'recharts';
import {
  FiTrendingUp, FiDollarSign, FiUsers, FiShoppingBag,
  FiActivity, FiTarget, FiRefreshCw, FiDownload,
  FiCalendar, FiFilter, FiBarChart3, FiPieChart
} from 'react-icons/fi';
import { api } from '../../services/api';
import './ProfessionalAnalytics.css';

interface AnalyticsData {
  overview: any;
  revenue: any;
  orders: any;
  customers: any;
  performance: any;
}

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon, color }) => (
  <div className={`kpi-card ${color}`}>
    <div className="kpi-header">
      <div className="kpi-icon">{icon}</div>
      <div className={`kpi-change ${change >= 0 ? 'positive' : 'negative'}`}>
        <FiTrendingUp />
        {change >= 0 ? '+' : ''}{change.toFixed(1)}%
      </div>
    </div>
    <div className="kpi-content">
      <h3 className="kpi-title">{title}</h3>
      <div className="kpi-value">{value}</div>
    </div>
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div className="loading-skeleton">
    <div className="skeleton-card"></div>
    <div className="skeleton-chart"></div>
  </div>
);

const ErrorDisplay: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="error-display">
    <div className="error-content">
      <h3>Unable to load analytics</h3>
      <p>{message}</p>
      <button onClick={onRetry} className="retry-button">
        <FiRefreshCw /> Retry
      </button>
    </div>
  </div>
);

const ProfessionalAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching analytics data...');

      const [overviewRes, revenueRes, ordersRes, customersRes, performanceRes] = await Promise.all([
        api.get(`/analytics/overview/?start_date=${dateRange.start}&end_date=${dateRange.end}`),
        api.get(`/analytics/revenue/?period=${selectedPeriod}`),
        api.get(`/analytics/orders/?breakdown=status,category,payment`),
        api.get(`/analytics/customers/?metrics=demographics,loyalty,retention`),
        api.get(`/analytics/performance/`)
      ]);

      console.log('✅ Analytics data fetched successfully');

      setData({
        overview: overviewRes.data,
        revenue: revenueRes.data,
        orders: ordersRes.data,
        customers: customersRes.data,
        performance: performanceRes.data
      });
    } catch (err: any) {
      console.error('❌ Failed to fetch analytics data:', err);
      setError(err.response?.data?.error || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, dateRange]);

  const formatCurrency = (value: number): string => {
    return `TZS ${(value * 1000).toLocaleString()}`;
  };

  const formatNumber = (value: number): string => {
    return value.toLocaleString();
  };

  // Chart colors
  const colors = {
    primary: '#8884d8',
    secondary: '#82ca9d',
    accent: '#ffc658',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  };

  const pieColors = [colors.primary, colors.secondary, colors.accent, colors.success, colors.warning];

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchAnalyticsData} />;
  if (!data) return <div>No data available</div>;

  return (
    <div className="professional-analytics">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h1>
            <FiBarChart3 />
            Business Analytics Dashboard
          </h1>
          <p>Comprehensive insights and performance metrics</p>
        </div>
        <div className="header-controls">
          <div className="date-range-picker">
            <FiCalendar />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
          <div className="period-selector">
            <FiFilter />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <button className="export-button">
            <FiDownload />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {data.overview?.data?.kpis && (
        <div className="kpi-grid">
          <KPICard
            title="Total Orders"
            value={formatNumber(data.overview.data.kpis.total_orders)}
            change={data.overview.data.kpis.orders_growth}
            icon={<FiShoppingBag />}
            color="blue"
          />
          <KPICard
            title="Total Revenue"
            value={formatCurrency(data.overview.data.kpis.total_revenue)}
            change={data.overview.data.kpis.revenue_growth}
            icon={<FiDollarSign />}
            color="green"
          />
          <KPICard
            title="Total Customers"
            value={formatNumber(data.overview.data.kpis.total_customers)}
            change={15.2}
            icon={<FiUsers />}
            color="purple"
          />
          <KPICard
            title="Avg Order Value"
            value={formatCurrency(data.overview.data.kpis.avg_order_value)}
            change={8.7}
            icon={<FiTarget />}
            color="orange"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Revenue Trend Chart */}
        {data.revenue?.data?.trend && (
          <div className="chart-container large">
            <div className="chart-header">
              <h3>
                <FiTrendingUp />
                Revenue Trend
              </h3>
              <div className="chart-period">{selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} View</div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.revenue.data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => `TZS ${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                  labelStyle={{ color: '#333' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Orders Status Breakdown */}
        {data.orders?.data?.status_breakdown && (
          <div className="chart-container medium">
            <div className="chart-header">
              <h3>
                <FiPieChart />
                Order Status Distribution
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.orders.data.status_breakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="status"
                  label={({ status, percentage }) => `${status}: ${percentage}%`}
                >
                  {data.orders.data.status_breakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any) => [value, name]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Revenue by Category */}
        {data.revenue?.data?.by_category && (
          <div className="chart-container medium">
            <div className="chart-header">
              <h3>
                <FiBarChart3 />
                Revenue by Category
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.revenue.data.by_category}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="category" 
                  stroke="#666"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => `TZS ${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill={colors.secondary}
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalAnalytics;
