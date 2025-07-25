// src/pages/PaymentProcessing.tsx
import React, { useState, useEffect } from 'react';
import {
  FiCreditCard, FiTrendingUp, FiCheck, FiX, FiClock,
  FiSmartphone, FiPrinter, FiRefreshCw, FiEye,
  FiDownload, FiSearch, FiFilter, FiAlertCircle
} from 'react-icons/fi';
import { usePermissions } from '../hooks/usePermissions';
import api from '../services/api';
import { formatDisplayCurrency } from '../utils/currency';
import styles from './Dashboard.module.css';

interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  tableNumber?: string;
  customerName?: string;
  amount: number;
  method: 'cash' | 'card' | 'mobile' | 'corporate';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  timestamp: string;
  reference?: string;
  tip?: number;
  tax: number;
  discount?: number;
  serverName?: string;
  receiptPrinted: boolean;
  notes?: string;
}

interface PaymentStats {
  todayTotal: number;
  todayCount: number;
  pendingAmount: number;
  pendingCount: number;
  avgTransactionValue: number;
  cashTotal: number;
  cardTotal: number;
  mobileTotal: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'mobile' | 'corporate';
  enabled: boolean;
  icon: string;
  processingFee?: number;
}

const PaymentProcessing: React.FC = () => {
  const { canProcessPayments, isServer, user } = usePermissions();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const paymentMethods: PaymentMethod[] = [
    { id: 'cash', name: 'Cash', type: 'cash', enabled: true, icon: 'FiTrendingUp' },
    { id: 'card', name: 'Credit/Debit Card', type: 'card', enabled: true, icon: 'FiCreditCard', processingFee: 0.025 },
    { id: 'mpesa', name: 'M-Pesa', type: 'mobile', enabled: true, icon: 'FiSmartphone', processingFee: 0.015 },
    { id: 'tigopesa', name: 'Tigo Pesa', type: 'mobile', enabled: true, icon: 'FiSmartphone', processingFee: 0.015 },
    { id: 'corporate', name: 'Corporate Account', type: 'corporate', enabled: true, icon: 'FiCreditCard' }
  ];

  useEffect(() => {
    if (canProcessPayments()) {
      fetchPaymentData();
      // Set up real-time updates
      const interval = setInterval(fetchPaymentData, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const [paymentsResponse, statsResponse] = await Promise.all([
        api.get('/payments/'),
        api.get('/payments/stats/')
      ]);
      
      setPayments(paymentsResponse.data || mockPayments);
      setStats(statsResponse.data || mockStats);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      // Use mock data for development
      setPayments(mockPayments);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (paymentData: {
    orderId: string;
    amount: number;
    method: string;
    tip?: number;
    reference?: string;
  }) => {
    try {
      const response = await api.post('/payments/process/', {
        ...paymentData,
        serverName: user?.firstName || user?.username,
        timestamp: new Date().toISOString()
      });
      
      if (response.data.success) {
        await fetchPaymentData();
        setShowProcessModal(false);
        // Print receipt if needed
        if (response.data.receiptData) {
          printReceipt(response.data.receiptData);
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const refundPayment = async (paymentId: string, reason: string) => {
    try {
      await api.post(`/payments/${paymentId}/refund/`, { reason });
      await fetchPaymentData();
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  };

  const printReceipt = (receiptData: any) => {
    // Implement receipt printing logic
    console.log('Printing receipt:', receiptData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'failed': return '#ef4444';
      case 'refunded': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FiCheck className="text-green-500" />;
      case 'pending': return <FiClock className="text-yellow-500" />;
      case 'processing': return <FiRefreshCw className="text-blue-500 animate-spin" />;
      case 'failed': return <FiX className="text-red-500" />;
      case 'refunded': return <FiAlertCircle className="text-purple-500" />;
      default: return <FiClock className="text-gray-500" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <FiTrendingUp className="text-green-600" />;
      case 'card': return <FiCreditCard className="text-blue-600" />;
      case 'mobile': return <FiSmartphone className="text-purple-600" />;
      case 'corporate': return <FiCreditCard className="text-orange-600" />;
      default: return <FiTrendingUp className="text-gray-600" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  if (!canProcessPayments()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access payment processing.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <FiCreditCard className={styles.titleIcon} />
              Payment Processing
            </h1>
            <p className={styles.subtitle}>
              Process payments, manage transactions, and handle refunds
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchPaymentData}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            >
              <FiRefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={() => setShowProcessModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <FiCreditCard className="h-4 w-4" />
              <span>Process Payment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#10b981' }}>
                <FiTrendingUp />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Today's Total</h3>
              <p className={styles.metricValue}>{formatDisplayCurrency(stats.todayTotal)}</p>
              <span className="text-sm text-gray-500">{stats.todayCount} transactions</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#f59e0b' }}>
                <FiClock />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Pending</h3>
              <p className={styles.metricValue}>{formatDisplayCurrency(stats.pendingAmount)}</p>
              <span className="text-sm text-gray-500">{stats.pendingCount} payments</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#3b82f6' }}>
                <FiCreditCard />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Avg Transaction</h3>
              <p className={styles.metricValue}>{formatDisplayCurrency(stats.avgTransactionValue)}</p>
              <span className="text-sm text-gray-500">Per payment</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#8b5cf6' }}>
                <FiSmartphone />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Mobile Payments</h3>
              <p className={styles.metricValue}>{formatDisplayCurrency(stats.mobileTotal)}</p>
              <span className="text-sm text-gray-500">M-Pesa & others</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Quick Access */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {paymentMethods.map(method => (
            <button
              key={method.id}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                method.enabled 
                  ? 'border-green-200 hover:border-green-400 hover:bg-green-50' 
                  : 'border-gray-200 bg-gray-50 cursor-not-allowed'
              }`}
              disabled={!method.enabled}
            >
              <div className="flex justify-center mb-2">
                {getMethodIcon(method.type)}
              </div>
              <p className="text-sm font-medium">{method.name}</p>
              {method.processingFee && (
                <p className="text-xs text-gray-500">
                  {(method.processingFee * 100).toFixed(1)}% fee
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile">Mobile</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredPayments.length} of {payments.length} payments
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.map(payment => (
              <PaymentRow 
                key={payment.id} 
                payment={payment}
                onSelect={() => setSelectedPayment(payment)}
                onRefund={(reason) => refundPayment(payment.id, reason)}
                onPrintReceipt={() => printReceipt(payment)}
                canRefund={payment.status === 'completed'}
              />
            ))}
          </tbody>
        </table>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <FiCreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

// Payment Row Component
const PaymentRow: React.FC<{
  payment: Payment;
  onSelect: () => void;
  onRefund: (reason: string) => void;
  onPrintReceipt: () => void;
  canRefund: boolean;
}> = ({ payment, onSelect, onRefund, onPrintReceipt, canRefund }) => {
  const [showRefundModal, setShowRefundModal] = useState(false);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <FiTrendingUp className="text-green-600" />;
      case 'card': return <FiCreditCard className="text-blue-600" />;
      case 'mobile': return <FiSmartphone className="text-purple-600" />;
      case 'corporate': return <FiCreditCard className="text-orange-600" />;
      default: return <FiTrendingUp className="text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FiCheck className="text-green-500" />;
      case 'pending': return <FiClock className="text-yellow-500" />;
      case 'processing': return <FiRefreshCw className="text-blue-500 animate-spin" />;
      case 'failed': return <FiX className="text-red-500" />;
      case 'refunded': return <FiAlertCircle className="text-purple-500" />;
      default: return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'failed': return '#ef4444';
      case 'refunded': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="font-medium text-gray-900">#{payment.orderNumber}</div>
          <div className="text-sm text-gray-500">
            {payment.tableNumber ? `Table ${payment.tableNumber}` : 'Takeaway'}
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {payment.customerName || 'Walk-in Customer'}
        </div>
        {payment.serverName && (
          <div className="text-sm text-gray-500">Server: {payment.serverName}</div>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {formatDisplayCurrency(payment.amount)}
        </div>
        {payment.tip && payment.tip > 0 && (
          <div className="text-sm text-green-600">
            +{formatDisplayCurrency(payment.tip)} tip
          </div>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getMethodIcon(payment.method)}
          <span className="ml-2 text-sm text-gray-900 capitalize">
            {payment.method}
          </span>
        </div>
        {payment.reference && (
          <div className="text-xs text-gray-500">Ref: {payment.reference}</div>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getStatusIcon(payment.status)}
          <span 
            className="ml-2 text-sm font-medium capitalize"
            style={{ color: getStatusColor(payment.status) }}
          >
            {payment.status}
          </span>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(payment.timestamp).toLocaleString()}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={onSelect}
            className="text-blue-600 hover:text-blue-900"
            title="View details"
          >
            <FiEye className="h-4 w-4" />
          </button>
          
          <button
            onClick={onPrintReceipt}
            className="text-green-600 hover:text-green-900"
            title="Print receipt"
          >
            <FiPrinter className="h-4 w-4" />
          </button>
          
          {canRefund && (
            <button
              onClick={() => setShowRefundModal(true)}
              className="text-red-600 hover:text-red-900"
              title="Process refund"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
          
          <button
            className="text-gray-600 hover:text-gray-900"
            title="Download receipt"
          >
            <FiDownload className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Mock data for development
const mockPayments: Payment[] = [
  {
    id: '1',
    orderId: 'ord-1',
    orderNumber: 'ORD-001',
    tableNumber: '5',
    customerName: 'John Doe',
    amount: 45000,
    method: 'card',
    status: 'completed',
    timestamp: new Date().toISOString(),
    reference: 'TXN-123456',
    tip: 5000,
    tax: 6750,
    serverName: 'Alice Johnson',
    receiptPrinted: true
  },
  {
    id: '2',
    orderId: 'ord-2',
    orderNumber: 'ORD-002',
    customerName: 'Jane Smith',
    amount: 32000,
    method: 'mobile',
    status: 'pending',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    reference: 'MPESA-789012',
    tax: 4800,
    serverName: 'Bob Wilson',
    receiptPrinted: false
  }
];

const mockStats: PaymentStats = {
  todayTotal: 850000,
  todayCount: 45,
  pendingAmount: 125000,
  pendingCount: 3,
  avgTransactionValue: 47500,
  cashTotal: 320000,
  cardTotal: 380000,
  mobileTotal: 150000
};

export default PaymentProcessing;
