// src/services/corporateService.ts

export interface CorporateAccount {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
  creditLimit: number;
  currentBalance: number;
  paymentTerms: number; // days
  status: 'active' | 'suspended' | 'inactive';
  contractStartDate: string;
  contractEndDate?: string;
  billingAddress: string;
  accountManager: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CorporateEmployee {
  id: number;
  corporateAccountId: number;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  dailyLimit: number;
  monthlyLimit: number;
  status: 'active' | 'suspended' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CorporateOrder {
  id: number;
  orderNumber: string;
  corporateAccountId: number;
  employeeId: number;
  employeeName: string;
  department: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  orderDate: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
}

export interface CorporateInvoice {
  id: number;
  invoiceNumber: string;
  corporateAccountId: number;
  companyName: string;
  billingPeriod: {
    startDate: string;
    endDate: string;
  };
  orders: CorporateOrder[];
  employeeBreakdown: Array<{
    employeeId: number;
    employeeName: string;
    department: string;
    totalOrders: number;
    totalSpent: number;
    dailyAverage: number;
  }>;
  departmentBreakdown: Array<{
    department: string;
    employeeCount: number;
    totalOrders: number;
    totalSpent: number;
    averagePerEmployee: number;
  }>;
  summary: {
    totalOrders: number;
    totalEmployees: number;
    subtotal: number;
    tax: number;
    serviceCharges: number;
    total: number;
    averageOrderValue: number;
    topSpendingDepartment: string;
    topSpendingEmployee: string;
  };
  dueDate: string;
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'paid' | 'overdue' | 'cancelled';
  generatedAt: string;
  sentAt?: string;
  viewedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  approvedBy?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  emailDelivery: {
    sent: boolean;
    sentAt?: string;
    sentTo: string[];
    deliveryStatus: 'pending' | 'delivered' | 'failed' | 'bounced';
    openedAt?: string;
    remindersSent: number;
    lastReminderAt?: string;
  };
}

export interface EmployeeImportData {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  dailyLimit?: number;
  monthlyLimit?: number;
  status?: 'active' | 'suspended' | 'inactive';
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    data: any;
  }>;
  duplicates: Array<{
    row: number;
    employeeId: string;
    existingEmployee: CorporateEmployee;
  }>;
  importedEmployees: CorporateEmployee[];
}

export interface UsageAnalytics {
  employeeId: number;
  employeeName: string;
  department: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  dailyBreakdown: Array<{
    date: string;
    orders: number;
    amount: number;
  }>;
  mealTypeBreakdown: Array<{
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    orders: number;
    amount: number;
    percentage: number;
  }>;
  spendingTrend: 'increasing' | 'decreasing' | 'stable';
  limitUtilization: {
    daily: number; // percentage
    monthly: number; // percentage
  };
  alerts: Array<{
    type: 'approaching_limit' | 'exceeded_limit' | 'unusual_spending';
    message: string;
    severity: 'low' | 'medium' | 'high';
    date: string;
  }>;
}

export interface DepartmentAnalytics {
  department: string;
  corporateAccountId: number;
  period: {
    startDate: string;
    endDate: string;
  };
  employeeCount: number;
  totalOrders: number;
  totalSpent: number;
  averagePerEmployee: number;
  averageOrderValue: number;
  topSpenders: Array<{
    employeeId: number;
    employeeName: string;
    totalSpent: number;
    orders: number;
  }>;
  spendingTrend: 'increasing' | 'decreasing' | 'stable';
  budgetUtilization?: {
    allocated: number;
    spent: number;
    remaining: number;
    percentage: number;
  };
}

export interface CorporateNotification {
  id: number;
  corporateAccountId: number;
  type: 'invoice_sent' | 'payment_reminder' | 'limit_alert' | 'budget_alert' | 'usage_report';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  recipients: string[];
  sentAt: string;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  readBy: Array<{
    email: string;
    readAt: string;
  }>;
  actionRequired: boolean;
  actionUrl?: string;
  expiresAt?: string;
}

class CorporateService {
  private corporateAccounts: CorporateAccount[] = [];
  private corporateEmployees: CorporateEmployee[] = [];
  private corporateOrders: CorporateOrder[] = [];
  private corporateInvoices: CorporateInvoice[] = [];
  private notifications: CorporateNotification[] = [];
  private usageAnalytics: Map<number, UsageAnalytics[]> = new Map();
  private departmentAnalytics: Map<number, DepartmentAnalytics[]> = new Map();

  private storageKeys = {
    accounts: 'restaurant_corporate_accounts',
    employees: 'restaurant_corporate_employees',
    orders: 'restaurant_corporate_orders',
    invoices: 'restaurant_corporate_invoices',
    notifications: 'restaurant_corporate_notifications',
    usageAnalytics: 'restaurant_usage_analytics',
    departmentAnalytics: 'restaurant_department_analytics'
  };

  constructor() {
    this.loadData();
  }

  // Corporate Accounts Management
  getCorporateAccounts(): CorporateAccount[] {
    return [...this.corporateAccounts];
  }

  getCorporateAccount(id: number): CorporateAccount | null {
    return this.corporateAccounts.find(account => account.id === id) || null;
  }

  createCorporateAccount(accountData: Omit<CorporateAccount, 'id' | 'createdAt' | 'updatedAt'>): CorporateAccount {
    const newAccount: CorporateAccount = {
      ...accountData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.corporateAccounts.push(newAccount);
    this.saveData();
    return newAccount;
  }

  updateCorporateAccount(id: number, updates: Partial<CorporateAccount>): CorporateAccount | null {
    const index = this.corporateAccounts.findIndex(account => account.id === id);
    if (index === -1) return null;

    this.corporateAccounts[index] = {
      ...this.corporateAccounts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveData();
    return this.corporateAccounts[index];
  }

  // Corporate Employees Management
  getCorporateEmployees(corporateAccountId?: number): CorporateEmployee[] {
    if (corporateAccountId) {
      return this.corporateEmployees.filter(emp => emp.corporateAccountId === corporateAccountId);
    }
    return [...this.corporateEmployees];
  }

  getCorporateEmployee(id: number): CorporateEmployee | null {
    return this.corporateEmployees.find(emp => emp.id === id) || null;
  }

  findEmployeeByEmployeeId(employeeId: string): CorporateEmployee | null {
    return this.corporateEmployees.find(emp => emp.employeeId === employeeId) || null;
  }

  createCorporateEmployee(employeeData: Omit<CorporateEmployee, 'id' | 'createdAt' | 'updatedAt'>): CorporateEmployee {
    const newEmployee: CorporateEmployee = {
      ...employeeData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.corporateEmployees.push(newEmployee);
    this.saveData();
    return newEmployee;
  }

  updateCorporateEmployee(id: number, updates: Partial<CorporateEmployee>): CorporateEmployee | null {
    const index = this.corporateEmployees.findIndex(emp => emp.id === id);
    if (index === -1) return null;

    this.corporateEmployees[index] = {
      ...this.corporateEmployees[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveData();
    return this.corporateEmployees[index];
  }

  deleteCorporateEmployee(id: number): boolean {
    const index = this.corporateEmployees.findIndex(emp => emp.id === id);
    if (index === -1) return false;

    // Check if employee has any orders
    const hasOrders = this.corporateOrders.some(order => order.employeeId === id);
    if (hasOrders) {
      // Don't delete, just deactivate
      this.corporateEmployees[index].status = 'inactive';
      this.corporateEmployees[index].updatedAt = new Date().toISOString();
    } else {
      // Safe to delete
      this.corporateEmployees.splice(index, 1);
    }

    this.saveData();
    return true;
  }

  // CSV Import Functionality
  async importEmployeesFromCSV(corporateAccountId: number, csvData: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalRows: 0,
      successfulImports: 0,
      failedImports: 0,
      errors: [],
      duplicates: [],
      importedEmployees: []
    };

    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      // Validate headers
      const requiredHeaders = ['employeeid', 'fullname', 'email', 'phone', 'department', 'position'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

      if (missingHeaders.length > 0) {
        result.errors.push({
          row: 1,
          field: 'headers',
          message: `Missing required headers: ${missingHeaders.join(', ')}`,
          data: headers
        });
        return result;
      }

      result.totalRows = lines.length - 1; // Exclude header row

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const rowData: any = {};

        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        // Validate required fields
        const validationErrors = this.validateEmployeeData(rowData, i + 1);
        if (validationErrors.length > 0) {
          result.errors.push(...validationErrors);
          result.failedImports++;
          continue;
        }

        // Check for duplicates
        const existingEmployee = this.findEmployeeByEmployeeId(rowData.employeeid);
        if (existingEmployee) {
          result.duplicates.push({
            row: i + 1,
            employeeId: rowData.employeeid,
            existingEmployee
          });
          result.failedImports++;
          continue;
        }

        // Create employee
        try {
          const employeeData = {
            corporateAccountId,
            employeeId: rowData.employeeid,
            fullName: rowData.fullname,
            email: rowData.email,
            phone: rowData.phone,
            department: rowData.department,
            position: rowData.position,
            dailyLimit: parseInt(rowData.dailylimit) || 50000,
            monthlyLimit: parseInt(rowData.monthlylimit) || 1000000,
            status: (rowData.status as 'active' | 'suspended' | 'inactive') || 'active'
          };

          const newEmployee = this.createCorporateEmployee(employeeData);
          result.importedEmployees.push(newEmployee);
          result.successfulImports++;
        } catch (error) {
          result.errors.push({
            row: i + 1,
            field: 'general',
            message: `Failed to create employee: ${error}`,
            data: rowData
          });
          result.failedImports++;
        }
      }

      result.success = result.successfulImports > 0;

      // Send notification about import results
      this.createNotification({
        corporateAccountId,
        type: 'usage_report',
        title: 'Employee Import Completed',
        message: `Imported ${result.successfulImports} employees successfully. ${result.failedImports} failed.`,
        severity: result.failedImports > 0 ? 'warning' : 'success',
        recipients: [this.getCorporateAccount(corporateAccountId)?.email || ''],
        actionRequired: false
      });

      return result;
    } catch (error) {
      result.errors.push({
        row: 0,
        field: 'general',
        message: `CSV parsing error: ${error}`,
        data: null
      });
      return result;
    }
  }

  private validateEmployeeData(data: any, row: number): Array<{ row: number; field: string; message: string; data: any }> {
    const errors = [];

    if (!data.employeeid) {
      errors.push({ row, field: 'employeeid', message: 'Employee ID is required', data });
    }

    if (!data.fullname) {
      errors.push({ row, field: 'fullname', message: 'Full name is required', data });
    }

    if (!data.email) {
      errors.push({ row, field: 'email', message: 'Email is required', data });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({ row, field: 'email', message: 'Invalid email format', data });
    }

    if (!data.phone) {
      errors.push({ row, field: 'phone', message: 'Phone is required', data });
    }

    if (!data.department) {
      errors.push({ row, field: 'department', message: 'Department is required', data });
    }

    if (!data.position) {
      errors.push({ row, field: 'position', message: 'Position is required', data });
    }

    return errors;
  }

  generateCSVTemplate(): string {
    const headers = [
      'employeeId',
      'fullName',
      'email',
      'phone',
      'department',
      'position',
      'dailyLimit',
      'monthlyLimit',
      'status'
    ];

    const sampleData = [
      'EMP001',
      'John Doe',
      'john.doe@company.com',
      '+255712345678',
      'Finance',
      'Accountant',
      '50000',
      '1000000',
      'active'
    ];

    return [headers.join(','), sampleData.join(',')].join('\n');
  }

  // Corporate Orders Management
  getCorporateOrders(corporateAccountId?: number, startDate?: string, endDate?: string): CorporateOrder[] {
    let orders = [...this.corporateOrders];

    if (corporateAccountId) {
      orders = orders.filter(order => order.corporateAccountId === corporateAccountId);
    }

    if (startDate && endDate) {
      orders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
      });
    }

    return orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }

  createCorporateOrder(orderData: Omit<CorporateOrder, 'id'>): CorporateOrder {
    const newOrder: CorporateOrder = {
      ...orderData,
      id: Date.now()
    };

    this.corporateOrders.push(newOrder);
    
    // Update corporate account balance
    const account = this.getCorporateAccount(orderData.corporateAccountId);
    if (account) {
      this.updateCorporateAccount(account.id, {
        currentBalance: account.currentBalance + orderData.total
      });
    }

    this.saveData();
    return newOrder;
  }

  // Invoice Management
  getCorporateInvoices(corporateAccountId?: number): CorporateInvoice[] {
    if (corporateAccountId) {
      return this.corporateInvoices.filter(invoice => invoice.corporateAccountId === corporateAccountId);
    }
    return [...this.corporateInvoices].sort((a, b) => 
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  }

  generateMonthlyInvoice(corporateAccountId: number, year: number, month: number): CorporateInvoice {
    const account = this.getCorporateAccount(corporateAccountId);
    if (!account) throw new Error('Corporate account not found');

    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    const orders = this.getCorporateOrders(corporateAccountId, startDate, endDate)
      .filter(order => order.status === 'completed');

    const employees = this.getCorporateEmployees(corporateAccountId);
    const uniqueEmployees = new Set(orders.map(order => order.employeeId));

    // Calculate employee breakdown
    const employeeBreakdown = Array.from(uniqueEmployees).map(employeeId => {
      const employee = employees.find(emp => emp.id === employeeId);
      const empOrders = orders.filter(order => order.employeeId === employeeId);
      const totalSpent = empOrders.reduce((sum, order) => sum + order.total, 0);
      const daysInMonth = new Date(year, month, 0).getDate();

      return {
        employeeId,
        employeeName: employee?.fullName || 'Unknown',
        department: employee?.department || 'Unknown',
        totalOrders: empOrders.length,
        totalSpent,
        dailyAverage: totalSpent / daysInMonth
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);

    // Calculate department breakdown
    const departmentMap = new Map<string, { employeeCount: number; totalOrders: number; totalSpent: number }>();

    employeeBreakdown.forEach(emp => {
      const dept = departmentMap.get(emp.department) || { employeeCount: 0, totalOrders: 0, totalSpent: 0 };
      dept.employeeCount++;
      dept.totalOrders += emp.totalOrders;
      dept.totalSpent += emp.totalSpent;
      departmentMap.set(emp.department, dept);
    });

    const departmentBreakdown = Array.from(departmentMap.entries()).map(([department, data]) => ({
      department,
      employeeCount: data.employeeCount,
      totalOrders: data.totalOrders,
      totalSpent: data.totalSpent,
      averagePerEmployee: data.totalSpent / data.employeeCount
    })).sort((a, b) => b.totalSpent - a.totalSpent);

    const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
    const topSpendingDepartment = departmentBreakdown[0]?.department || 'N/A';
    const topSpendingEmployee = employeeBreakdown[0]?.employeeName || 'N/A';

    const summary = {
      totalOrders: orders.length,
      totalEmployees: uniqueEmployees.size,
      subtotal: orders.reduce((sum, order) => sum + order.subtotal, 0),
      tax: orders.reduce((sum, order) => sum + order.tax, 0),
      serviceCharges: orders.reduce((sum, order) => sum + order.serviceCharge, 0),
      total: totalAmount,
      averageOrderValue: orders.length > 0 ? totalAmount / orders.length : 0,
      topSpendingDepartment,
      topSpendingEmployee
    };

    const invoice: CorporateInvoice = {
      id: Date.now(),
      invoiceNumber: this.generateInvoiceNumber(),
      corporateAccountId,
      companyName: account.companyName,
      billingPeriod: { startDate, endDate },
      orders,
      employeeBreakdown,
      departmentBreakdown,
      summary,
      dueDate: new Date(Date.now() + account.paymentTerms * 24 * 60 * 60 * 1000).toISOString(),
      status: 'draft',
      generatedAt: new Date().toISOString(),
      emailDelivery: {
        sent: false,
        sentTo: [],
        deliveryStatus: 'pending',
        remindersSent: 0
      }
    };

    this.corporateInvoices.push(invoice);
    this.saveData();

    // Create notification
    this.createNotification({
      corporateAccountId,
      type: 'invoice_sent',
      title: 'Monthly Invoice Generated',
      message: `Invoice ${invoice.invoiceNumber} for ${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} has been generated.`,
      severity: 'info',
      recipients: [account.email],
      actionRequired: false
    });

    return invoice;
  }

  // Enhanced Invoice Management
  async sendInvoiceByEmail(invoiceId: number, recipients: string[] = []): Promise<boolean> {
    const invoice = this.corporateInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) return false;

    const account = this.getCorporateAccount(invoice.corporateAccountId);
    if (!account) return false;

    // Simulate email sending
    await this.delay(1000);

    const emailRecipients = recipients.length > 0 ? recipients : [account.email];

    // Update invoice status
    invoice.status = 'sent';
    invoice.sentAt = new Date().toISOString();
    invoice.emailDelivery = {
      sent: true,
      sentAt: new Date().toISOString(),
      sentTo: emailRecipients,
      deliveryStatus: 'delivered',
      remindersSent: 0
    };

    this.saveData();

    // Create notification
    this.createNotification({
      corporateAccountId: invoice.corporateAccountId,
      type: 'invoice_sent',
      title: 'Invoice Sent Successfully',
      message: `Invoice ${invoice.invoiceNumber} has been sent to ${emailRecipients.join(', ')}`,
      severity: 'success',
      recipients: emailRecipients,
      actionRequired: false
    });

    console.log(`📧 Invoice ${invoice.invoiceNumber} sent to:`, emailRecipients);
    return true;
  }

  async sendPaymentReminder(invoiceId: number): Promise<boolean> {
    const invoice = this.corporateInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) return false;

    const account = this.getCorporateAccount(invoice.corporateAccountId);
    if (!account) return false;

    // Simulate email sending
    await this.delay(500);

    invoice.emailDelivery.remindersSent++;
    invoice.emailDelivery.lastReminderAt = new Date().toISOString();

    this.saveData();

    // Create notification
    this.createNotification({
      corporateAccountId: invoice.corporateAccountId,
      type: 'payment_reminder',
      title: 'Payment Reminder Sent',
      message: `Payment reminder for invoice ${invoice.invoiceNumber} has been sent. Due date: ${new Date(invoice.dueDate).toLocaleDateString()}`,
      severity: 'warning',
      recipients: [account.email],
      actionRequired: true,
      actionUrl: `/admin/corporate/invoices/${invoice.id}`
    });

    console.log(`⏰ Payment reminder sent for invoice ${invoice.invoiceNumber}`);
    return true;
  }

  updateInvoiceStatus(invoiceId: number, status: CorporateInvoice['status']): CorporateInvoice | null {
    const index = this.corporateInvoices.findIndex(invoice => invoice.id === invoiceId);
    if (index === -1) return null;

    this.corporateInvoices[index] = {
      ...this.corporateInvoices[index],
      status,
      paidAt: status === 'paid' ? new Date().toISOString() : undefined
    };

    // Update account balance when invoice is paid
    if (status === 'paid') {
      const account = this.getCorporateAccount(this.corporateInvoices[index].corporateAccountId);
      if (account) {
        this.updateCorporateAccount(account.id, {
          currentBalance: Math.max(0, account.currentBalance - this.corporateInvoices[index].summary.total)
        });
      }
    }

    this.saveData();
    return this.corporateInvoices[index];
  }

  // Usage Analytics
  getEmployeeUsageAnalytics(employeeId: number, startDate?: string, endDate?: string): UsageAnalytics | null {
    const employee = this.getCorporateEmployee(employeeId);
    if (!employee) return null;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const orders = this.corporateOrders.filter(order =>
      order.employeeId === employeeId &&
      new Date(order.orderDate) >= start &&
      new Date(order.orderDate) <= end
    );

    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Calculate daily breakdown
    const dailyBreakdown = this.calculateDailyBreakdown(orders, start, end);

    // Calculate meal type breakdown
    const mealTypeBreakdown = this.calculateMealTypeBreakdown(orders);

    // Calculate spending trend
    const spendingTrend = this.calculateSpendingTrend(dailyBreakdown);

    // Calculate limit utilization
    const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const dailyAverage = totalSpent / Math.max(daysInPeriod, 1);
    const monthlyAverage = totalSpent / Math.max(daysInPeriod / 30, 1);

    const limitUtilization = {
      daily: employee.dailyLimit > 0 ? (dailyAverage / employee.dailyLimit) * 100 : 0,
      monthly: employee.monthlyLimit > 0 ? (monthlyAverage / employee.monthlyLimit) * 100 : 0
    };

    // Generate alerts
    const alerts = this.generateUsageAlerts(employee, dailyAverage, monthlyAverage, limitUtilization);

    return {
      employeeId,
      employeeName: employee.fullName,
      department: employee.department,
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      },
      totalOrders,
      totalSpent,
      averageOrderValue,
      dailyAverage,
      weeklyAverage: dailyAverage * 7,
      monthlyAverage,
      dailyBreakdown,
      mealTypeBreakdown,
      spendingTrend,
      limitUtilization,
      alerts
    };
  }

  getDepartmentAnalytics(corporateAccountId: number, department: string, startDate?: string, endDate?: string): DepartmentAnalytics | null {
    const employees = this.getCorporateEmployees(corporateAccountId).filter(emp => emp.department === department);
    if (employees.length === 0) return null;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const employeeIds = employees.map(emp => emp.id);
    const orders = this.corporateOrders.filter(order =>
      employeeIds.includes(order.employeeId) &&
      new Date(order.orderDate) >= start &&
      new Date(order.orderDate) <= end
    );

    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averagePerEmployee = totalSpent / employees.length;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Calculate top spenders
    const topSpenders = employees.map(emp => {
      const empOrders = orders.filter(order => order.employeeId === emp.id);
      return {
        employeeId: emp.id,
        employeeName: emp.fullName,
        totalSpent: empOrders.reduce((sum, order) => sum + order.total, 0),
        orders: empOrders.length
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

    // Calculate spending trend
    const dailyBreakdown = this.calculateDailyBreakdown(orders, start, end);
    const spendingTrend = this.calculateSpendingTrend(dailyBreakdown);

    return {
      department,
      corporateAccountId,
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      },
      employeeCount: employees.length,
      totalOrders,
      totalSpent,
      averagePerEmployee,
      averageOrderValue,
      topSpenders,
      spendingTrend
    };
  }

  private calculateDailyBreakdown(orders: CorporateOrder[], start: Date, end: Date) {
    const breakdown = [];
    const current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const dayOrders = orders.filter(order =>
        order.orderDate.split('T')[0] === dateStr
      );

      breakdown.push({
        date: dateStr,
        orders: dayOrders.length,
        amount: dayOrders.reduce((sum, order) => sum + order.total, 0)
      });

      current.setDate(current.getDate() + 1);
    }

    return breakdown;
  }

  private calculateMealTypeBreakdown(orders: CorporateOrder[]) {
    const breakdown = {
      breakfast: { orders: 0, amount: 0 },
      lunch: { orders: 0, amount: 0 },
      dinner: { orders: 0, amount: 0 },
      snack: { orders: 0, amount: 0 }
    };

    orders.forEach(order => {
      breakdown[order.mealType].orders++;
      breakdown[order.mealType].amount += order.total;
    });

    const total = orders.reduce((sum, order) => sum + order.total, 0);

    return Object.entries(breakdown).map(([mealType, data]) => ({
      mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      orders: data.orders,
      amount: data.amount,
      percentage: total > 0 ? (data.amount / total) * 100 : 0
    }));
  }

  private calculateSpendingTrend(dailyBreakdown: Array<{ date: string; orders: number; amount: number }>): 'increasing' | 'decreasing' | 'stable' {
    if (dailyBreakdown.length < 7) return 'stable';

    const firstWeek = dailyBreakdown.slice(0, 7).reduce((sum, day) => sum + day.amount, 0);
    const lastWeek = dailyBreakdown.slice(-7).reduce((sum, day) => sum + day.amount, 0);

    const change = ((lastWeek - firstWeek) / Math.max(firstWeek, 1)) * 100;

    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  private generateUsageAlerts(employee: CorporateEmployee, dailyAverage: number, monthlyAverage: number, limitUtilization: { daily: number; monthly: number }) {
    const alerts = [];

    if (limitUtilization.daily > 80) {
      alerts.push({
        type: 'approaching_limit' as const,
        message: `Daily spending is ${limitUtilization.daily.toFixed(1)}% of limit`,
        severity: limitUtilization.daily > 95 ? 'high' as const : 'medium' as const,
        date: new Date().toISOString()
      });
    }

    if (limitUtilization.monthly > 80) {
      alerts.push({
        type: 'approaching_limit' as const,
        message: `Monthly spending is ${limitUtilization.monthly.toFixed(1)}% of limit`,
        severity: limitUtilization.monthly > 95 ? 'high' as const : 'medium' as const,
        date: new Date().toISOString()
      });
    }

    if (dailyAverage > employee.dailyLimit * 1.5) {
      alerts.push({
        type: 'unusual_spending' as const,
        message: 'Unusually high daily spending detected',
        severity: 'high' as const,
        date: new Date().toISOString()
      });
    }

    return alerts;
  }

  // Analytics
  getCorporateAnalytics(corporateAccountId?: number) {
    const orders = this.getCorporateOrders(corporateAccountId);
    const accounts = corporateAccountId ? [this.getCorporateAccount(corporateAccountId)!] : this.corporateAccounts;

    return {
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter(acc => acc.status === 'active').length,
      totalEmployees: this.getCorporateEmployees(corporateAccountId).length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
      outstandingBalance: accounts.reduce((sum, acc) => sum + acc.currentBalance, 0)
    };
  }

  // Utility methods
  private generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = String(this.corporateInvoices.length + 1).padStart(4, '0');
    return `INV-${year}${month}-${sequence}`;
  }

  private loadData(): void {
    try {
      const accounts = localStorage.getItem(this.storageKeys.accounts);
      const employees = localStorage.getItem(this.storageKeys.employees);
      const orders = localStorage.getItem(this.storageKeys.orders);
      const invoices = localStorage.getItem(this.storageKeys.invoices);
      const notifications = localStorage.getItem(this.storageKeys.notifications);
      const usageAnalytics = localStorage.getItem(this.storageKeys.usageAnalytics);
      const departmentAnalytics = localStorage.getItem(this.storageKeys.departmentAnalytics);

      if (accounts) this.corporateAccounts = JSON.parse(accounts);
      if (employees) this.corporateEmployees = JSON.parse(employees);
      if (orders) this.corporateOrders = JSON.parse(orders);
      if (invoices) this.corporateInvoices = JSON.parse(invoices);
      if (notifications) this.notifications = JSON.parse(notifications);

      if (usageAnalytics) {
        const analyticsArray = JSON.parse(usageAnalytics);
        this.usageAnalytics = new Map(analyticsArray);
      }

      if (departmentAnalytics) {
        const deptAnalyticsArray = JSON.parse(departmentAnalytics);
        this.departmentAnalytics = new Map(deptAnalyticsArray);
      }

      // Initialize with sample data if empty
      if (this.corporateAccounts.length === 0) {
        this.initializeSampleData();
      }
    } catch (error) {
      console.error('Failed to load corporate data:', error);
      this.initializeSampleData();
    }
  }

  // Notification System
  createNotification(notificationData: Omit<CorporateNotification, 'id' | 'sentAt' | 'deliveryStatus' | 'readBy'>): CorporateNotification {
    const notification: CorporateNotification = {
      ...notificationData,
      id: Date.now(),
      sentAt: new Date().toISOString(),
      deliveryStatus: 'sent',
      readBy: []
    };

    this.notifications.push(notification);
    this.saveData();

    console.log(`🔔 Notification created: ${notification.title}`);
    return notification;
  }

  getNotifications(corporateAccountId?: number): CorporateNotification[] {
    if (corporateAccountId) {
      return this.notifications.filter(n => n.corporateAccountId === corporateAccountId);
    }
    return [...this.notifications].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  markNotificationAsRead(notificationId: number, userEmail: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) return false;

    const existingRead = notification.readBy.find(r => r.email === userEmail);
    if (!existingRead) {
      notification.readBy.push({
        email: userEmail,
        readAt: new Date().toISOString()
      });
      this.saveData();
    }

    return true;
  }

  // Enhanced Analytics
  getCorporateAccountSummary(corporateAccountId: number) {
    const account = this.getCorporateAccount(corporateAccountId);
    if (!account) return null;

    const employees = this.getCorporateEmployees(corporateAccountId);
    const orders = this.getCorporateOrders(corporateAccountId);
    const invoices = this.getCorporateInvoices(corporateAccountId);

    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthOrders = orders.filter(order => new Date(order.orderDate) >= monthStart);

    const departments = [...new Set(employees.map(emp => emp.department))];
    const departmentAnalytics = departments.map(dept =>
      this.getDepartmentAnalytics(corporateAccountId, dept)
    ).filter(Boolean);

    return {
      account,
      employees: {
        total: employees.length,
        active: employees.filter(emp => emp.status === 'active').length,
        departments: departments.length
      },
      spending: {
        allTime: orders.reduce((sum, order) => sum + order.total, 0),
        currentMonth: monthOrders.reduce((sum, order) => sum + order.total, 0),
        averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
        totalOrders: orders.length,
        monthlyOrders: monthOrders.length
      },
      invoices: {
        total: invoices.length,
        pending: invoices.filter(inv => inv.status === 'sent').length,
        overdue: invoices.filter(inv => inv.status === 'overdue').length,
        paid: invoices.filter(inv => inv.status === 'paid').length,
        totalOutstanding: invoices
          .filter(inv => ['sent', 'overdue'].includes(inv.status))
          .reduce((sum, inv) => sum + inv.summary.total, 0)
      },
      creditStatus: {
        limit: account.creditLimit,
        used: account.currentBalance,
        available: account.creditLimit - account.currentBalance,
        utilizationPercentage: (account.currentBalance / account.creditLimit) * 100
      },
      departmentAnalytics,
      recentActivity: orders.slice(-10).reverse()
    };
  }

  // Utility methods
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private saveData(): void {
    try {
      localStorage.setItem(this.storageKeys.accounts, JSON.stringify(this.corporateAccounts));
      localStorage.setItem(this.storageKeys.employees, JSON.stringify(this.corporateEmployees));
      localStorage.setItem(this.storageKeys.orders, JSON.stringify(this.corporateOrders));
      localStorage.setItem(this.storageKeys.invoices, JSON.stringify(this.corporateInvoices));
      localStorage.setItem(this.storageKeys.notifications, JSON.stringify(this.notifications));
      localStorage.setItem(this.storageKeys.usageAnalytics, JSON.stringify(Array.from(this.usageAnalytics.entries())));
      localStorage.setItem(this.storageKeys.departmentAnalytics, JSON.stringify(Array.from(this.departmentAnalytics.entries())));
    } catch (error) {
      console.error('Failed to save corporate data:', error);
    }
  }

  private initializeSampleData(): void {
    // Sample corporate account
    const sampleAccount = this.createCorporateAccount({
      companyName: 'Tanzania Development Bank',
      contactPerson: 'John Mwalimu',
      email: 'procurement@tdb.co.tz',
      phone: '+255 22 211 3175',
      address: 'Dar es Salaam, Tanzania',
      taxId: 'TIN-123456789',
      creditLimit: 5000000, // TSh 5M
      currentBalance: 0,
      paymentTerms: 30,
      status: 'active',
      contractStartDate: new Date().toISOString(),
      billingAddress: 'P.O. Box 9373, Dar es Salaam',
      accountManager: 'Admin User'
    });

    // Sample employees
    this.createCorporateEmployee({
      corporateAccountId: sampleAccount.id,
      employeeId: 'TDB001',
      fullName: 'Grace Mwangi',
      email: 'grace.mwangi@tdb.co.tz',
      phone: '+255 712 345 678',
      department: 'Finance',
      position: 'Senior Accountant',
      dailyLimit: 50000, // TSh 50K
      monthlyLimit: 1000000, // TSh 1M
      status: 'active'
    });

    this.createCorporateEmployee({
      corporateAccountId: sampleAccount.id,
      employeeId: 'TDB002',
      fullName: 'Ahmed Hassan',
      email: 'ahmed.hassan@tdb.co.tz',
      phone: '+255 713 456 789',
      department: 'IT',
      position: 'Software Developer',
      dailyLimit: 40000, // TSh 40K
      monthlyLimit: 800000, // TSh 800K
      status: 'active'
    });

    // Sample corporate orders
    const graceEmployee = this.corporateEmployees.find(emp => emp.employeeId === 'TDB001');
    const ahmedEmployee = this.corporateEmployees.find(emp => emp.employeeId === 'TDB002');

    if (graceEmployee) {
      // Grace's lunch order
      this.createCorporateOrder({
        orderNumber: 'ORD-001',
        corporateAccountId: sampleAccount.id,
        employeeId: graceEmployee.id,
        employeeName: graceEmployee.fullName,
        department: graceEmployee.department,
        items: [
          { id: 1, name: 'Grilled Chicken with Rice', quantity: 1, unitPrice: 25000, totalPrice: 25000 },
          { id: 2, name: 'Fresh Juice', quantity: 1, unitPrice: 8000, totalPrice: 8000 }
        ],
        subtotal: 33000,
        tax: 4290,
        serviceCharge: 660,
        total: 37950,
        orderDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        mealType: 'lunch',
        notes: 'No spicy food',
        status: 'completed'
      });
    }

    if (ahmedEmployee) {
      // Ahmed's breakfast order
      this.createCorporateOrder({
        orderNumber: 'ORD-002',
        corporateAccountId: sampleAccount.id,
        employeeId: ahmedEmployee.id,
        employeeName: ahmedEmployee.fullName,
        department: ahmedEmployee.department,
        items: [
          { id: 3, name: 'Continental Breakfast', quantity: 1, unitPrice: 15000, totalPrice: 15000 },
          { id: 4, name: 'Coffee', quantity: 2, unitPrice: 5000, totalPrice: 10000 }
        ],
        subtotal: 25000,
        tax: 3250,
        serviceCharge: 500,
        total: 28750,
        orderDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        mealType: 'breakfast',
        notes: 'Extra sugar for coffee',
        status: 'completed'
      });
    }

    console.log('🏢 Corporate sample data initialized with orders');
  }
}

export const corporateService = new CorporateService();

// Make corporateService available globally for testing
if (typeof window !== 'undefined') {
  (window as any).corporateService = corporateService;
}
