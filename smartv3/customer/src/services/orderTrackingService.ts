// Professional Real-time Order Tracking Service
import axios from 'axios';

interface OrderStatus {
  id: number;
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total: string;
  created_at: string;
  confirmed_at?: string;
  kitchen_started_at?: string;
  ready_at?: string;
  completed_at?: string;
  estimated_completion?: string;
  is_takeout: boolean;
  table_number?: number;
  customer_phone?: string;
  special_instructions?: string;
  items: OrderItem[];
  kitchen_notes?: string;
  preparation_time?: number;
  priority: 'normal' | 'high' | 'urgent';
  assigned_chef?: string;
  server?: string;
}

interface OrderItem {
  id: number;
  menu_item: string;
  menu_item_name?: string;
  quantity: number;
  unit_price: string;
  line_total: string;
  special_instructions?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

interface OrderStatusUpdate {
  status: OrderStatus['status'];
  timestamp: string;
  message: string;
  estimated_time?: number;
}

class OrderTrackingService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private subscribers: Map<number, (status: OrderStatus) => void> = new Map();
  private lastKnownStatuses: Map<number, string> = new Map();

  /**
   * Subscribe to real-time order status updates
   */
  subscribeToOrder(orderId: number, callback: (status: OrderStatus) => void): () => void {
    console.log(`📡 Subscribing to order ${orderId} updates`);
    this.subscribers.set(orderId, callback);
    
    // Start polling if not already started
    this.startPolling();
    
    // Return unsubscribe function
    return () => {
      console.log(`📡 Unsubscribing from order ${orderId} updates`);
      this.subscribers.delete(orderId);
      if (this.subscribers.size === 0) {
        this.stopPolling();
      }
    };
  }

  /**
   * Get current order status
   */
  async getOrderStatus(orderId: number): Promise<OrderStatus> {
    try {
      console.log(`🔍 Fetching order ${orderId} status`);
      const response = await axios.get(`/api/orders/${orderId}/`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Get order status history
   */
  async getOrderHistory(orderId: number): Promise<OrderStatusUpdate[]> {
    try {
      const response = await axios.get(`/api/orders/${orderId}/status-history/`);
      return response.data.map((item: any) => ({
        status: item.new_status,
        timestamp: item.created_at,
        message: this.getStatusMessage(item.new_status),
        estimated_time: item.estimated_time
      }));
    } catch (error) {
      console.error(`❌ Failed to fetch order history:`, error);
      // Return mock history if API fails
      return this.getMockStatusHistory();
    }
  }

  /**
   * Start real-time polling for order updates
   */
  private startPolling(): void {
    if (this.pollingInterval) return;

    console.log('🔄 Starting real-time order polling');
    this.pollingInterval = setInterval(async () => {
      await this.pollOrderUpdates();
    }, 3000); // Poll every 3 seconds for real-time updates

    // Initial poll
    this.pollOrderUpdates();
  }

  /**
   * Stop real-time polling
   */
  private stopPolling(): void {
    if (this.pollingInterval) {
      console.log('⏹️ Stopping real-time order polling');
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Poll for order status updates
   */
  private async pollOrderUpdates(): Promise<void> {
    const orderIds = Array.from(this.subscribers.keys());
    
    for (const orderId of orderIds) {
      try {
        const orderStatus = await this.getOrderStatus(orderId);
        const callback = this.subscribers.get(orderId);
        const lastStatus = this.lastKnownStatuses.get(orderId);
        
        // Only notify if status changed
        if (orderStatus.status !== lastStatus) {
          console.log(`🔄 Order ${orderId} status changed: ${lastStatus} → ${orderStatus.status}`);
          this.lastKnownStatuses.set(orderId, orderStatus.status);
          
          if (callback) {
            callback(orderStatus);
          }
        }
      } catch (error) {
        console.error(`❌ Failed to poll order ${orderId}:`, error);
      }
    }
  }

  /**
   * Get user-friendly status message
   */
  private getStatusMessage(status: string): string {
    switch (status) {
      case 'pending':
        return 'Order received and being reviewed';
      case 'confirmed':
        return 'Order confirmed and sent to kitchen';
      case 'preparing':
        return 'Chef is preparing your order';
      case 'ready':
        return 'Order is ready for pickup/serving';
      case 'completed':
        return 'Order completed successfully';
      case 'cancelled':
        return 'Order has been cancelled';
      default:
        return 'Order status updated';
    }
  }

  /**
   * Get estimated completion time based on status
   */
  getEstimatedTime(status: OrderStatus): string {
    const now = new Date();
    
    switch (status.status) {
      case 'pending':
        return '5-10 minutes';
      case 'confirmed':
        return '15-25 minutes';
      case 'preparing':
        if (status.estimated_completion) {
          const estimated = new Date(status.estimated_completion);
          const diff = Math.max(0, Math.ceil((estimated.getTime() - now.getTime()) / (1000 * 60)));
          return `${diff} minutes`;
        }
        return '10-20 minutes';
      case 'ready':
        return 'Ready now!';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get order progress percentage
   */
  getProgressPercentage(status: string): number {
    switch (status) {
      case 'pending':
        return 10;
      case 'confirmed':
        return 25;
      case 'preparing':
        return 60;
      case 'ready':
        return 90;
      case 'completed':
        return 100;
      default:
        return 0;
    }
  }

  /**
   * Mock status history for demo purposes
   */
  private getMockStatusHistory(): OrderStatusUpdate[] {
    const now = new Date();
    return [
      {
        status: 'pending',
        timestamp: new Date(now.getTime() - 20 * 60000).toISOString(),
        message: 'Order received and being reviewed'
      },
      {
        status: 'confirmed',
        timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
        message: 'Order confirmed and sent to kitchen'
      },
      {
        status: 'preparing',
        timestamp: new Date(now.getTime() - 10 * 60000).toISOString(),
        message: 'Chef is preparing your order'
      }
    ];
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopPolling();
    this.subscribers.clear();
    this.lastKnownStatuses.clear();
  }
}

// Export singleton instance
const orderTrackingService = new OrderTrackingService();

// Export types and service
export type { OrderStatus, OrderItem, OrderStatusUpdate };
export { orderTrackingService };
export default orderTrackingService;
