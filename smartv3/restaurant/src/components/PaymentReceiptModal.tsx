// src/components/PaymentReceiptModal.tsx
import React from 'react';
import { FiX, FiDownload, FiPrinter } from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import { type PaymentReceipt } from '../services/paymentService';
import styles from './PaymentReceiptModal.module.css';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: PaymentReceipt | null;
}

const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt
}) => {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple text receipt
    const receiptText = `
SMART RESTAURANT
Payment Receipt

Transaction ID: ${receipt.transactionId}
Order ID: ${receipt.orderId}
Customer: ${receipt.customerName}
Date: ${new Date(receipt.timestamp).toLocaleString('en-TZ')}

Payment Method: ${receipt.paymentMethod}
${receipt.phoneNumber ? `Phone: ${receipt.phoneNumber}` : ''}
${receipt.cardLast4 ? `Card: ****${receipt.cardLast4}` : ''}
${receipt.cashReceived ? `Cash Received: ${formatCurrency(receipt.cashReceived)}` : ''}

Amount: ${formatCurrency(receipt.amount)}
Tax (15%): ${formatCurrency(receipt.tax)}
Service Charge: ${formatCurrency(receipt.serviceCharge)}
Total: ${formatCurrency(receipt.total)}
${receipt.change ? `Change: ${formatCurrency(receipt.change)}` : ''}

Status: ${receipt.status.toUpperCase()}

Thank you for dining with us!
Smart Restaurant Management System
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${receipt.transactionId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Payment Receipt</h2>
          <div className={styles.headerActions}>
            <button className={styles.actionButton} onClick={handleDownload} title="Download Receipt">
              <FiDownload />
            </button>
            <button className={styles.actionButton} onClick={handlePrint} title="Print Receipt">
              <FiPrinter />
            </button>
            <button className={styles.closeButton} onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.receipt}>
            {/* Restaurant Header */}
            <div className={styles.restaurantHeader}>
              <h1>🇹🇿 Smart Restaurant</h1>
              <p>Professional Restaurant Management</p>
              <p>Tanzania</p>
            </div>

            {/* Receipt Title */}
            <div className={styles.receiptTitle}>
              <h2>PAYMENT RECEIPT</h2>
            </div>

            {/* Transaction Details */}
            <div className={styles.transactionDetails}>
              <div className={styles.detailRow}>
                <span>Transaction ID:</span>
                <span className={styles.transactionId}>{receipt.transactionId}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Order ID:</span>
                <span>#{receipt.orderId}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Customer:</span>
                <span>{receipt.customerName}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Date & Time:</span>
                <span>{new Date(receipt.timestamp).toLocaleString('en-TZ')}</span>
              </div>
            </div>

            {/* Payment Method Details */}
            <div className={styles.paymentDetails}>
              <h3>Payment Information</h3>
              <div className={styles.detailRow}>
                <span>Payment Method:</span>
                <span className={styles.paymentMethod}>{receipt.paymentMethod}</span>
              </div>
              
              {receipt.phoneNumber && (
                <div className={styles.detailRow}>
                  <span>Phone Number:</span>
                  <span>{receipt.phoneNumber}</span>
                </div>
              )}
              
              {receipt.cardLast4 && (
                <div className={styles.detailRow}>
                  <span>Card Number:</span>
                  <span>**** **** **** {receipt.cardLast4}</span>
                </div>
              )}
              
              {receipt.cashReceived && (
                <div className={styles.detailRow}>
                  <span>Cash Received:</span>
                  <span>{formatCurrency(receipt.cashReceived)}</span>
                </div>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className={styles.financialBreakdown}>
              <h3>Payment Breakdown</h3>
              <div className={styles.detailRow}>
                <span>Subtotal:</span>
                <span>{formatCurrency(receipt.amount)}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Tax (15% VAT):</span>
                <span>{formatCurrency(receipt.tax)}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Service Charge:</span>
                <span>{formatCurrency(receipt.serviceCharge)}</span>
              </div>
              
              <div className={styles.separator}></div>
              
              <div className={`${styles.detailRow} ${styles.totalRow}`}>
                <span>Total Paid:</span>
                <span>{formatCurrency(receipt.total)}</span>
              </div>
              
              {receipt.change && receipt.change > 0 && (
                <div className={`${styles.detailRow} ${styles.changeRow}`}>
                  <span>Change Given:</span>
                  <span>{formatCurrency(receipt.change)}</span>
                </div>
              )}
            </div>

            {/* Status */}
            <div className={styles.status}>
              <div className={`${styles.statusBadge} ${styles[receipt.status]}`}>
                {receipt.status === 'success' ? '✅ PAYMENT SUCCESSFUL' : 
                 receipt.status === 'failed' ? '❌ PAYMENT FAILED' : 
                 '⏳ PAYMENT PENDING'}
              </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <p>Thank you for dining with us!</p>
              <p>Smart Restaurant Management System</p>
              <p>For support, contact: +255 XXX XXX XXX</p>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.downloadButton} onClick={handleDownload}>
            <FiDownload /> Download Receipt
          </button>
          <button className={styles.printButton} onClick={handlePrint}>
            <FiPrinter /> Print Receipt
          </button>
          <button className={styles.closeActionButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptModal;
