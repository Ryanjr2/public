// src/components/AdvancedAnalyticsDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  FiTrendingUp, FiTrendingDown, FiZoomIn, FiFilter, FiRefreshCw,
  FiBarChart2, FiPieChart, FiActivity, FiTarget, FiUsers,
  FiShoppingCart, FiClock, FiStar, FiArrowRight, FiMaximize2
} from 'react-icons/fi';
import InteractiveChart from './InteractiveChart';
import DataComparison from './DataComparison';
import MetricCard from './MetricCard';
import { useRealTimeData, ConnectionStatus } from './RealTimeDataProvider';
import { formatDisplayCurrency } from '../utils/currency';
import styles from './AdvancedAnalyticsDashboard.module.css';

interface DrillDownData {
  level: 'overview' | 'detailed' | 'granular';
  category?: string;
  timeframe?: string;
  filters?: Record<string, any>;
}

interface PredictiveData {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

const AdvancedAnalyticsDashboard: React.FC = () => {
  const { data: realTimeData, isConnected, refreshData } = useRealTimeData();
  const [drillDown, setDrillDown] = useState<DrillDownData>({ level: 'overview' });
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [predictiveView, setPredictiveView] = useState(false);

  // Generate enhanced analytics data
  const analyticsData = useMemo(() => {
    if (!realTimeData) return null;

    return {
      overview: {
        revenue: {
          current: realTimeData.todaysRevenue,
          previous: realTimeData.todaysRevenue * 0.85,
          target: realTimeData.todaysRevenue * 1.2,
          forecast: realTimeData.todaysRevenue * 1.15
        },
        orders: {
          current: realTimeData.todaysOrders,
          previous: realTimeData.todaysOrders * 0.9,
          target: realTimeData.todaysOrders * 1.3,
          forecast: realTimeData.todaysOrders * 1.1
        },
        customers: {
          current: Math.floor(realTimeData.todaysOrders * 0.8),
          previous: Math.floor(realTimeData.todaysOrders * 0.75),
          target: Math.floor(realTimeData.todaysOrders * 0.9),
          forecast: Math.floor(realTimeData.todaysOrders * 0.85)
        }
      },
      hourlyBreakdown: Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour}:00`,
        orders: Math.floor(Math.random() * 15) + (hour >= 11 && hour <= 14 ? 20 : hour >= 18 && hour <= 21 ? 25 : 5),
        revenue: Math.floor(Math.random() * 300000) + (hour >= 11 && hour <= 14 ? 500000 : hour >= 18 && hour <= 21 ? 600000 : 100000),
        customers: Math.floor(Math.random() * 12) + (hour >= 11 && hour <= 14 ? 15 : hour >= 18 && hour <= 21 ? 18 : 3)
      })),
      categoryBreakdown: [
        { category: 'Main Courses', revenue: 2850000, orders: 145, growth: 12.5, margin: 65 },
        { category: 'Appetizers', revenue: 1200000, orders: 89, growth: 8.3, margin: 72 },
        { category: 'Desserts', revenue: 850000, orders: 67, growth: -2.1, margin: 80 },
        { category: 'Beverages', revenue: 950000, orders: 156, growth: 15.7, margin: 85 },
        { category: 'Specials', revenue: 1450000, orders: 78, growth: 22.4, margin: 58 }
      ],
      customerSegments: [
        { segment: 'Regular Customers', count: 245, revenue: 3200000, avgOrder: 65000, retention: 85 },
        { segment: 'New Customers', count: 156, revenue: 1800000, avgOrder: 58000, retention: 45 },
        { segment: 'VIP Customers', count: 45, revenue: 1950000, avgOrder: 125000, retention: 95 },
        { segment: 'Corporate', count: 78, revenue: 2100000, avgOrder: 85000, retention: 78 }
      ]
    };
  }, [realTimeData]);

  const predictiveData: PredictiveData[] = useMemo(() => [
    {
      metric: 'Revenue (Next Week)',
      current: realTimeData?.todaysRevenue || 0,
      predicted: (realTimeData?.todaysRevenue || 0) * 1.15,
      confidence: 87,
      trend: 'up'
    },
    {
      metric: 'Orders (Next Week)',
      current: realTimeData?.todaysOrders || 0,
      predicted: (realTimeData?.todaysOrders || 0) * 1.08,
      confidence: 92,
      trend: 'up'
    },
    {
      metric: 'Customer Satisfaction',
      current: 4.7,
      predicted: 4.8,
      confidence: 78,
      trend: 'up'
    },
    {
      metric: 'Peak Hour Efficiency',
      current: 85,
      predicted: 88,
      confidence: 83,
      trend: 'up'
    }
  ], [realTimeData]);

  const handleMetricDrillDown = (metric: string, category?: string) => {
    setSelectedMetric(metric);
    setDrillDown({
      level: 'detailed',
      category,
      timeframe: 'daily'
    });
  };

  const handleChartClick = (data: any) => {
    console.log('Chart clicked:', data);
    // Implement drill-down logic
  };

  const getComparisonData = (metric: string) => {
    if (!analyticsData) return [];

    switch (metric) {
      case 'revenue':
        return [
          { period: 'Mon', current: 2400000, previous: 2200000, target: 2500000 },
          { period: 'Tue', current: 1800000, previous: 1900000, target: 2000000 },
          { period: 'Wed', current: 3200000, previous: 2800000, target: 3000000 },
          { period: 'Thu', current: 2800000, previous: 2600000, target: 2700000 },
          { period: 'Fri', current: 4100000, previous: 3800000, target: 4000000 },
          { period: 'Sat', current: 5200000, previous: 4900000, target: 5000000 },
          { period: 'Sun', current: 3800000, previous: 3600000, target: 3700000 }
        ];
      default:
        return [];
    }
  };

  if (!analyticsData) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading advanced analytics...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header with Real-time Status */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>
              <FiActivity className={styles.titleIcon} />
              Advanced Analytics
            </h2>
            <ConnectionStatus className={styles.connectionStatus} />
          </div>
          
          <div className={styles.headerControls}>
            <button
              className={`${styles.controlButton} ${comparisonMode ? styles.active : ''}`}
              onClick={() => setComparisonMode(!comparisonMode)}
            >
              <FiBarChart2 />
              Compare
            </button>
            <button
              className={`${styles.controlButton} ${predictiveView ? styles.active : ''}`}
              onClick={() => setPredictiveView(!predictiveView)}
            >
              <FiTarget />
              Predict
            </button>
            <button className={styles.controlButton} onClick={refreshData}>
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Predictive Analytics Section */}
      {predictiveView && (
        <div className={styles.predictiveSection}>
          <h3 className={styles.sectionTitle}>
            <FiTarget />
            Predictive Insights
          </h3>
          <div className={styles.predictiveGrid}>
            {predictiveData.map((prediction, index) => (
              <div key={index} className={styles.predictionCard}>
                <div className={styles.predictionHeader}>
                  <h4>{prediction.metric}</h4>
                  <div className={styles.confidenceScore}>
                    {prediction.confidence}% confidence
                  </div>
                </div>
                <div className={styles.predictionContent}>
                  <div className={styles.predictionValues}>
                    <div className={styles.currentValue}>
                      <span className={styles.label}>Current:</span>
                      <span className={styles.value}>
                        {typeof prediction.current === 'number' && prediction.current > 1000 
                          ? formatDisplayCurrency(prediction.current)
                          : prediction.current
                        }
                      </span>
                    </div>
                    <div className={styles.predictedValue}>
                      <span className={styles.label}>Predicted:</span>
                      <span className={styles.value}>
                        {typeof prediction.predicted === 'number' && prediction.predicted > 1000
                          ? formatDisplayCurrency(prediction.predicted)
                          : prediction.predicted
                        }
                      </span>
                    </div>
                  </div>
                  <div className={styles.trendIndicator}>
                    {prediction.trend === 'up' ? (
                      <FiTrendingUp className={styles.trendUp} />
                    ) : prediction.trend === 'down' ? (
                      <FiTrendingDown className={styles.trendDown} />
                    ) : (
                      <FiActivity className={styles.trendStable} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Metrics Grid */}
      <div className={styles.metricsSection}>
        <div className={styles.metricsGrid}>
          <MetricCard
            title="Live Revenue"
            value={formatDisplayCurrency(analyticsData.overview.revenue.current)}
            change={12.5}
            changeType="increase"
            icon={FiTrendingUp}
            color="#10b981"
            subtitle="Real-time tracking"
            trend={realTimeData?.trends.revenueTrend || []}
            target={analyticsData.overview.revenue.target}
            onClick={() => handleMetricDrillDown('revenue')}
            interactive={true}
          />
          <MetricCard
            title="Live Orders"
            value={analyticsData.overview.orders.current.toString()}
            change={8.2}
            changeType="increase"
            icon={FiShoppingCart}
            color="#3b82f6"
            subtitle="Orders processed"
            trend={realTimeData?.trends.ordersTrend || []}
            target={analyticsData.overview.orders.target}
            onClick={() => handleMetricDrillDown('orders')}
            interactive={true}
          />
          <MetricCard
            title="Active Customers"
            value={analyticsData.overview.customers.current.toString()}
            change={15.3}
            changeType="increase"
            icon={FiUsers}
            color="#8b5cf6"
            subtitle="Currently dining"
            trend={realTimeData?.trends.customersTrend || []}
            onClick={() => handleMetricDrillDown('customers')}
            interactive={true}
          />
          <MetricCard
            title="Kitchen Efficiency"
            value={`${realTimeData?.kitchenQueue || 0} min`}
            change={-5.2}
            changeType="decrease"
            icon={FiClock}
            color="#f59e0b"
            subtitle="Average wait time"
            onClick={() => handleMetricDrillDown('kitchen')}
            interactive={true}
          />
        </div>
      </div>

      {/* Comparison Mode */}
      {comparisonMode && (
        <div className={styles.comparisonSection}>
          <DataComparison
            title="Revenue Comparison"
            data={getComparisonData('revenue')}
            currentLabel="This Week"
            previousLabel="Last Week"
            valueFormatter={formatDisplayCurrency}
            showTarget={true}
            showForecast={true}
            onPeriodClick={(period) => console.log('Period clicked:', period)}
          />
        </div>
      )}

      {/* Interactive Charts Grid */}
      <div className={styles.chartsSection}>
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <InteractiveChart
              title="Hourly Performance"
              subtitle="Orders and revenue by hour"
              data={analyticsData.hourlyBreakdown}
              type="area"
              xKey="hour"
              yKey="revenue"
              color="#10b981"
              height={300}
              showBrush={true}
              formatValue={formatDisplayCurrency}
              onDataPointClick={handleChartClick}
              additionalMetrics={[
                { key: 'orders', label: 'Orders', color: '#3b82f6' }
              ]}
            />
          </div>

          <div className={styles.chartCard}>
            <InteractiveChart
              title="Category Performance"
              subtitle="Revenue by food category"
              data={analyticsData.categoryBreakdown}
              type="bar"
              xKey="category"
              yKey="revenue"
              color="#8b5cf6"
              height={300}
              formatValue={formatDisplayCurrency}
              onDataPointClick={handleChartClick}
            />
          </div>

          <div className={styles.chartCard}>
            <InteractiveChart
              title="Customer Segments"
              subtitle="Revenue by customer type"
              data={analyticsData.customerSegments}
              type="pie"
              xKey="segment"
              yKey="revenue"
              height={300}
              showLegend={true}
              formatValue={formatDisplayCurrency}
              onDataPointClick={handleChartClick}
            />
          </div>
        </div>
      </div>

      {/* Drill-down Details */}
      {selectedMetric && drillDown.level === 'detailed' && (
        <div className={styles.drillDownSection}>
          <div className={styles.drillDownHeader}>
            <h3>Detailed View: {selectedMetric}</h3>
            <button 
              className={styles.closeButton}
              onClick={() => setSelectedMetric(null)}
            >
              ×
            </button>
          </div>
          <div className={styles.drillDownContent}>
            <p>Detailed analytics for {selectedMetric} would be displayed here with granular data, trends, and insights.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
