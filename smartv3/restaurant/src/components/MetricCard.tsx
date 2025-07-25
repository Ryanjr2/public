// src/components/MetricCard.tsx
import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import styles from './MetricCard.module.css';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType;
  color: string;
  subtitle?: string;
  loading?: boolean;
  onClick?: () => void;
  trend?: number[];
  target?: number;
  unit?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color,
  subtitle,
  loading = false,
  onClick,
  trend = [],
  target,
  unit = ''
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (typeof value === 'number' && !loading) {
      const duration = 1000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setAnimatedValue(value);
          clearInterval(timer);
        } else {
          setAnimatedValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [value, loading]);

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase': return FiTrendingUp;
      case 'decrease': return FiTrendingDown;
      default: return FiMinus;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase': return '#10b981';
      case 'decrease': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const ChangeIcon = getChangeIcon();
  const displayValue = typeof value === 'number' ? animatedValue : value;

  return (
    <div 
      className={`${styles.card} ${onClick ? styles.clickable : ''} ${isHovered ? styles.hovered : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.cardHeader}>
        <div className={styles.iconContainer} style={{ backgroundColor: color }}>
          <Icon className={styles.icon} />
        </div>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      <div className={styles.valueSection}>
        {loading ? (
          <div className={styles.skeleton}>
            <div className={styles.skeletonLine}></div>
          </div>
        ) : (
          <>
            <div className={styles.mainValue}>
              {displayValue}{unit}
            </div>
            {change !== undefined && (
              <div className={styles.changeIndicator} style={{ color: getChangeColor() }}>
                <ChangeIcon className={styles.changeIcon} />
                <span className={styles.changeValue}>
                  {Math.abs(change)}%
                </span>
                <span className={styles.changeLabel}>vs last period</span>
              </div>
            )}
          </>
        )}
      </div>

      {trend.length > 0 && (
        <div className={styles.miniChart}>
          <svg viewBox="0 0 100 20" className={styles.trendSvg}>
            <polyline
              points={trend.map((val, idx) => `${(idx / (trend.length - 1)) * 100},${20 - (val / Math.max(...trend)) * 15}`).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="2"
              className={styles.trendLine}
            />
          </svg>
        </div>
      )}

      {target && (
        <div className={styles.progressSection}>
          <div className={styles.progressLabel}>
            <span>Target Progress</span>
            <span>{Math.round((Number(displayValue) / target) * 100)}%</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ 
                width: `${Math.min((Number(displayValue) / target) * 100, 100)}%`,
                backgroundColor: color
              }}
            />
          </div>
        </div>
      )}

      <div className={styles.cardFooter}>
        {onClick && (
          <span className={styles.clickHint}>Click for details</span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
