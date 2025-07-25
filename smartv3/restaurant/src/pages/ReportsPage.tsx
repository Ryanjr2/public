// src/pages/ReportsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  FiCalendar, FiTrendingUp, FiUsers,
  FiShoppingCart, FiClock, FiStar, FiDownload,
  FiFilter, FiRefreshCw, FiBarChart2, FiPieChart
} from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import { reportingService, type DailySalesReport, type CompletedOrder } from '../services/reportingService';
import { simplePdfService } from '../services/simplePdfService';
import styles from './Reports.module.css';

const ReportsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [dailyReport, setDailyReport] = useState<DailySalesReport | null>(null);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReportData();
    
    // Subscribe to new completed orders
    const unsubscribe = reportingService.onOrderCompleted((order) => {
      console.log('📊 New order completed, refreshing reports:', order.order_number);
      loadReportData();
    });

    return () => {
      // In a real app, you'd unsubscribe here
    };
  }, [selectedDate, reportType]);

  const loadReportData = () => {
    setLoading(true);
    
    try {
      // Load daily report
      const report = reportingService.getDailySalesReport(selectedDate);
      setDailyReport(report);
      
      // Load all completed orders
      const orders = reportingService.getAllCompletedOrders();
      setCompletedOrders(orders);
      
      console.log('📊 Reports loaded:', { report, ordersCount: orders.length });
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!dailyReport) return;

    const reportData = {
      date: dailyReport.date,
      summary: {
        total_orders: dailyReport.total_orders,
        total_revenue: dailyReport.total_revenue,
        average_order_value: dailyReport.average_order_value,
        net_revenue: dailyReport.net_revenue
      },
      orders_by_type: dailyReport.orders_by_type,
      top_selling_items: dailyReport.top_selling_items,
      payment_methods: dailyReport.payment_methods
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-report-${selectedDate}.json`;
    link.click();

    alert('📊 Report exported as JSON successfully!');
  };

  const exportToPDF = async () => {
    if (!dailyReport) {
      alert('No report data available to export');
      return;
    }

    try {
      console.log('🔄 Attempting PDF generation with data:', { dailyReport, completedOrders });
      await simplePdfService.generateDailySalesReport(dailyReport, completedOrders);
      alert('📄 PDF report generated successfully!');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert(`Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const exportOrderToPDF = async (order: CompletedOrder) => {
    try {
      console.log('🔄 Attempting order PDF generation with data:', order);
      await simplePdfService.generateOrderDetailsPDF(order);
      alert(`📄 Order ${order.order_number} receipt generated!`);
    } catch (error) {
      console.error('Failed to generate order PDF:', error);
      alert(`Failed to generate order receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearAllData = () => {
    if (confirm('⚠️ This will clear ALL sales data. Are you sure?')) {
      reportingService.clearAllData();
      loadReportData();
      alert('🗑️ All data cleared');
    }
  };

  const generateSampleData = () => {
    reportingService.generateSampleData();
    loadReportData();
    alert('📊 Sample data generated');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading reports...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sales Reports & Analytics</h1>
          <p className={styles.subtitle}>Comprehensive business intelligence and sales analytics</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.pdfButton} onClick={exportToPDF}>
            <FiDownload /> Export PDF
          </button>
          <button className={styles.exportButton} onClick={exportReport}>
            <FiDownload /> Export JSON
          </button>
          <button className={styles.refreshButton} onClick={loadReportData}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.dateControl}>
          <FiCalendar className={styles.controlIcon} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>
        
        <div className={styles.reportTypeControl}>
          <FiFilter className={styles.controlIcon} />
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className={styles.select}
          >
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
          </select>
        </div>

        <div className={styles.dataActions}>
          <button className={styles.sampleButton} onClick={generateSampleData}>
            📊 Generate Sample Data
          </button>
          <button className={styles.clearButton} onClick={clearAllData}>
            🗑️ Clear All Data
          </button>
        </div>
      </div>

      {dailyReport && (
        <>
          {/* Key Metrics */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#3b82f6' }}>
                <FiShoppingCart />
              </div>
              <div className={styles.metricInfo}>
                <h3>Total Orders</h3>
                <p className={styles.metricValue}>{dailyReport.total_orders}</p>
                <span className={styles.metricLabel}>orders completed</span>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#10b981' }}>
                <FiTrendingUp />
              </div>
              <div className={styles.metricInfo}>
                <h3>Total Revenue</h3>
                <p className={styles.metricValue}>{formatCurrency(dailyReport.total_revenue)}</p>
                <span className={styles.metricLabel}>gross sales</span>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#8b5cf6' }}>
                <FiTrendingUp />
              </div>
              <div className={styles.metricInfo}>
                <h3>Average Order</h3>
                <p className={styles.metricValue}>{formatCurrency(dailyReport.average_order_value)}</p>
                <span className={styles.metricLabel}>per order</span>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#f59e0b' }}>
                <FiClock />
              </div>
              <div className={styles.metricInfo}>
                <h3>Avg Prep Time</h3>
                <p className={styles.metricValue}>{Math.round(dailyReport.average_preparation_time)}m</p>
                <span className={styles.metricLabel}>kitchen efficiency</span>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#ef4444' }}>
                <FiStar />
              </div>
              <div className={styles.metricInfo}>
                <h3>Customer Rating</h3>
                <p className={styles.metricValue}>{dailyReport.customer_satisfaction.toFixed(1)}/5</p>
                <span className={styles.metricLabel}>satisfaction</span>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#06b6d4' }}>
                <FiTrendingUp />
              </div>
              <div className={styles.metricInfo}>
                <h3>Net Revenue</h3>
                <p className={styles.metricValue}>{formatCurrency(dailyReport.net_revenue)}</p>
                <span className={styles.metricLabel}>after tax & discounts</span>
              </div>
            </div>
          </div>

          {/* Order Types Breakdown */}
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h3>Orders by Type</h3>
              <div className={styles.orderTypesChart}>
                {Object.entries(dailyReport.orders_by_type).map(([type, data]) => (
                  <div key={type} className={styles.orderTypeItem}>
                    <div className={styles.orderTypeInfo}>
                      <span className={styles.orderTypeName}>{type.replace('_', ' ')}</span>
                      <span className={styles.orderTypeCount}>{data.count} orders</span>
                    </div>
                    <div className={styles.orderTypeRevenue}>
                      {formatCurrency(data.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3>Payment Methods</h3>
              <div className={styles.paymentMethodsChart}>
                {dailyReport.payment_methods.map((method, index) => (
                  <div key={index} className={styles.paymentMethodItem}>
                    <div className={styles.paymentMethodInfo}>
                      <span className={styles.paymentMethodName}>{method.method}</span>
                      <span className={styles.paymentMethodCount}>{method.count} transactions</span>
                    </div>
                    <div className={styles.paymentMethodAmount}>
                      {formatCurrency(method.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Selling Items */}
          <div className={styles.topItemsCard}>
            <h3>Top Selling Items</h3>
            <div className={styles.topItemsList}>
              {dailyReport.top_selling_items.slice(0, 10).map((item, index) => (
                <div key={index} className={styles.topItem}>
                  <div className={styles.topItemRank}>#{index + 1}</div>
                  <div className={styles.topItemInfo}>
                    <span className={styles.topItemName}>{item.name}</span>
                    <span className={styles.topItemQuantity}>{item.quantity} sold</span>
                  </div>
                  <div className={styles.topItemRevenue}>
                    {formatCurrency(item.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className={styles.recentOrdersCard}>
            <h3>Recent Completed Orders</h3>
            <div className={styles.recentOrdersList}>
              {completedOrders.slice(-10).reverse().map((order) => (
                <div key={order.id} className={styles.recentOrder}>
                  <div className={styles.recentOrderInfo}>
                    <span className={styles.recentOrderNumber}>{order.order_number}</span>
                    <span className={styles.recentOrderCustomer}>{order.customer_name}</span>
                    <span className={styles.recentOrderType}>{order.order_type}</span>
                  </div>
                  <div className={styles.recentOrderDetails}>
                    <div className={styles.recentOrderMeta}>
                      <span className={styles.recentOrderTime}>
                        {new Date(order.completed_at).toLocaleTimeString()}
                      </span>
                      <span className={styles.recentOrderAmount}>
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                    <button
                      className={styles.orderPdfButton}
                      onClick={() => exportOrderToPDF(order)}
                      title="Export order receipt as PDF"
                    >
                      <FiDownload />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!dailyReport && (
        <div className={styles.emptyState}>
          <FiBarChart2 size={48} />
          <h3>No sales data available</h3>
          <p>Complete some orders in the kitchen to see reports here</p>
          <button className={styles.sampleButton} onClick={generateSampleData}>
            📊 Generate Sample Data
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
