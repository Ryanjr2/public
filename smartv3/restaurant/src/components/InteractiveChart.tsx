// src/components/InteractiveChart.tsx
import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ReferenceLine, Brush
} from 'recharts';
import { FiMaximize2, FiMinimize2, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { formatDisplayCurrency } from '../utils/currency';
import styles from './InteractiveChart.module.css';

interface ChartData {
  [key: string]: any;
}

interface InteractiveChartProps {
  title: string;
  data: ChartData[];
  type: 'area' | 'bar' | 'line' | 'pie';
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  showBrush?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  formatValue?: (value: any) => string;
  onDataPointClick?: (data: any) => void;
  loading?: boolean;
  subtitle?: string;
  additionalMetrics?: Array<{
    key: string;
    label: string;
    color: string;
  }>;
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({
  title,
  data,
  type,
  xKey,
  yKey,
  color = '#3b82f6',
  height = 300,
  showBrush = false,
  showGrid = true,
  showLegend = false,
  formatValue = (value) => value.toString(),
  onDataPointClick,
  loading = false,
  subtitle,
  additionalMetrics = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredData, setHoveredData] = useState<any>(null);
  const [animationKey, setAnimationKey] = useState(0);

  const chartHeight = isExpanded ? 500 : height;

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatValue(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleRefresh = () => {
    setAnimationKey(prev => prev + 1);
  };

  const handleDownload = () => {
    // Implement chart download functionality
    console.log('Downloading chart...');
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
      onClick: onDataPointClick
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
            <XAxis 
              dataKey={xKey} 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              tickFormatter={formatValue}
            />
            <Tooltip content={customTooltip} />
            {showLegend && <Legend />}
            <defs>
              <linearGradient id={`gradient-${animationKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={yKey}
              stroke={color}
              strokeWidth={3}
              fill={`url(#gradient-${animationKey})`}
              animationDuration={1000}
              animationBegin={0}
            />
            {additionalMetrics.map((metric, index) => (
              <Area
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                stroke={metric.color}
                strokeWidth={2}
                fill="none"
                strokeDasharray="5 5"
              />
            ))}
            {showBrush && <Brush dataKey={xKey} height={30} stroke={color} />}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
            <XAxis 
              dataKey={xKey} 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              tickFormatter={formatValue}
            />
            <Tooltip content={customTooltip} />
            {showLegend && <Legend />}
            <Bar 
              dataKey={yKey} 
              fill={color}
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
            />
            {additionalMetrics.map((metric, index) => (
              <Bar
                key={metric.key}
                dataKey={metric.key}
                fill={metric.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
            <XAxis 
              dataKey={xKey} 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              tickFormatter={formatValue}
            />
            <Tooltip content={customTooltip} />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              animationDuration={1000}
            />
            {additionalMetrics.map((metric, index) => (
              <Line
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                stroke={metric.color}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            ))}
          </LineChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={isExpanded ? 180 : 100}
              fill={color}
              dataKey={yKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || color} />
              ))}
            </Pie>
            <Tooltip content={customTooltip} />
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${styles.container} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <div className={styles.actions}>
          <button 
            className={styles.actionButton}
            onClick={handleRefresh}
            title="Refresh data"
          >
            <FiRefreshCw />
          </button>
          <button 
            className={styles.actionButton}
            onClick={handleDownload}
            title="Download chart"
          >
            <FiDownload />
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

      <div className={styles.chartContainer}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading chart data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            {renderChart()}
          </ResponsiveContainer>
        )}
      </div>

      {hoveredData && (
        <div className={styles.dataPreview}>
          <h4>Data Point Details</h4>
          <pre>{JSON.stringify(hoveredData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default InteractiveChart;
