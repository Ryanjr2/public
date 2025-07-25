// src/pages/PaymentHistoryPage.tsx
import React, { useState, useEffect } from 'react';
import {
  FiCreditCard, FiSmartphone, FiTrendingUp, FiCalendar,
  FiFilter, FiDownload, FiEye, FiRefreshCw, FiSearch
} from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import { paymentService, type PaymentReceipt } from '../services/paymentService';
import PaymentReceiptModal from '../components/PaymentReceiptModal';
import styles from './PaymentHistory.module.css';

const PaymentHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<PaymentReceipt[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, selectedMethod, selectedStatus, searchTerm]);

  const loadTransactions = () => {
    setLoading(true);
    try {
      const history = paymentService.getTransactionHistory();
      setTransactions(history);
      console.log('💳 Loaded payment history:', history.length);
    } catch (error) {
      console.error('Failed to load payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by payment method
    if (selectedMethod !== 'all') {
      filtered = filtered.filter(t => t.paymentMethod.toLowerCase().includes(selectedMethod.toLowerCase()));
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(t => t.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.orderId.toString().includes(searchTerm)
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleViewReceipt = (receipt: PaymentReceipt) => {
    setSelectedReceipt(receipt);
    setShowReceiptModal(true);
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Transaction ID', 'Order ID', 'Customer', 'Payment Method', 'Amount', 'Status', 'Date'].join(','),
      ...filteredTransactions.map(t => [
        t.transactionId,
        t.orderId,
        t.customerName,
        t.paymentMethod,
        t.total,
        t.status,
        new Date(t.timestamp).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'm-pesa':
        return <FiSmartphone />;
      case 'card':
        return <FiCreditCard />;
      case 'cash':
        return <FiTrendingUp />;
      default:
        return <FiTrendingUp />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const totalRevenue = filteredTransactions
    .filter(t => t.status === 'success')
    .reduce((sum, t) => sum + t.total, 0);

  const totalTransactions = filteredTransactions.length;
  const successfulTransactions = filteredTransactions.filter(t => t.status === 'success').length;
  const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading payment history...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Payment History</h1>
          <p className={styles.subtitle}>Track all payment transactions and receipts</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.exportButton} onClick={exportTransactions}>
            <FiDownload /> Export CSV
          </button>
          <button className={styles.refreshButton} onClick={loadTransactions}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <div className={styles.cardIcon} style={{ backgroundColor: '#3b82f6' }}>
            <FiTrendingUp />
          </div>
          <div className={styles.cardInfo}>
            <h3>Total Revenue</h3>
            <p className={styles.cardValue}>{formatCurrency(totalRevenue)}</p>
            <span className={styles.cardLabel}>from successful payments</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.cardIcon} style={{ backgroundColor: '#10b981' }}>
            <FiCreditCard />
          </div>
          <div className={styles.cardInfo}>
            <h3>Total Transactions</h3>
            <p className={styles.cardValue}>{totalTransactions}</p>
            <span className={styles.cardLabel}>payment attempts</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.cardIcon} style={{ backgroundColor: '#8b5cf6' }}>
            <FiCalendar />
          </div>
          <div className={styles.cardInfo}>
            <h3>Success Rate</h3>
            <p className={styles.cardValue}>{successRate.toFixed(1)}%</p>
            <span className={styles.cardLabel}>successful payments</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by transaction ID, customer, or order..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <FiFilter className={styles.filterIcon} />
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Payment Methods</option>
            <option value="m-pesa">M-Pesa</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Statuses</option>
            <option value="success">Successful</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className={styles.transactionsTable}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>Transaction</div>
          <div className={styles.headerCell}>Customer</div>
          <div className={styles.headerCell}>Payment Method</div>
          <div className={styles.headerCell}>Amount</div>
          <div className={styles.headerCell}>Status</div>
          <div className={styles.headerCell}>Date</div>
          <div className={styles.headerCell}>Actions</div>
        </div>

        <div className={styles.tableBody}>
          {filteredTransactions.map((transaction) => (
            <div key={transaction.transactionId} className={styles.tableRow}>
              <div className={styles.tableCell}>
                <div className={styles.transactionInfo}>
                  <span className={styles.transactionId}>{transaction.transactionId}</span>
                  <span className={styles.orderId}>Order #{transaction.orderId}</span>
                </div>
              </div>
              <div className={styles.tableCell}>
                <span className={styles.customerName}>{transaction.customerName}</span>
              </div>
              <div className={styles.tableCell}>
                <div className={styles.paymentMethod}>
                  {getPaymentMethodIcon(transaction.paymentMethod)}
                  <span>{transaction.paymentMethod}</span>
                </div>
              </div>
              <div className={styles.tableCell}>
                <span className={styles.amount}>{formatCurrency(transaction.total)}</span>
              </div>
              <div className={styles.tableCell}>
                <span
                  className={styles.status}
                  style={{ backgroundColor: getStatusColor(transaction.status) }}
                >
                  {transaction.status}
                </span>
              </div>
              <div className={styles.tableCell}>
                <span className={styles.date}>
                  {new Date(transaction.timestamp).toLocaleDateString('en-TZ')}
                </span>
                <span className={styles.time}>
                  {new Date(transaction.timestamp).toLocaleTimeString('en-TZ', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className={styles.tableCell}>
                <button
                  className={styles.viewReceiptButton}
                  onClick={() => handleViewReceipt(transaction)}
                >
                  <FiEye /> View Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredTransactions.length === 0 && (
        <div className={styles.emptyState}>
          <FiCreditCard size={48} />
          <h3>No transactions found</h3>
          <p>No payment transactions match your current filters</p>
        </div>
      )}

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
};

export default PaymentHistoryPage;
