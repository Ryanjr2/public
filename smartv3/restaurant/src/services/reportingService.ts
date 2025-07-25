// src/services/reportingService.ts

export interface CompletedOrder {
  id: number;
  order_number: string;
  customer_name: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  table_number?: number;
  items: {
    id: number;
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    category: string;
    preparation_time: number;
  }[];
  total_amount: number;
  tax_amount: number;
  service_charge?: number;
  discount_amount?: number;
  payment_method: 'cash' | 'card' | 'mpesa' | 'bank_transfer';
  staff_member: string;
  created_at: string;
  completed_at: string;
  preparation_time_actual: number; // in minutes
  customer_rating?: number;
  special_instructions?: string;
}

export interface DailySalesReport {
  date: string;
  total_orders: number;
  total_revenue: number;
  total_tax: number;
  total_service_charges: number;
  total_discounts: number;
  net_revenue: number;
  average_order_value: number;
  orders_by_type: {
    dine_in: { count: number; revenue: number };
    takeaway: { count: number; revenue: number };
    delivery: { count: number; revenue: number };
  };
  orders_by_hour: { hour: string; count: number; revenue: number }[];
  top_selling_items: { name: string; quantity: number; revenue: number }[];
  payment_methods: { method: string; count: number; amount: number }[];
  average_preparation_time: number;
  customer_satisfaction: number;
}

export interface WeeklySalesReport {
  week_start: string;
  week_end: string;
  daily_reports: DailySalesReport[];
  total_revenue: number;
  growth_percentage: number;
  best_day: { date: string; revenue: number };
  worst_day: { date: string; revenue: number };
  trending_items: { name: string; growth: number }[];
}

export interface MonthlySalesReport {
  month: string;
  year: number;
  weekly_reports: WeeklySalesReport[];
  total_revenue: number;
  total_orders: number;
  growth_percentage: number;
  seasonal_trends: { week: number; revenue: number }[];
  customer_insights: {
    new_customers: number;
    returning_customers: number;
    average_visits_per_customer: number;
  };
}

class ReportingService {
  private completedOrders: CompletedOrder[] = [];
  private listeners: ((order: CompletedOrder) => void)[] = [];

  // Add completed order to reporting system
  addCompletedOrder(order: CompletedOrder) {
    this.completedOrders.push(order);
    this.saveToLocalStorage();
    
    // Notify all listeners (analytics, dashboard, etc.)
    this.listeners.forEach(listener => listener(order));
    
    console.log('📊 Order added to reporting system:', order.order_number);
  }

  // Subscribe to new completed orders
  onOrderCompleted(callback: (order: CompletedOrder) => void) {
    this.listeners.push(callback);
  }

  // Get daily sales report
  getDailySalesReport(date: string): DailySalesReport {
    const dayOrders = this.completedOrders.filter(order => 
      order.completed_at.startsWith(date)
    );

    const totalRevenue = dayOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const totalTax = dayOrders.reduce((sum, order) => sum + order.tax_amount, 0);
    const totalServiceCharges = dayOrders.reduce((sum, order) => sum + (order.service_charge || 0), 0);
    const totalDiscounts = dayOrders.reduce((sum, order) => sum + (order.discount_amount || 0), 0);

    // Orders by type
    const ordersByType = {
      dine_in: { count: 0, revenue: 0 },
      takeaway: { count: 0, revenue: 0 },
      delivery: { count: 0, revenue: 0 }
    };

    dayOrders.forEach(order => {
      ordersByType[order.order_type].count++;
      ordersByType[order.order_type].revenue += order.total_amount;
    });

    // Orders by hour
    const ordersByHour: { hour: string; count: number; revenue: number }[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = hour.toString().padStart(2, '0') + ':00';
      const hourOrders = dayOrders.filter(order => {
        const orderHour = new Date(order.completed_at).getHours();
        return orderHour === hour;
      });
      
      ordersByHour.push({
        hour: hourStr,
        count: hourOrders.length,
        revenue: hourOrders.reduce((sum, order) => sum + order.total_amount, 0)
      });
    }

    // Top selling items
    const itemSales: { [key: string]: { quantity: number; revenue: number } } = {};
    dayOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemSales[item.name]) {
          itemSales[item.name] = { quantity: 0, revenue: 0 };
        }
        itemSales[item.name].quantity += item.quantity;
        itemSales[item.name].revenue += item.total_price;
      });
    });

    const topSellingItems = Object.entries(itemSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Payment methods
    const paymentMethods: { [key: string]: { count: number; amount: number } } = {};
    dayOrders.forEach(order => {
      if (!paymentMethods[order.payment_method]) {
        paymentMethods[order.payment_method] = { count: 0, amount: 0 };
      }
      paymentMethods[order.payment_method].count++;
      paymentMethods[order.payment_method].amount += order.total_amount;
    });

    const paymentMethodsArray = Object.entries(paymentMethods)
      .map(([method, data]) => ({ method, ...data }));

    return {
      date,
      total_orders: dayOrders.length,
      total_revenue: totalRevenue,
      total_tax: totalTax,
      total_service_charges: totalServiceCharges,
      total_discounts: totalDiscounts,
      net_revenue: totalRevenue - totalTax - totalDiscounts,
      average_order_value: dayOrders.length > 0 ? totalRevenue / dayOrders.length : 0,
      orders_by_type: ordersByType,
      orders_by_hour: ordersByHour,
      top_selling_items: topSellingItems,
      payment_methods: paymentMethodsArray,
      average_preparation_time: dayOrders.length > 0 
        ? dayOrders.reduce((sum, order) => sum + order.preparation_time_actual, 0) / dayOrders.length 
        : 0,
      customer_satisfaction: dayOrders.length > 0
        ? dayOrders.reduce((sum, order) => sum + (order.customer_rating || 5), 0) / dayOrders.length
        : 5
    };
  }

  // Get all completed orders
  getAllCompletedOrders(): CompletedOrder[] {
    return [...this.completedOrders];
  }

  // Get orders for date range
  getOrdersForDateRange(startDate: string, endDate: string): CompletedOrder[] {
    return this.completedOrders.filter(order => {
      const orderDate = order.completed_at.split('T')[0];
      return orderDate >= startDate && orderDate <= endDate;
    });
  }

  // Save to localStorage for persistence
  private saveToLocalStorage() {
    try {
      localStorage.setItem('restaurant_completed_orders', JSON.stringify(this.completedOrders));
    } catch (error) {
      console.error('Failed to save orders to localStorage:', error);
    }
  }

  // Load from localStorage
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('restaurant_completed_orders');
      if (saved) {
        this.completedOrders = JSON.parse(saved);
        console.log(`📊 Loaded ${this.completedOrders.length} completed orders from storage`);
      }
    } catch (error) {
      console.error('Failed to load orders from localStorage:', error);
    }
  }

  // Generate comprehensive sample data for demonstration
  generateSampleData() {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const sampleOrders: CompletedOrder[] = [
      // Today's orders
      {
        id: 1,
        order_number: 'ORD-001',
        customer_name: 'John Mwangi',
        order_type: 'dine_in',
        table_number: 5,
        items: [
          { id: 1, name: 'Nyama Choma', quantity: 2, unit_price: 25000, total_price: 50000, category: 'Main Dishes', preparation_time: 25 },
          { id: 2, name: 'Ugali', quantity: 2, unit_price: 3000, total_price: 6000, category: 'Sides', preparation_time: 10 },
          { id: 3, name: 'Chai ya Tangawizi', quantity: 2, unit_price: 2500, total_price: 5000, category: 'Beverages', preparation_time: 5 }
        ],
        total_amount: 66000,
        tax_amount: 9900, // 15% VAT
        service_charge: 3300, // 5% service charge
        discount_amount: 0,
        payment_method: 'mpesa',
        staff_member: 'Chef Maria',
        created_at: new Date(today.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(today.getTime() - 2.5 * 60 * 60 * 1000).toISOString(),
        preparation_time_actual: 28,
        customer_rating: 5
      },
      {
        id: 2,
        order_number: 'ORD-002',
        customer_name: 'Fatuma Hassan',
        order_type: 'delivery',
        items: [
          { id: 4, name: 'Pilau', quantity: 3, unit_price: 22000, total_price: 66000, category: 'Main Dishes', preparation_time: 30 },
          { id: 5, name: 'Samosa', quantity: 6, unit_price: 2000, total_price: 12000, category: 'Appetizers', preparation_time: 15 }
        ],
        total_amount: 78000,
        tax_amount: 11700,
        service_charge: 0,
        discount_amount: 5000, // Delivery discount
        payment_method: 'cash',
        staff_member: 'Chef John',
        created_at: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(today.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
        preparation_time_actual: 35,
        customer_rating: 4
      },
      {
        id: 3,
        order_number: 'ORD-003',
        customer_name: 'Ahmed Ali',
        order_type: 'takeaway',
        items: [
          { id: 6, name: 'Chapati na Mchuzi', quantity: 4, unit_price: 8000, total_price: 32000, category: 'Main Dishes', preparation_time: 20 },
          { id: 7, name: 'Juice ya Maembe', quantity: 2, unit_price: 4000, total_price: 8000, category: 'Beverages', preparation_time: 5 }
        ],
        total_amount: 40000,
        tax_amount: 6000,
        service_charge: 0,
        discount_amount: 2000, // Takeaway discount
        payment_method: 'card',
        staff_member: 'Chef Sarah',
        created_at: new Date(today.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(today.getTime() - 3.5 * 60 * 60 * 1000).toISOString(),
        preparation_time_actual: 22,
        customer_rating: 5
      },
      {
        id: 4,
        order_number: 'ORD-004',
        customer_name: 'Grace Wanjiku',
        order_type: 'dine_in',
        table_number: 12,
        items: [
          { id: 8, name: 'Nyama Choma', quantity: 1, unit_price: 25000, total_price: 25000, category: 'Main Dishes', preparation_time: 25 },
          { id: 9, name: 'Pilau', quantity: 1, unit_price: 22000, total_price: 22000, category: 'Main Dishes', preparation_time: 30 },
          { id: 10, name: 'Samosa', quantity: 4, unit_price: 2000, total_price: 8000, category: 'Appetizers', preparation_time: 15 }
        ],
        total_amount: 60000,
        tax_amount: 9000,
        service_charge: 3000,
        discount_amount: 0,
        payment_method: 'mpesa',
        staff_member: 'Chef Maria',
        created_at: new Date(today.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(today.getTime() - 4.5 * 60 * 60 * 1000).toISOString(),
        preparation_time_actual: 32,
        customer_rating: 4
      },
      {
        id: 5,
        order_number: 'ORD-005',
        customer_name: 'David Kimani',
        order_type: 'delivery',
        items: [
          { id: 11, name: 'Ugali', quantity: 3, unit_price: 3000, total_price: 9000, category: 'Sides', preparation_time: 10 },
          { id: 12, name: 'Chai ya Tangawizi', quantity: 4, unit_price: 2500, total_price: 10000, category: 'Beverages', preparation_time: 5 }
        ],
        total_amount: 19000,
        tax_amount: 2850,
        service_charge: 0,
        discount_amount: 1000,
        payment_method: 'bank_transfer',
        staff_member: 'Chef David',
        created_at: new Date(today.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(today.getTime() - 0.5 * 60 * 60 * 1000).toISOString(),
        preparation_time_actual: 18,
        customer_rating: 5
      },
      // Yesterday's orders for comparison
      {
        id: 6,
        order_number: 'ORD-006',
        customer_name: 'Mary Njeri',
        order_type: 'dine_in',
        table_number: 8,
        items: [
          { id: 13, name: 'Pilau', quantity: 2, unit_price: 22000, total_price: 44000, category: 'Main Dishes', preparation_time: 30 },
          { id: 14, name: 'Juice ya Maembe', quantity: 2, unit_price: 4000, total_price: 8000, category: 'Beverages', preparation_time: 5 }
        ],
        total_amount: 52000,
        tax_amount: 7800,
        service_charge: 2600,
        discount_amount: 0,
        payment_method: 'cash',
        staff_member: 'Chef John',
        created_at: yesterday.toISOString(),
        completed_at: new Date(yesterday.getTime() + 30 * 60 * 1000).toISOString(),
        preparation_time_actual: 28,
        customer_rating: 4
      }
    ];

    // Clear existing data first
    this.completedOrders = [];

    sampleOrders.forEach(order => this.addCompletedOrder(order));
    console.log(`📊 Generated ${sampleOrders.length} sample orders for testing`);
  }

  // Clear all data (for testing)
  clearAllData() {
    this.completedOrders = [];
    localStorage.removeItem('restaurant_completed_orders');
    console.log('📊 All reporting data cleared');
  }
}

// Create singleton instance
export const reportingService = new ReportingService();

// Initialize with sample data if empty
if (typeof window !== 'undefined') {
  reportingService.loadFromLocalStorage();
  if (reportingService.getAllCompletedOrders().length === 0) {
    reportingService.generateSampleData();
  }
}
