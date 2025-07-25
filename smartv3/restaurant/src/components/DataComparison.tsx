// src/components/DataComparison.tsx
import React, { useState, useEffect } from 'react';
import {
  ComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
  FiTrendingUp, FiTrendingDown, FiCalendar, FiBarChart2,
  FiToggleLeft, FiToggleRight, FiEye, FiEyeOff, FiZoomIn,
  FiMaximize2, FiMinimize2, FiDownload, FiShare2
} from 'react-icons/fi';
import { formatDisplayCurrency } from '../utils/currency';
import styles from './DataComparison.module.css';

interface ComparisonData {
  period: string;
  current: number;
  previous: number;
  target?: number;
  forecast?: number;
}

interface DataComparisonProps {
  title: string;
  data: ComparisonData[];
  currentLabel: string;
  previousLabel: string;
  valueFormatter?: (value: number) => string;
  showForecast?: boolean;
  showTarget?: boolean;
  onPeriodClick?: (period: string) => void;
}

const DataComparison: React.FC<DataComparisonProps> = ({
  title,
  data,
  currentLabel = "Current Period",
  previousLabel = "Previous Period",
  valueFormatter = (value) => value.toLocaleString(),
  showForecast = false,
  showTarget = false,
  onPeriodClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleMetrics, setVisibleMetrics] = useState({
    current: true,
    previous: true,
    target: showTarget,
    forecast: showForecast
  });
  const [comparisonMode, setComparisonMode] = useState<'overlay' | 'side-by-side'>('overlay');
  const [hoveredData, setHoveredData] = useState<any>(null);

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return '#10b981';
    if (growth < 0) return '#ef4444';
    return '#6b7280';
  };

  const toggleMetric = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentValue = payload.find((p: any) => p.dataKey === 'current')?.value || 0;
      const previousValue = payload.find((p: any) => p.dataKey === 'previous')?.value || 0;
      const growth = calculateGrowth(currentValue, previousValue);

      return (
        <div className={styles.tooltip}>
          <div className={styles.tooltipHeader}>
            <h4>{label}</h4>
            <div className={styles.growthIndicator} style={{ color: getGrowthColor(growth) }}>
              {growth > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
              <span>{growth > 0 ? '+' : ''}{growth.toFixed(1)}%</span>
            </div>
          </div>
          <div className={styles.tooltipContent}>
            {payload.map((entry: any, index: number) => (
              <div key={index} className={styles.tooltipItem}>
                <div 
                  className={styles.tooltipColor} 
                  style={{ backgroundColor: entry.color }}
                />
                <span className={styles.tooltipLabel}>{entry.name}:</span>
                <span className={styles.tooltipValue}>
                  {valueFormatter(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleDataPointClick = (data: any) => {
    setHoveredData(data);
    if (onPeriodClick) {
      onPeriodClick(data.period);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Period', currentLabel, previousLabel, 'Growth %'],
      ...data.map(item => [
        item.period,
        item.current,
        item.previous,
        calculateGrowth(item.current, item.previous).toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_comparison.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${styles.container} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.comparisonToggle}>
            <button
              className={`${styles.toggleButton} ${comparisonMode === 'overlay' ? styles.active : ''}`}
              onClick={() => setComparisonMode('overlay')}
              title="Overlay comparison"
            >
              <FiBarChart2 />
            </button>
            <button
              className={`${styles.toggleButton} ${comparisonMode === 'side-by-side' ? styles.active : ''}`}
              onClick={() => setComparisonMode('side-by-side')}
              title="Side-by-side comparison"
            >
              <FiCalendar />
            </button>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.metricToggles}>
            <button
              className={`${styles.metricToggle} ${visibleMetrics.current ? styles.active : ''}`}
              onClick={() => toggleMetric('current')}
              style={{ borderColor: '#3b82f6' }}
            >
              {visibleMetrics.current ? <FiEye /> : <FiEyeOff />}
              {currentLabel}
            </button>
            <button
              className={`${styles.metricToggle} ${visibleMetrics.previous ? styles.active : ''}`}
              onClick={() => toggleMetric('previous')}
              style={{ borderColor: '#8b5cf6' }}
            >
              {visibleMetrics.previous ? <FiEye /> : <FiEyeOff />}
              {previousLabel}
            </button>
            {showTarget && (
              <button
                className={`${styles.metricToggle} ${visibleMetrics.target ? styles.active : ''}`}
                onClick={() => toggleMetric('target')}
                style={{ borderColor: '#ef4444' }}
              >
                {visibleMetrics.target ? <FiEye /> : <FiEyeOff />}
                Target
              </button>
            )}
            {showForecast && (
              <button
                className={`${styles.metricToggle} ${visibleMetrics.forecast ? styles.active : ''}`}
                onClick={() => toggleMetric('forecast')}
                style={{ borderColor: '#f59e0b' }}
              >
                {visibleMetrics.forecast ? <FiEye /> : <FiEyeOff />}
                Forecast
              </button>
            )}
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.actionButton} onClick={exportData} title="Export data">
              <FiDownload />
            </button>
            <button className={styles.actionButton} title="Share">
              <FiShare2 />
            </button>
            <button 
              className={styles.actionButton}
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={isExpanded ? 500 : 350}>
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            onClick={handleDataPointClick}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="period" 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              tickFormatter={valueFormatter}
            />
            <Tooltip content={customTooltip} />
            <Legend />

            {visibleMetrics.current && (
              <Bar
                dataKey="current"
                name={currentLabel}
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
            )}

            {visibleMetrics.previous && (
              <Bar
                dataKey="previous"
                name={previousLabel}
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
                opacity={0.6}
              />
            )}

            {visibleMetrics.target && showTarget && (
              <Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="#ef4444"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={false}
              />
            )}

            {visibleMetrics.forecast && showForecast && (
              <Area
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.1}
                strokeDasharray="3 3"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {hoveredData && (
        <div className={styles.dataDetails}>
          <h4>Period Details: {hoveredData.period}</h4>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{currentLabel}:</span>
              <span className={styles.detailValue}>{valueFormatter(hoveredData.current)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{previousLabel}:</span>
              <span className={styles.detailValue}>{valueFormatter(hoveredData.previous)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Growth:</span>
              <span 
                className={styles.detailValue}
                style={{ color: getGrowthColor(calculateGrowth(hoveredData.current, hoveredData.previous)) }}
              >
                {calculateGrowth(hoveredData.current, hoveredData.previous) > 0 ? '+' : ''}
                {calculateGrowth(hoveredData.current, hoveredData.previous).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataComparison;
