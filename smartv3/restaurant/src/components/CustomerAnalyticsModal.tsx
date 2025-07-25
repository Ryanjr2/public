// src/components/CustomerAnalyticsModal.tsx
import React from 'react';
import {
  FiX, FiTrendingUp, FiShoppingCart, FiCalendar,
  FiClock, FiHeart, FiStar, FiTarget, FiBarChart2, FiPieChart,
  FiActivity, FiUsers, FiGift
} from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import styles from './CustomerAnalyticsModal.module.css';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  date_joined: string;
  last_visit: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  favorite_items: string[];
  loyalty_points: number;
  status: 'active' | 'inactive' | 'vip';
  preferences: {
    dietary_restrictions: string[];
    preferred_table: string;
    special_occasions: string[];
  };
  visit_frequency: 'regular' | 'occasional' | 'rare';
  customer_segment: 'new' | 'returning' | 'loyal' | 'vip';
}

interface CustomerAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const CustomerAnalyticsModal: React.FC<CustomerAnalyticsModalProps> = ({
  isOpen,
  onClose,
  customer
}) => {
  if (!isOpen || !customer) return null;

  // Generate mock analytics data based on customer
  const generateAnalytics = (customer: Customer) => {
    const monthsActive = Math.max(1, Math.floor((Date.now() - new Date(customer.date_joined).getTime()) / (1000 * 60 * 60 * 24 * 30)));
    
    return {
      spending_trend: [
        { month: 'Jan', amount: customer.total_spent * 0.15 },
        { month: 'Feb', amount: customer.total_spent * 0.18 },
        { month: 'Mar', amount: customer.total_spent * 0.22 },
        { month: 'Apr', amount: customer.total_spent * 0.20 },
        { month: 'May', amount: customer.total_spent * 0.25 },
        { month: 'Jun', amount: customer.total_spent * 0.30 }
      ],
      order_frequency: {
        weekly_average: Math.round(customer.total_orders / (monthsActive * 4.33)),
        monthly_average: Math.round(customer.total_orders / monthsActive),
        peak_day: 'Friday',
        peak_time: '19:00-21:00'
      },
      category_preferences: [
        { category: 'Main Courses', percentage: 45, amount: customer.total_spent * 0.45 },
        { category: 'Appetizers', percentage: 25, amount: customer.total_spent * 0.25 },
        { category: 'Beverages', percentage: 20, amount: customer.total_spent * 0.20 },
        { category: 'Desserts', percentage: 10, amount: customer.total_spent * 0.10 }
      ],
      satisfaction_metrics: {
        overall_rating: 4.6,
        service_rating: 4.7,
        food_rating: 4.5,
        value_rating: 4.4,
        total_reviews: Math.floor(customer.total_orders * 0.3)
      },
      loyalty_metrics: {
        lifetime_value: customer.total_spent,
        predicted_value: customer.total_spent * 1.5,
        retention_probability: customer.customer_segment === 'vip' ? 95 : 
                              customer.customer_segment === 'loyal' ? 85 :
                              customer.customer_segment === 'returning' ? 70 : 45,
        referral_count: Math.floor(customer.total_orders / 10)
      }
    };
  };

  const analytics = generateAnalytics(customer);

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'vip': return '#8b5cf6';
      case 'loyal': return '#3b82f6';
      case 'returning': return '#10b981';
      case 'new': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.customerHeader}>
            <div className={styles.customerInfo}>
              <h2>{customer.name} - Analytics</h2>
              <span 
                className={styles.segmentBadge}
                style={{ backgroundColor: getSegmentColor(customer.customer_segment) }}
              >
                {customer.customer_segment} customer
              </span>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          {/* Key Metrics */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiBarChart2 /> Key Performance Metrics
            </h3>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ backgroundColor: '#3b82f6' }}>
                  <FiTrendingUp />
                </div>
                <div className={styles.metricInfo}>
                  <span className={styles.metricValue}>{formatCurrency(analytics.loyalty_metrics.lifetime_value)}</span>
                  <span className={styles.metricLabel}>Lifetime Value</span>
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ backgroundColor: '#10b981' }}>
                  <FiTrendingUp />
                </div>
                <div className={styles.metricInfo}>
                  <span className={styles.metricValue}>{formatCurrency(analytics.loyalty_metrics.predicted_value)}</span>
                  <span className={styles.metricLabel}>Predicted Value</span>
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ backgroundColor: '#f59e0b' }}>
                  <FiTarget />
                </div>
                <div className={styles.metricInfo}>
                  <span className={styles.metricValue}>{analytics.loyalty_metrics.retention_probability}%</span>
                  <span className={styles.metricLabel}>Retention Rate</span>
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ backgroundColor: '#8b5cf6' }}>
                  <FiUsers />
                </div>
                <div className={styles.metricInfo}>
                  <span className={styles.metricValue}>{analytics.loyalty_metrics.referral_count}</span>
                  <span className={styles.metricLabel}>Referrals Made</span>
                </div>
              </div>
            </div>
          </div>

          {/* Spending Trend */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiTrendingUp /> Spending Trend (Last 6 Months)
            </h3>
            <div className={styles.chartContainer}>
              <div className={styles.spendingChart}>
                {analytics.spending_trend.map((data, index) => (
                  <div key={data.month} className={styles.chartBar}>
                    <div 
                      className={styles.bar}
                      style={{ 
                        height: `${(data.amount / Math.max(...analytics.spending_trend.map(d => d.amount))) * 100}%`,
                        backgroundColor: '#3b82f6'
                      }}
                    />
                    <span className={styles.barLabel}>{data.month}</span>
                    <span className={styles.barValue}>{formatCurrency(data.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Frequency */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiClock /> Order Frequency Analysis
            </h3>
            <div className={styles.frequencyGrid}>
              <div className={styles.frequencyCard}>
                <FiCalendar className={styles.frequencyIcon} />
                <div>
                  <span className={styles.frequencyValue}>{analytics.order_frequency.weekly_average}</span>
                  <span className={styles.frequencyLabel}>Orders per Week</span>
                </div>
              </div>
              <div className={styles.frequencyCard}>
                <FiShoppingCart className={styles.frequencyIcon} />
                <div>
                  <span className={styles.frequencyValue}>{analytics.order_frequency.monthly_average}</span>
                  <span className={styles.frequencyLabel}>Orders per Month</span>
                </div>
              </div>
              <div className={styles.frequencyCard}>
                <FiStar className={styles.frequencyIcon} />
                <div>
                  <span className={styles.frequencyValue}>{analytics.order_frequency.peak_day}</span>
                  <span className={styles.frequencyLabel}>Peak Day</span>
                </div>
              </div>
              <div className={styles.frequencyCard}>
                <FiClock className={styles.frequencyIcon} />
                <div>
                  <span className={styles.frequencyValue}>{analytics.order_frequency.peak_time}</span>
                  <span className={styles.frequencyLabel}>Peak Time</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Preferences */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiPieChart /> Category Preferences
            </h3>
            <div className={styles.categoryList}>
              {analytics.category_preferences.map((category, index) => (
                <div key={category.category} className={styles.categoryItem}>
                  <div className={styles.categoryInfo}>
                    <span className={styles.categoryName}>{category.category}</span>
                    <span className={styles.categoryAmount}>{formatCurrency(category.amount)}</span>
                  </div>
                  <div className={styles.categoryBar}>
                    <div 
                      className={styles.categoryProgress}
                      style={{ 
                        width: `${category.percentage}%`,
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][index]
                      }}
                    />
                  </div>
                  <span className={styles.categoryPercentage}>{category.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Satisfaction Metrics */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiHeart /> Customer Satisfaction
            </h3>
            <div className={styles.satisfactionGrid}>
              <div className={styles.satisfactionCard}>
                <div className={styles.ratingCircle}>
                  <span className={styles.ratingValue}>{analytics.satisfaction_metrics.overall_rating}</span>
                  <span className={styles.ratingMax}>/5</span>
                </div>
                <span className={styles.ratingLabel}>Overall Rating</span>
              </div>
              <div className={styles.satisfactionCard}>
                <div className={styles.ratingCircle}>
                  <span className={styles.ratingValue}>{analytics.satisfaction_metrics.service_rating}</span>
                  <span className={styles.ratingMax}>/5</span>
                </div>
                <span className={styles.ratingLabel}>Service</span>
              </div>
              <div className={styles.satisfactionCard}>
                <div className={styles.ratingCircle}>
                  <span className={styles.ratingValue}>{analytics.satisfaction_metrics.food_rating}</span>
                  <span className={styles.ratingMax}>/5</span>
                </div>
                <span className={styles.ratingLabel}>Food Quality</span>
              </div>
              <div className={styles.satisfactionCard}>
                <div className={styles.ratingCircle}>
                  <span className={styles.ratingValue}>{analytics.satisfaction_metrics.value_rating}</span>
                  <span className={styles.ratingMax}>/5</span>
                </div>
                <span className={styles.ratingLabel}>Value</span>
              </div>
            </div>
            <div className={styles.reviewsInfo}>
              <FiStar /> Based on {analytics.satisfaction_metrics.total_reviews} reviews
            </div>
          </div>

          {/* Recommendations */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiGift /> Recommendations
            </h3>
            <div className={styles.recommendations}>
              {analytics.loyalty_metrics.retention_probability < 60 && (
                <div className={styles.recommendation}>
                  <FiTarget className={styles.recommendationIcon} />
                  <div>
                    <h4>Retention Risk</h4>
                    <p>Consider offering loyalty rewards or personalized promotions to increase retention.</p>
                  </div>
                </div>
              )}
              {customer.total_orders > 20 && (
                <div className={styles.recommendation}>
                  <FiStar className={styles.recommendationIcon} />
                  <div>
                    <h4>VIP Upgrade</h4>
                    <p>This customer qualifies for VIP status. Consider upgrading their membership.</p>
                  </div>
                </div>
              )}
              <div className={styles.recommendation}>
                <FiHeart className={styles.recommendationIcon} />
                <div>
                  <h4>Personalized Offers</h4>
                  <p>Send targeted promotions for {analytics.category_preferences[0].category.toLowerCase()} based on their preferences.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalyticsModal;
