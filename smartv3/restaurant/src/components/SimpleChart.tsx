// src/components/SimpleChart.tsx
import React from 'react';
import { formatCurrency } from '../utils/currency';
import styles from './SimpleChart.module.css';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'area';
  height?: number;
  showValues?: boolean;
  currency?: boolean;
  title?: string;
}

const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  type,
  height = 200,
  showValues = false,
  currency = false,
  title
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const formatValue = (value: number) => {
    if (currency) {
      // Format currency more compactly for display
      if (value >= 1000000) {
        return `TSh ${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `TSh ${(value / 1000).toFixed(0)}K`;
      }
      return formatCurrency(value);
    }
    return value.toLocaleString();
  };

  const getBarHeight = (value: number) => {
    return ((value - minValue) / range) * 80 + 10; // 10% minimum height
  };

  const getLinePoints = () => {
    const width = 100 / (data.length - 1 || 1);
    return data.map((item, index) => {
      const x = index * width;
      const y = 100 - getBarHeight(item.value);
      return `${x},${y}`;
    }).join(' ');
  };

  const getAreaPath = () => {
    const width = 100 / (data.length - 1 || 1);
    let path = `M 0,100`;
    
    data.forEach((item, index) => {
      const x = index * width;
      const y = 100 - getBarHeight(item.value);
      if (index === 0) {
        path += ` L ${x},${y}`;
      } else {
        path += ` L ${x},${y}`;
      }
    });
    
    path += ` L 100,100 Z`;
    return path;
  };

  return (
    <div className={styles.chartContainer} style={{ height }}>
      {title && <h4 className={styles.chartTitle}>{title}</h4>}
      
      <div className={styles.chart}>
        {type === 'bar' && (
          <div className={styles.barChart}>
            {data.map((item, index) => (
              <div key={index} className={styles.barContainer}>
                <div className={styles.barWrapper}>
                  <div
                    className={styles.bar}
                    style={{
                      height: `${getBarHeight(item.value)}%`,
                      backgroundColor: item.color || '#3b82f6'
                    }}
                    title={`${item.label}: ${formatValue(item.value)}`}
                  >
                    {showValues && (
                      <span className={styles.barValue}>
                        {formatValue(item.value)}
                      </span>
                    )}
                  </div>
                </div>
                <span className={styles.barLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {type === 'line' && (
          <div className={styles.lineChart}>
            <svg viewBox="0 0 100 100" className={styles.svg}>
              <polyline
                points={getLinePoints()}
                className={styles.line}
                stroke={data[0]?.color || '#3b82f6'}
                strokeWidth="2"
                fill="none"
              />
              {data.map((item, index) => {
                const width = 100 / (data.length - 1 || 1);
                const x = index * width;
                const y = 100 - getBarHeight(item.value);
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="3"
                    fill={item.color || '#3b82f6'}
                    className={styles.dot}
                    title={`${item.label}: ${formatValue(item.value)}`}
                  />
                );
              })}
            </svg>
            <div className={styles.lineLabels}>
              {data.map((item, index) => (
                <span key={index} className={styles.lineLabel}>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {type === 'area' && (
          <div className={styles.areaChart}>
            <svg viewBox="0 0 100 100" className={styles.svg}>
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={data[0]?.color || '#3b82f6'} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={data[0]?.color || '#3b82f6'} stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path
                d={getAreaPath()}
                fill="url(#areaGradient)"
                className={styles.area}
              />
              <polyline
                points={getLinePoints()}
                className={styles.line}
                stroke={data[0]?.color || '#3b82f6'}
                strokeWidth="2"
                fill="none"
              />
              {data.map((item, index) => {
                const width = 100 / (data.length - 1 || 1);
                const x = index * width;
                const y = 100 - getBarHeight(item.value);
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="3"
                    fill={item.color || '#3b82f6'}
                    className={styles.dot}
                    title={`${item.label}: ${formatValue(item.value)}`}
                  />
                );
              })}
            </svg>
            <div className={styles.areaLabels}>
              {data.map((item, index) => (
                <span key={index} className={styles.areaLabel}>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {showValues && type !== 'bar' && (
        <div className={styles.valuesList}>
          {data.map((item, index) => (
            <div key={index} className={styles.valueItem}>
              <span 
                className={styles.valueColor}
                style={{ backgroundColor: item.color || '#3b82f6' }}
              />
              <span className={styles.valueLabel}>{item.label}:</span>
              <span className={styles.valueAmount}>{formatValue(item.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleChart;
