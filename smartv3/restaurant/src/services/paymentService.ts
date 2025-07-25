// src/services/paymentService.ts

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'mpesa' | 'card' | 'cash';
  icon: string;
  description: string;
  enabled: boolean;
}

export interface MpesaPaymentRequest {
  phoneNumber: string;
  amount: number;
  orderId: number;
  customerName: string;
}

export interface CardPaymentRequest {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  amount: number;
  orderId: number;
  customerName: string;
}

export interface CashPaymentRequest {
  amount: number;
  orderId: number;
  customerName: string;
  receivedAmount: number;
  staffMember: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  message: string;
  paymentMethod: string;
  amount: number;
  timestamp: string;
  receiptData?: PaymentReceipt;
}

export interface PaymentReceipt {
  transactionId: string;
  orderId: number;
  customerName: string;
  paymentMethod: string;
  amount: number;
  tax: number;
  serviceCharge: number;
  total: number;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  phoneNumber?: string;
  cardLast4?: string;
  cashReceived?: number;
  change?: number;
}

class PaymentService {
  private paymentMethods: PaymentMethod[] = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      type: 'mpesa',
      icon: '📱',
      description: 'Pay with your M-Pesa mobile money',
      enabled: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      type: 'card',
      icon: '💳',
      description: 'Pay with Visa, Mastercard, or local cards',
      enabled: true
    },
    {
      id: 'cash',
      name: 'Cash Payment',
      type: 'cash',
      icon: '💵',
      description: 'Pay with cash at the restaurant',
      enabled: true
    }
  ];

  private transactions: PaymentReceipt[] = [];

  // Get available payment methods
  getPaymentMethods(): PaymentMethod[] {
    return this.paymentMethods.filter(method => method.enabled);
  }

  // Simulate M-Pesa payment
  async processMpesaPayment(request: MpesaPaymentRequest): Promise<PaymentResponse> {
    console.log('🔄 Processing M-Pesa payment...', request);
    
    // Simulate API call delay
    await this.delay(2000);
    
    // Validate phone number (Tanzania format)
    if (!this.isValidTanzanianPhone(request.phoneNumber)) {
      return {
        success: false,
        transactionId: '',
        message: 'Invalid phone number. Please use Tanzania format: +255XXXXXXXXX (e.g., +255712345678)',
        paymentMethod: 'M-Pesa',
        amount: request.amount,
        timestamp: new Date().toISOString()
      };
    }

    // Validate amount
    if (request.amount <= 0) {
      return {
        success: false,
        transactionId: '',
        message: 'Invalid amount. Payment amount must be greater than zero.',
        paymentMethod: 'M-Pesa',
        amount: request.amount,
        timestamp: new Date().toISOString()
      };
    }

    // Simulate random success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      const transactionId = this.generateTransactionId('MP');
      const receipt = this.createPaymentReceipt({
        transactionId,
        orderId: request.orderId,
        customerName: request.customerName,
        paymentMethod: 'M-Pesa',
        amount: request.amount,
        phoneNumber: request.phoneNumber,
        status: 'success'
      });
      
      this.transactions.push(receipt);
      
      return {
        success: true,
        transactionId,
        message: `Payment successful! M-Pesa confirmation: ${transactionId}`,
        paymentMethod: 'M-Pesa',
        amount: request.amount,
        timestamp: new Date().toISOString(),
        receiptData: receipt
      };
    } else {
      return {
        success: false,
        transactionId: '',
        message: 'Payment failed. Please check your M-Pesa balance and try again.',
        paymentMethod: 'M-Pesa',
        amount: request.amount,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Simulate card payment
  async processCardPayment(request: CardPaymentRequest): Promise<PaymentResponse> {
    console.log('🔄 Processing card payment...', request);
    
    // Simulate API call delay
    await this.delay(3000);
    
    // Validate card details
    if (!this.isValidCardNumber(request.cardNumber)) {
      return {
        success: false,
        transactionId: '',
        message: 'Invalid card number. Please check and try again.',
        paymentMethod: 'Card',
        amount: request.amount,
        timestamp: new Date().toISOString()
      };
    }

    if (!this.isValidCVV(request.cvv)) {
      return {
        success: false,
        transactionId: '',
        message: 'Invalid CVV. Please check the 3-digit code on your card.',
        paymentMethod: 'Card',
        amount: request.amount,
        timestamp: new Date().toISOString()
      };
    }

    // Simulate random success/failure (85% success rate)
    const isSuccess = Math.random() > 0.15;
    
    if (isSuccess) {
      const transactionId = this.generateTransactionId('CD');
      const cardLast4 = request.cardNumber.slice(-4);
      const receipt = this.createPaymentReceipt({
        transactionId,
        orderId: request.orderId,
        customerName: request.customerName,
        paymentMethod: 'Card',
        amount: request.amount,
        cardLast4,
        status: 'success'
      });
      
      this.transactions.push(receipt);
      
      return {
        success: true,
        transactionId,
        message: `Payment successful! Card ending in ${cardLast4}`,
        paymentMethod: 'Card',
        amount: request.amount,
        timestamp: new Date().toISOString(),
        receiptData: receipt
      };
    } else {
      return {
        success: false,
        transactionId: '',
        message: 'Payment declined. Please check your card details or try another card.',
        paymentMethod: 'Card',
        amount: request.amount,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Process cash payment
  async processCashPayment(request: CashPaymentRequest): Promise<PaymentResponse> {
    console.log('🔄 Processing cash payment...', request);
    
    // Simulate processing delay
    await this.delay(1000);
    
    if (request.receivedAmount < request.amount) {
      return {
        success: false,
        transactionId: '',
        message: `Insufficient amount. Required: TSh ${request.amount.toLocaleString()}, Received: TSh ${request.receivedAmount.toLocaleString()}`,
        paymentMethod: 'Cash',
        amount: request.amount,
        timestamp: new Date().toISOString()
      };
    }

    const transactionId = this.generateTransactionId('CS');
    const change = request.receivedAmount - request.amount;
    const receipt = this.createPaymentReceipt({
      transactionId,
      orderId: request.orderId,
      customerName: request.customerName,
      paymentMethod: 'Cash',
      amount: request.amount,
      cashReceived: request.receivedAmount,
      change,
      status: 'success'
    });
    
    this.transactions.push(receipt);
    
    return {
      success: true,
      transactionId,
      message: change > 0 
        ? `Payment successful! Change: TSh ${change.toLocaleString()}`
        : 'Payment successful!',
      paymentMethod: 'Cash',
      amount: request.amount,
      timestamp: new Date().toISOString(),
      receiptData: receipt
    };
  }

  // Get transaction history
  getTransactionHistory(): PaymentReceipt[] {
    return [...this.transactions].reverse(); // Most recent first
  }

  // Get transaction by ID
  getTransaction(transactionId: string): PaymentReceipt | null {
    return this.transactions.find(t => t.transactionId === transactionId) || null;
  }

  // Helper methods
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateTransactionId(prefix: string): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp.slice(-6)}${random}`;
  }

  private isValidTanzanianPhone(phone: string): boolean {
    // Tanzania phone format: +255XXXXXXXXX or 255XXXXXXXXX or 0XXXXXXXXX
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return /^(\+?255|0)[67]\d{8}$/.test(cleanPhone);
  }

  private isValidCardNumber(cardNumber: string): boolean {
    // Basic Luhn algorithm check
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleanNumber)) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  private isValidCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }

  private createPaymentReceipt(data: Partial<PaymentReceipt>): PaymentReceipt {
    const baseAmount = data.amount || 0;
    const tax = baseAmount * 0.15; // 15% VAT
    const serviceCharge = data.paymentMethod === 'Cash' ? 0 : baseAmount * 0.02; // 2% service charge for electronic payments
    const total = baseAmount + tax + serviceCharge;

    return {
      transactionId: data.transactionId || '',
      orderId: data.orderId || 0,
      customerName: data.customerName || '',
      paymentMethod: data.paymentMethod || '',
      amount: baseAmount,
      tax,
      serviceCharge,
      total,
      timestamp: new Date().toISOString(),
      status: data.status || 'success',
      phoneNumber: data.phoneNumber,
      cardLast4: data.cardLast4,
      cashReceived: data.cashReceived,
      change: data.change
    };
  }
}

export const paymentService = new PaymentService();
