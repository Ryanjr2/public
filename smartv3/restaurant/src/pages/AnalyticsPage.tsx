import React, { useState, useEffect, useMemo } from 'react';
import { 
  FiActivity, 
  FiBarChart, 
  FiCalendar, 
  FiShoppingCart, 
  FiUsers, 
  FiTarget, 
  FiTrendingUp, 
  FiPieChart, 
  FiMaximize2,
  FiRefreshCw,
  FiFilter,
  FiAlertCircle,
  FiTrendingDown,
  FiClock,
  FiDownload
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Legend
} from 'recharts';
import { useContext, createContext } from 'react';
// Temporary fallback ThemeContext for demo/development
export const ThemeContext = createContext({
    isDarkMode: false,
    toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

import styles from './AnalyticsPage.module.css';
import { formatDisplayCurrency } from '../utils/currency';
import html2canvas from 'html2canvas'; // Add this import

// Utility to export data as CSV
function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [
    keys.join(','),
    ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// Enhanced interfaces
interface KPICard {
  title: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  sparklineData: Array<{ value: number }>;
  target?: number;
  icon: React.ReactNode;
  color: string;
}

interface SmartInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'alert';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
}

interface ChartConfig {
  type: 'area' | 'bar' | 'line';
  showComparison: boolean;
  timeframe: 'daily' | 'weekly' | 'monthly';
}

// Utility to aggregate data by week
function aggregateByWeek(data: any[]) {
  const weeks: Record<string, any> = {};
  data.forEach(item => {
    const date = new Date(item.date);
    // Get ISO week string
    const week = `${date.getFullYear()}-W${Math.ceil(
      ((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(date.getFullYear(), 0, 1).getDay() + 1) / 7
    )}`;
    if (!weeks[week]) {
      weeks[week] = { ...item, date: week, revenue: 0, orders: 0, previousPeriod: 0, count: 0 };
    }
    weeks[week].revenue += item.revenue;
    weeks[week].orders += item.orders;
    weeks[week].previousPeriod += item.previousPeriod;
    weeks[week].count += 1;
  });
  return Object.values(weeks).map((w: any) => ({
    ...w,
    revenue: w.revenue,
    orders: w.orders,
    previousPeriod: w.previousPeriod,
    date: w.date,
  }));
}

const AnalyticsPage: React.FC = () => {
  // Use theme context with toggle
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Enhanced state management
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | '7days' | '30days' | 'custom'>('30days');
  const [chartConfigs, setChartConfigs] = useState<Record<string, ChartConfig>>({
    revenue: { type: 'area', showComparison: false, timeframe: 'daily' },
    orders: { type: 'bar', showComparison: false, timeframe: 'daily' }
  });
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  // Interactivity state for toggling data series
  const [showRevenueOrders, setShowRevenueOrders] = useState(true);
  const [showRevenuePrevPeriod, setShowRevenuePrevPeriod] = useState(false);
  const [showCategoryGrowth, setShowCategoryGrowth] = useState(true);

  // Interactivity state for popular dishes chart
  const [popularDishesMetric, setPopularDishesMetric] = useState<'orders' | 'revenue'>('orders');

  // Theme-aware colors
  const colors = {
    primary: 'var(--color-primary)',
    secondary: 'var(--color-secondary)',
    accent: 'var(--color-accent)',
    danger: 'var(--color-danger)',
    warning: 'var(--color-warning)',
    success: 'var(--color-success)',
    text: 'var(--color-text-primary)',
    textSecondary: 'var(--color-text-secondary)',
    surface: 'var(--color-surface)',
    border: 'var(--color-border)'
  };

  // Enhanced mock data with more realistic values
  const enhancedData = useMemo(() => ({
    overview: {
      data: {
        kpis: {
          total_revenue: 45680000,
          revenue_growth: 12.5,
          total_orders: 1247,
          orders_growth: 8.3,
          total_customers: 892,
          customers_growth: 15.2,
          avg_order_value: 36640,
          avg_order_growth: 3.8
        }
      }
    },
    revenue: {
      data: {
        trend: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: 1200000 + Math.random() * 800000 + Math.sin(i / 7) * 300000,
          orders: 35 + Math.random() * 25 + Math.sin(i / 7) * 10,
          previousPeriod: 1100000 + Math.random() * 700000
        })),
        by_category: [
          { category: 'Main Dishes', revenue: 18500000, orders: 456, growth: 15.2 },
          { category: 'Beverages', revenue: 12300000, orders: 678, growth: 8.7 },
          { category: 'Appetizers', revenue: 8900000, orders: 234, growth: -2.1 },
          { category: 'Desserts', revenue: 5980000, orders: 189, growth: 22.4 }
        ]
      }
    },
    orders: {
      data: {
        popular_dishes: [
          { dish: 'Nyama Choma', orders: 156, revenue: 2340000, growth: 18.5, rating: 4.8 },
          { dish: 'Ugali & Sukuma', orders: 134, revenue: 1876000, growth: 12.3, rating: 4.6 },
          { dish: 'Pilau', orders: 98, revenue: 1470000, growth: -5.2, rating: 4.7 },
          { dish: 'Fish Curry', orders: 87, revenue: 1305000, growth: 25.1, rating: 4.9 },
          { dish: 'Chapati', orders: 76, revenue: 912000, growth: 8.7, rating: 4.5 }
        ]
      }
    }
  }), []);

  // Enhanced KPI cards with sparklines and targets
  const enhancedKPIs: KPICard[] = useMemo(() => [
    {
      title: 'Total Revenue',
      value: formatDisplayCurrency(enhancedData.overview.data.kpis.total_revenue),
      change: enhancedData.overview.data.kpis.revenue_growth,
      trend: 'up',
      sparklineData: Array.from({ length: 7 }, (_, i) => ({ value: 1200000 + Math.random() * 400000 })),
      target: 50000000,
      icon: <FiTrendingUp />,
      color: colors.primary
    },
    {
      title: 'Total Orders',
      value: enhancedData.overview.data.kpis.total_orders.toLocaleString(),
      change: enhancedData.overview.data.kpis.orders_growth,
      trend: 'up',
      sparklineData: Array.from({ length: 7 }, (_, i) => ({ value: 35 + Math.random() * 15 })),
      target: 1500,
      icon: <FiShoppingCart />,
      color: colors.secondary
    },
    {
      title: 'Active Customers',
      value: enhancedData.overview.data.kpis.total_customers.toLocaleString(),
      change: enhancedData.overview.data.kpis.customers_growth,
      trend: 'up',
      sparklineData: Array.from({ length: 7 }, (_, i) => ({ value: 120 + Math.random() * 30 })),
      target: 1000,
      icon: <FiUsers />,
      color: colors.accent
    },
    {
      title: 'Avg Order Value',
      value: formatDisplayCurrency(enhancedData.overview.data.kpis.avg_order_value),
      change: enhancedData.overview.data.kpis.avg_order_growth,
      trend: 'up',
      sparklineData: Array.from({ length: 7 }, (_, i) => ({ value: 35000 + Math.random() * 5000 })),
      target: 40000,
      icon: <FiTarget />,
      color: colors.success
    }
  ], [enhancedData, colors]);

  // Smart insights
  const smartInsights: SmartInsight[] = useMemo(() => [
    {
      id: '1',
      type: 'success',
      title: 'Revenue Surge Detected',
      description: 'Revenue increased by 18% compared to last week. Fish Curry is driving growth.',
      impact: 'high',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Pilau Orders Declining',
      description: 'Pilau orders dropped 5.2% this month. Consider promotional campaign.',
      impact: 'medium',
      timestamp: '4 hours ago'
    },
    {
      id: '3',
      type: 'info',
      title: 'Peak Hour Optimization',
      description: 'Friday 7-9 PM shows highest revenue potential. Consider staff optimization.',
      impact: 'medium',
      timestamp: '1 day ago'
    }
  ], []);

  // Real-time updates simulation
  useEffect(() => {
    if (!isRealTimeEnabled) return;
    
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [isRealTimeEnabled]);

  // Quick time preset handlers
  const handleTimePreset = (preset: typeof selectedTimeframe) => {
    setSelectedTimeframe(preset);
    const now = new Date();
    
    switch (preset) {
      case 'today':
        setDateRange({
          start: now.toISOString().split('T')[0],
          end: now.toISOString().split('T')[0]
        });
        break;
      case '7days':
        setDateRange({
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: now.toISOString().split('T')[0]
        });
        break;
      case '30days':
        setDateRange({
          start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: now.toISOString().split('T')[0]
        });
        break;
    }
  };

  // Chart type toggle
  const toggleChartType = (chartId: string) => {
    setChartConfigs(prev => ({
      ...prev,
      [chartId]: {
        ...prev[chartId],
        type: prev[chartId]?.type === 'area' ? 'bar' : prev[chartId]?.type === 'bar' ? 'line' : 'area'
      }
    }));
  };

  // Color palette for charts
  const dishColors = ['#3b82f6', '#10b981', '#f59e42', '#f43f5e', '#a78bfa', '#fbbf24'];
  const categoryColors = ['#6366f1', '#f59e42', '#10b981', '#f43f5e', '#a78bfa', '#fbbf24'];

  // For chart download refs
  const revenueChartRef = React.useRef<HTMLDivElement>(null);
  const popularDishesChartRef = React.useRef<HTMLDivElement>(null);
  const categoryChartRef = React.useRef<HTMLDivElement>(null);

  // Download handler
  const handleDownloadChart = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
      if (!ref.current) return;
      const canvas = await html2canvas(ref.current, { backgroundColor: null });
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

  // Interactive legend state for revenue trend
  const [showRevenue, setShowRevenue] = useState(true);

  // Add loading state
  const [loading, setLoading] = useState(false);
  // Simulate loading for demonstration
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Adjusted revenue trend data based on selectedTimeframe
  const revenueTrendData = useMemo(() => {
    const base = enhancedData.revenue.data.trend;
    if (selectedTimeframe === '7days') {
      return base.slice(-7);
    }
    if (selectedTimeframe === 'today') {
      // Simulate hourly data for today
      const today = new Date();
      return Array.from({ length: 12 }, (_, i) => ({
        date: `${String(i * 2).padStart(2, '0')}:00`,
        revenue: 100000 + Math.random() * 50000,
        orders: 5 + Math.random() * 5,
        previousPeriod: 90000 + Math.random() * 40000,
      }));
    }
    if (selectedTimeframe === '30days' && base.length > 14) {
      // Aggregate by week for clarity
      return aggregateByWeek(base);
    }
    // For custom or fallback, show all
    return base;
  }, [enhancedData, selectedTimeframe]);

  // Save theme and chart type preferences in localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('analytics-theme');
    if (savedTheme) {
      if ((savedTheme === 'dark') !== isDarkMode) toggleTheme();
    }
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    localStorage.setItem('analytics-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  useEffect(() => {
    localStorage.setItem('analytics-chart-type', chartConfigs.revenue.type);
  }, [chartConfigs.revenue.type]);

  // Refresh handler (simulate data reload)
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
    setLastUpdated(new Date());
  };

  // Drill-down modal state
  const [drilldownKPI, setDrilldownKPI] = useState<KPICard | null>(null);

  return (
    <div className={`${styles.analyticsPage} ${isDarkMode ? styles.darkMode : ''}`} role="main" aria-label="Analytics Dashboard">
      {/* Loading spinner */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div className={styles.spinner} role="status" aria-label="Loading analytics" />
          <div>Loading analytics...</div>
        </div>
      )}
      {!loading && (
        <>
          {/* Enhanced Header */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.titleSection}>
                <h1 className={styles.title}>
                  <FiBarChart className={styles.titleIcon} aria-hidden="true" />
                  Business Analytics
                  {isRealTimeEnabled && <div className={styles.liveIndicator} aria-label="Live updates enabled" />}
                </h1>
                <p className={styles.subtitle}>
                  Comprehensive insights and performance metrics
                  <span className={styles.lastUpdated}>
                    <FiClock aria-hidden="true" /> Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                </p>
              </div>
              
              <div className={styles.headerActions}>
                {/* Theme Toggle */}
                <button
                  className={styles.themeToggle}
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  type="button"
                >
                  <span aria-hidden="true">{isDarkMode ? '🌙' : '☀️'}</span>
                  <span style={{ marginLeft: 6 }}>Theme</span>
                </button>
                {/* Refresh Button */}
                <button
                  className={styles.themeToggle}
                  onClick={handleRefresh}
                  aria-label="Refresh analytics data"
                  type="button"
                >
                  <FiRefreshCw aria-hidden="true" />
                  <span style={{ marginLeft: 6 }}>Refresh</span>
                </button>
                {/* Real-time Toggle */}
                <button 
                  className={`${styles.realTimeToggle} ${isRealTimeEnabled ? styles.active : ''}`}
                  onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                  aria-label={isRealTimeEnabled ? "Disable live updates" : "Enable live updates"}
                  type="button"
                >
                  <FiRefreshCw className={isRealTimeEnabled ? styles.spinning : ''} aria-hidden="true" />
                  <span style={{ marginLeft: 6 }}>Live</span>
                </button>
                {/* Quick Time Presets */}
                <div className={styles.timePresets} role="group" aria-label="Time presets">
                  {(['today', '7days', '30days', 'custom'] as const).map(preset => (
                    <button
                      key={preset}
                      className={`${styles.timePreset} ${selectedTimeframe === preset ? styles.active : ''}`}
                      onClick={() => handleTimePreset(preset)}
                      aria-label={`Show data for ${preset}`}
                      type="button"
                    >
                      {preset === 'today' ? 'Today' : 
                       preset === '7days' ? '7 Days' : 
                       preset === '30days' ? '30 Days' : 'Custom'}
                    </button>
                  ))}
                </div>
                {/* Date Range Picker */}
                {selectedTimeframe === 'custom' && (
                  <div className={styles.dateRangePicker}>
                    <FiCalendar aria-hidden="true" />
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className={styles.dateInput}
                      aria-label="Start date"
                    />
                    <span>to</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className={styles.dateInput}
                      aria-label="End date"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Smart Insights Bar */}
          <div className={styles.insightsBar}>
            <div className={styles.insightsHeader}>
              <FiAlertCircle aria-hidden="true" />
              <span>Smart Insights</span>
            </div>
            <div className={styles.insightsList}>
              {smartInsights.map(insight => (
                <div key={insight.id} className={`${styles.insight} ${styles[insight.type]}`}>
                  <div className={styles.insightContent}>
                    <strong>{insight.title}</strong>
                    <p>{insight.description}</p>
                  </div>
                  <div className={styles.insightMeta}>
                    <span className={`${styles.impact} ${styles[insight.impact]}`}>
                      {insight.impact.toUpperCase()}
                    </span>
                    <span className={styles.timestamp}>{insight.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced KPI Cards */}
          <div className={styles.kpiGrid}>
            {enhancedKPIs.map((kpi, index) => (
              <div
                key={index}
                className={styles.enhancedKpiCard}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${kpi.title}`}
                onClick={() => setDrilldownKPI(kpi)}
                onKeyDown={e => { if (e.key === 'Enter') setDrilldownKPI(kpi); }}
                style={{ cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                <div className={styles.kpiHeader}>
                  <div className={styles.kpiIcon} style={{ backgroundColor: kpi.color }}>
                    {kpi.icon}
                  </div>
                  <div className={styles.kpiTrend}>
                    {kpi.trend === 'up' ? <FiTrendingUp className={styles.up} /> : 
                     kpi.trend === 'down' ? <FiTrendingDown className={styles.down} /> : 
                     <FiActivity />}
                    <span className={`${styles.changeValue} ${styles[kpi.trend]}`}>
                      {kpi.change > 0 ? '+' : ''}{kpi.change}%
                    </span>
                  </div>
                </div>
                
                <div className={styles.kpiContent}>
                  <h3>{kpi.title}</h3>
                  <div className={styles.kpiValue}>{kpi.value}</div>
                  
                  {/* Sparkline */}
                  <div className={styles.sparkline}>
                    <ResponsiveContainer width="100%" height={40}>
                      <LineChart data={kpi.sparklineData}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={kpi.color} 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Progress to Target */}
                  {kpi.target && (
                    <div className={styles.targetProgress}>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill}
                          style={{ 
                            width: `${Math.min((typeof kpi.value === 'string' ? parseFloat(kpi.value.replace(/[^0-9.-]+/g, '')) : kpi.value) / kpi.target * 100, 100)}%`,
                            backgroundColor: kpi.color 
                          }}
                        />
                      </div>
                      <span className={styles.targetText}>
                        Target: {typeof kpi.target === 'number' && kpi.target > 1000000 ? 
                          formatDisplayCurrency(kpi.target) : 
                          kpi.target.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* KPI Drill-down Modal */}
          {drilldownKPI && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Details for ${drilldownKPI.title}`}
              style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
              }}
              onClick={() => setDrilldownKPI(null)}
            >
              <div
                style={{
                  background: isDarkMode ? '#1e293b' : '#fff',
                  color: isDarkMode ? '#f1f5f9' : '#1e293b',
                  borderRadius: 12,
                  padding: 32,
                  minWidth: 320,
                  maxWidth: 400,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                  position: 'relative'
                }}
                onClick={e => e.stopPropagation()}
              >
                <h2 style={{ marginTop: 0 }}>{drilldownKPI.title}</h2>
                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{drilldownKPI.value}</div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ color: drilldownKPI.trend === 'up' ? '#10b981' : drilldownKPI.trend === 'down' ? '#ef4444' : '#64748b' }}>
                    {drilldownKPI.trend === 'up' ? '▲' : drilldownKPI.trend === 'down' ? '▼' : '•'} {drilldownKPI.change}%
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                  More details and breakdown can be shown here.
                </div>
                <button
                  onClick={() => setDrilldownKPI(null)}
                  style={{
                    background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer'
                  }}
                  aria-label="Close details"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Charts Grid */}
          <div className={styles.chartsGrid}>
            {/* Revenue Trend with Controls */}
            <div ref={revenueChartRef} className={`${styles.chartCard} ${styles.large} ${expandedChart === 'revenue' ? styles.expanded : ''}`}>
              <div className={styles.chartHeader}>
                <div>
                  <h3>
                    <FiTrendingUp />
                    Revenue Trend
                  </h3>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                    {dateRange.start} to {dateRange.end} &mdash; Track revenue, orders, and compare with previous periods.
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    Click legend items to toggle series. Use export/download for offline analysis.
                  </div>
                </div>
                <div className={styles.chartControls}>
                  <button
                    className={styles.chartControl}
                    onClick={() => toggleChartType('revenue')}
                    title="Change chart type"
                    aria-label="Toggle revenue trend chart type"
                    type="button"
                  >
                    <FiBarChart />
                  </button>
                  <button
                    className={styles.chartControl}
                    onClick={() => setChartConfigs(prev => ({
                      ...prev,
                      revenue: { ...prev.revenue, showComparison: !prev.revenue?.showComparison }
                    }))}
                    title="Toggle comparison"
                    aria-label="Toggle revenue trend comparison"
                    type="button"
                  >
                    <FiFilter />
                  </button>
                  <button
                    className={styles.chartControl}
                    onClick={() => setExpandedChart(expandedChart === 'revenue' ? null : 'revenue')}
                    title="Expand chart"
                    aria-label="Expand revenue trend chart"
                    type="button"
                  >
                    <FiMaximize2 />
                  </button>
                  <button
                    className={styles.chartControl}
                    onClick={() => handleDownloadChart(revenueChartRef, 'revenue-trend.png')}
                    title="Download chart"
                    aria-label="Download revenue trend chart as PNG"
                    type="button"
                  >
                    <FiDownload style={{ marginRight: 4 }} />
                    Download
                  </button>
                  <button
                    className={styles.chartControl}
                    onClick={() => exportToCSV(revenueTrendData, 'revenue-trend.csv')}
                    title="Export CSV"
                    aria-label="Export revenue trend data as CSV"
                    type="button"
                  >
                    <FiDownload style={{ marginRight: 4 }} />
                    Export CSV
                  </button>
                </div>
              </div>
              {/* Empty state */}
              {revenueTrendData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  No data available for the selected range.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={expandedChart === 'revenue' ? 500 : 300}>
                  {chartConfigs.revenue?.type === 'area' ? (
                    <ComposedChart data={revenueTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                      <XAxis
                        dataKey="date"
                        stroke={colors.textSecondary}
                        fontSize={12}
                        angle={revenueTrendData.length > 10 ? -30 : 0}
                        textAnchor={revenueTrendData.length > 10 ? 'end' : 'middle'}
                        interval={revenueTrendData.length > 14 ? Math.ceil(revenueTrendData.length / 7) : 0}
                      />
                      <YAxis
                        stroke={colors.textSecondary}
                        fontSize={12}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip
                        formatter={(value: any, name: string) => [
                          name === 'revenue' ? formatDisplayCurrency(value) : `${value} orders`,
                          name === 'revenue' ? 'Revenue' : 'Orders'
                        ]}
                        contentStyle={{
                          backgroundColor: colors.surface,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '8px',
                          color: colors.text
                        }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      {showRevenue && (
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke={colors.primary}
                          fill={colors.primary}
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      )}
                      {showRevenuePrevPeriod && (
                        <Area
                          type="monotone"
                          dataKey="previousPeriod"
                          stroke={colors.secondary}
                          fill={colors.secondary}
                          fillOpacity={0.1}
                          strokeWidth={1}
                          strokeDasharray="5 5"
                        />
                      )}
                      {showRevenueOrders && (
                        <Bar dataKey="orders" fill={colors.accent} fillOpacity={0.6} />
                      )}
                    </ComposedChart>
                  ) : (
                    <BarChart data={revenueTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#f0f0f0'} />
                      <XAxis
                        dataKey="date"
                        stroke={colors.text}
                        fontSize={12}
                        angle={revenueTrendData.length > 10 ? -30 : 0}
                        textAnchor={revenueTrendData.length > 10 ? 'end' : 'middle'}
                        interval={revenueTrendData.length > 14 ? Math.ceil(revenueTrendData.length / 7) : 0}
                      />
                      <YAxis
                        stroke={colors.text}
                        fontSize={12}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip
                        formatter={(value: any) => [formatDisplayCurrency(value), 'Revenue']}
                        contentStyle={{
                          backgroundColor: colors.surface,
                          border: `1px solid ${isDarkMode ? '#4B5563' : '#ddd'}`,
                          borderRadius: '8px',
                          color: colors.text
                        }}
                      />
                      {showRevenue && (
                        <Bar dataKey="revenue" fill={colors.primary} radius={[4, 4, 0, 0]} />
                      )}
                      {showRevenueOrders && (
                        <Bar dataKey="orders" fill={colors.accent} fillOpacity={0.6} />
                      )}
                      {showRevenuePrevPeriod && (
                        <Bar dataKey="previousPeriod" fill={colors.secondary} fillOpacity={0.3} />
                      )}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>

            {/* Popular Dishes Chart */}
            <div ref={popularDishesChartRef} className={`${styles.chartCard} ${styles.medium}`}>
              <div className={styles.chartHeader}>
                <h3>
                  <FiPieChart />
                  Popular Dishes Chart
                </h3>
                <div className={styles.chartControls}>
                  <button
                    className={styles.chartControl}
                    onClick={() => setPopularDishesMetric('orders')}
                    style={{ fontWeight: popularDishesMetric === 'orders' ? 'bold' : undefined }}
                    title="Show Orders"
                    aria-label="Show popular dishes by orders"
                    type="button"
                  >
                    Orders
                  </button>
                  <button
                    className={styles.chartControl}
                    onClick={() => setPopularDishesMetric('revenue')}
                    style={{ fontWeight: popularDishesMetric === 'revenue' ? 'bold' : undefined }}
                    title="Show Revenue"
                    aria-label="Show popular dishes by revenue"
                    type="button"
                  >
                    Revenue
                  </button>
                  <button
                    className={styles.chartControl}
                    onClick={() => handleDownloadChart(popularDishesChartRef, 'popular-dishes.png')}
                    title="Download chart"
                    aria-label="Download popular dishes chart as PNG"
                    type="button"
                  >
                    <FiDownload />
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={enhancedData.orders.data.popular_dishes}
                  margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#f0f0f0'} />
                  <XAxis
                    dataKey="dish"
                    stroke={colors.text}
                    fontSize={12}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    stroke={colors.text}
                    fontSize={12}
                    tickFormatter={popularDishesMetric === 'revenue'
                      ? (value) => `${(value / 1000000).toFixed(1)}M`
                      : undefined}
                  />
                  <Tooltip
                    formatter={(value: any, name: string) =>
                      popularDishesMetric === 'revenue'
                        ? [formatDisplayCurrency(value), 'Revenue']
                        : [value, 'Orders']
                    }
                    contentStyle={{
                      backgroundColor: colors.surface,
                      border: `1px solid ${isDarkMode ? '#4B5563' : '#ddd'}`,
                      borderRadius: '8px',
                      color: colors.text
                    }}
                  />
                  <Bar
                    dataKey={popularDishesMetric}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={true}
                  >
                    {enhancedData.orders.data.popular_dishes.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={dishColors[idx % dishColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Enhanced Popular Dishes Cards */}
            <div className={`${styles.chartCard} ${styles.medium}`}>
              <div className={styles.chartHeader}>
                <h3>
                  <FiPieChart />
                  Popular Dishes Performance
                </h3>
              </div>
              <div className={styles.dishesGrid}>
                {enhancedData.orders.data.popular_dishes.map((dish, index) => (
                  <div key={index} className={styles.dishCard}>
                    <div className={styles.dishHeader}>
                      <span className={styles.dishName}>{dish.dish}</span>
                      <span className={`${styles.dishGrowth} ${dish.growth > 0 ? styles.positive : styles.negative}`}>
                        {dish.growth > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                        {dish.growth > 0 ? '+' : ''}{dish.growth}%
                      </span>
                    </div>
                    <div className={styles.dishMetrics}>
                      <div className={styles.dishMetric}>
                        <span className={styles.metricLabel}>Orders</span>
                        <span className={styles.metricValue}>{dish.orders}</span>
                      </div>
                      <div className={styles.dishMetric}>
                        <span className={styles.metricLabel}>Revenue</span>
                        <span className={styles.metricValue}>{formatDisplayCurrency(dish.revenue)}</span>
                      </div>
                      <div className={styles.dishMetric}>
                        <span className={styles.metricLabel}>Rating</span>
                        <span className={styles.metricValue}>⭐ {dish.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue by Category with Growth Indicators */}
            <div ref={categoryChartRef} className={`${styles.chartCard} ${styles.medium}`}>
              <div className={styles.chartHeader}>
                <h3>
                  <FiBarChart />
                  Category Performance
                </h3>
                <div className={styles.chartControls}>
                  <button
                    className={styles.chartControl}
                    onClick={() => setShowCategoryGrowth(v => !v)}
                    title="Toggle Growth Line"
                    aria-label="Toggle category growth line"
                    type="button"
                    style={{ fontWeight: showCategoryGrowth ? 'bold' : undefined }}
                  >
                    Growth
                  </button>
                  <button
                    className={styles.chartControl}
                    onClick={() => handleDownloadChart(categoryChartRef, 'category-performance.png')}
                    title="Download chart"
                    aria-label="Download category performance chart as PNG"
                    type="button"
                  >
                    <FiDownload />
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={enhancedData.revenue.data.by_category}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#f0f0f0'} />
                  <XAxis 
                    dataKey="category" 
                    stroke={colors.text}
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke={colors.text}
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'revenue' ? formatDisplayCurrency(value) : 
                      name === 'orders' ? `${value} orders` :
                      `${value}%`,
                      name === 'revenue' ? 'Revenue' : 
                      name === 'orders' ? 'Orders' : 'Growth'
                    ]}
                    contentStyle={{ 
                      backgroundColor: colors.surface, 
                      border: `1px solid ${isDarkMode ? '#4B5563' : '#ddd'}`,
                      borderRadius: '8px',
                      color: colors.text
                    }}
                  />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {enhancedData.revenue.data.by_category.map((entry, idx) => (
                      <Cell key={`cat-cell-${idx}`} fill={categoryColors[idx % categoryColors.length]} />
                    ))}
                  </Bar>
                  {showCategoryGrowth && (
                    <Line 
                      type="monotone" 
                      dataKey="growth" 
                      stroke={colors.accent} 
                      strokeWidth={3}
                      dot={{ fill: colors.accent, strokeWidth: 2, r: 4 }}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
