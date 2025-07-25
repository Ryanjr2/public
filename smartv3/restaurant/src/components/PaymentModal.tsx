// src/components/PaymentModal.tsx
import React, { useState } from 'react';
import { FiX, FiCreditCard, FiSmartphone, FiTrendingUp, FiLoader } from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import { paymentService, type PaymentMethod, type PaymentResponse } from '../services/paymentService';
import styles from './PaymentModal.module.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  customerName: string;
  totalAmount: number;
  onPaymentSuccess: (paymentData: PaymentResponse) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  customerName,
  totalAmount,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'details' | 'processing' | 'result'>('select');
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);

  // M-Pesa form state
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [mpesaPin, setMpesaPin] = useState('');

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Cash form state
  const [receivedAmount, setReceivedAmount] = useState('');
  const [staffMember, setStaffMember] = useState('');

  const paymentMethods = paymentService.getPaymentMethods();

  const resetForm = () => {
    setSelectedMethod(null);
    setPaymentStep('select');
    setPaymentResult(null);
    setIsProcessing(false);
    setMpesaPhone('');
    setMpesaPin('');
    setCardNumber('');
    setExpiryMonth('');
    setExpiryYear('');
    setCvv('');
    setCardholderName('');
    setReceivedAmount('');
    setStaffMember('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setPaymentStep('details');
  };

  const handlePayment = async () => {
    if (!selectedMethod) return;

    // Confirmation dialog for payment
    const confirmMessage = `Confirm payment of ${formatCurrency(totalAmount)} via ${selectedMethod.name}?`;
    if (!confirm(confirmMessage)) return;

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      let result: PaymentResponse;

      switch (selectedMethod.type) {
        case 'mpesa':
          result = await paymentService.processMpesaPayment({
            phoneNumber: mpesaPhone,
            amount: totalAmount,
            orderId,
            customerName
          });
          break;

        case 'card':
          result = await paymentService.processCardPayment({
            cardNumber,
            expiryMonth,
            expiryYear,
            cvv,
            cardholderName,
            amount: totalAmount,
            orderId,
            customerName
          });
          break;

        case 'cash':
          result = await paymentService.processCashPayment({
            amount: totalAmount,
            orderId,
            customerName,
            receivedAmount: parseFloat(receivedAmount),
            staffMember
          });
          break;

        default:
          throw new Error('Invalid payment method');
      }

      setPaymentResult(result);
      setPaymentStep('result');

      if (result.success) {
        onPaymentSuccess(result);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentResult({
        success: false,
        transactionId: '',
        message: 'Payment processing failed. Please try again.',
        paymentMethod: selectedMethod.name,
        amount: totalAmount,
        timestamp: new Date().toISOString()
      });
      setPaymentStep('result');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const isFormValid = () => {
    if (!selectedMethod) return false;

    switch (selectedMethod.type) {
      case 'mpesa':
        return mpesaPhone.length >= 10 && mpesaPin.length === 4;
      case 'card':
        return cardNumber.length >= 13 && expiryMonth && expiryYear && cvv.length >= 3 && cardholderName.length >= 2;
      case 'cash':
        return parseFloat(receivedAmount) >= totalAmount && staffMember.length >= 2;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Payment - {formatCurrency(totalAmount)}</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          {paymentStep === 'select' && (
            <div className={styles.methodSelection}>
              <h3>Select Payment Method</h3>
              <div className={styles.methods}>
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    className={styles.methodButton}
                    onClick={() => handleMethodSelect(method)}
                  >
                    <span className={styles.methodIcon}>{method.icon}</span>
                    <div className={styles.methodInfo}>
                      <h4>{method.name}</h4>
                      <p>{method.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {paymentStep === 'details' && selectedMethod && (
            <div className={styles.paymentDetails}>
              <div className={styles.backButton}>
                <button onClick={() => setPaymentStep('select')}>← Back to methods</button>
              </div>
              
              <h3>{selectedMethod.icon} {selectedMethod.name}</h3>

              {/* Payment Summary */}
              <div className={styles.paymentSummary}>
                <div className={styles.summaryRow}>
                  <span>Order Total:</span>
                  <span>{formatCurrency(totalAmount * 0.87)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Tax (15% VAT):</span>
                  <span>{formatCurrency(totalAmount * 0.13)}</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span>Total to Pay:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {selectedMethod.type === 'mpesa' && (
                <div className={styles.mpesaForm}>
                  <div className={styles.formGroup}>
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+255 712 345 678"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>M-Pesa PIN</label>
                    <input
                      type="password"
                      placeholder="Enter your 4-digit PIN"
                      maxLength={4}
                      value={mpesaPin}
                      onChange={(e) => setMpesaPin(e.target.value.replace(/\D/g, ''))}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.mpesaInfo}>
                    <p><strong>📱 M-Pesa Payment Instructions:</strong></p>
                    <p>• You will receive an M-Pesa prompt on your phone</p>
                    <p>• Enter your M-Pesa PIN when prompted</p>
                    <p>• Make sure your phone has network coverage</p>
                    <p>• Ensure sufficient balance in your M-Pesa account</p>
                  </div>
                </div>
              )}

              {selectedMethod.type === 'card' && (
                <div className={styles.cardForm}>
                  <div className={styles.formGroup}>
                    <label>Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Expiry Month</label>
                      <select
                        value={expiryMonth}
                        onChange={(e) => setExpiryMonth(e.target.value)}
                        className={styles.select}
                      >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                            {String(i + 1).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Expiry Year</label>
                      <select
                        value={expiryYear}
                        onChange={(e) => setExpiryYear(e.target.value)}
                        className={styles.select}
                      >
                        <option value="">YYYY</option>
                        {Array.from({ length: 10 }, (_, i) => (
                          <option key={i} value={String(new Date().getFullYear() + i)}>
                            {new Date().getFullYear() + i}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        className={styles.input}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>
              )}

              {selectedMethod.type === 'cash' && (
                <div className={styles.cashForm}>
                  <div className={styles.formGroup}>
                    <label>Amount Received</label>
                    <input
                      type="number"
                      placeholder="Enter amount received"
                      value={receivedAmount}
                      onChange={(e) => setReceivedAmount(e.target.value)}
                      className={styles.input}
                      min={totalAmount}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Staff Member</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={staffMember}
                      onChange={(e) => setStaffMember(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  {receivedAmount && parseFloat(receivedAmount) > totalAmount && (
                    <div className={styles.changeInfo}>
                      <p>Change: {formatCurrency(parseFloat(receivedAmount) - totalAmount)}</p>
                    </div>
                  )}
                </div>
              )}

              <button
                className={styles.payButton}
                onClick={handlePayment}
                disabled={!isFormValid()}
              >
                Pay {formatCurrency(totalAmount)}
              </button>
            </div>
          )}

          {paymentStep === 'processing' && (
            <div className={styles.processing}>
              <FiLoader className={styles.spinner} />
              <h3>Processing Payment...</h3>
              <p>Please wait while we process your payment</p>
              {selectedMethod?.type === 'mpesa' && (
                <p className={styles.mpesaPrompt}>Check your phone for M-Pesa prompt</p>
              )}
            </div>
          )}

          {paymentStep === 'result' && paymentResult && (
            <div className={styles.result}>
              <div className={`${styles.resultIcon} ${paymentResult.success ? styles.success : styles.error}`}>
                {paymentResult.success ? '✅' : '❌'}
              </div>
              <h3>{paymentResult.success ? 'Payment Successful!' : 'Payment Failed'}</h3>
              <p className={styles.resultMessage}>{paymentResult.message}</p>
              
              {paymentResult.success && paymentResult.receiptData && (
                <div className={styles.receiptInfo}>
                  <p><strong>Transaction ID:</strong> {paymentResult.transactionId}</p>
                  <p><strong>Amount:</strong> {formatCurrency(paymentResult.amount)}</p>
                  <p><strong>Method:</strong> {paymentResult.paymentMethod}</p>
                </div>
              )}

              <div className={styles.resultActions}>
                {paymentResult.success ? (
                  <button className={styles.doneButton} onClick={handleClose}>
                    Done
                  </button>
                ) : (
                  <>
                    <button className={styles.retryButton} onClick={() => setPaymentStep('details')}>
                      Try Again
                    </button>
                    <button className={styles.cancelButton} onClick={handleClose}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
