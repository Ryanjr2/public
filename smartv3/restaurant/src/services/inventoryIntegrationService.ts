// src/services/inventoryIntegrationService.ts
import api from './api';

// Enhanced interfaces for real integration
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  supplierContact: string;
  lastRestocked: string;
  expiryDate?: string;
  location: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired' | 'discontinued';
  usageRate: number;
  estimatedDaysLeft: number;
  reorderPoint: number;
  reorderQuantity: number;
}

interface OrderItem {
  menu_item_id: number;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
}

interface IngredientUsage {
  menuItemId: number;
  menuItemName: string;
  inventoryItemId: string;
  inventoryItemName: string;
  quantityUsed: number;
  unit: string;
  timestamp: Date;
}

interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';
  itemId: string;
  itemName: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
}

class InventoryIntegrationService {
  private alertSubscribers: ((alerts: InventoryAlert[]) => void)[] = [];
  private currentAlerts: InventoryAlert[] = [];

  // Real-time inventory monitoring
  async startInventoryMonitoring(): Promise<void> {
    try {
      // Initial load
      await this.refreshInventoryData();
      
      // Set up periodic monitoring
      setInterval(async () => {
        await this.refreshInventoryData();
      }, 30000); // Every 30 seconds
      
      console.log('✅ Inventory monitoring started');
    } catch (error) {
      console.error('❌ Failed to start inventory monitoring:', error);
    }
  }

  // Refresh inventory data and check for alerts
  private async refreshInventoryData(): Promise<void> {
    try {
      // Get current inventory status
      const response = await api.get('/inventory/items/');
      const items: InventoryItem[] = response.data;
      
      // Generate alerts based on current inventory
      const newAlerts = this.generateAlertsFromInventory(items);
      
      // Update alerts if changed
      if (JSON.stringify(newAlerts) !== JSON.stringify(this.currentAlerts)) {
        this.currentAlerts = newAlerts;
        this.notifyAlertSubscribers();
      }
    } catch (error) {
      console.error('Error refreshing inventory data:', error);
    }
  }

  // Generate alerts from inventory data
  private generateAlertsFromInventory(items: InventoryItem[]): InventoryAlert[] {
    const alerts: InventoryAlert[] = [];
    
    items.forEach(item => {
      // Out of stock alert
      if (item.currentStock === 0) {
        alerts.push({
          id: `out-${item.id}`,
          type: 'out_of_stock',
          itemId: item.id,
          itemName: item.name,
          message: `${item.name} is completely out of stock`,
          severity: 'critical',
          timestamp: new Date(),
          acknowledged: false
        });
      }
      // Low stock alert
      else if (item.currentStock <= item.minStock) {
        alerts.push({
          id: `low-${item.id}`,
          type: 'low_stock',
          itemId: item.id,
          itemName: item.name,
          message: `${item.name} is running low - only ${item.currentStock} ${item.unit} remaining`,
          severity: item.currentStock <= (item.minStock * 0.5) ? 'high' : 'medium',
          timestamp: new Date(),
          acknowledged: false
        });
      }
      
      // Expiring soon alert
      if (item.expiryDate) {
        const expiryDate = new Date(item.expiryDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
          alerts.push({
            id: `exp-${item.id}`,
            type: 'expiring_soon',
            itemId: item.id,
            itemName: item.name,
            message: `${item.name} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`,
            severity: daysUntilExpiry <= 1 ? 'high' : 'medium',
            timestamp: new Date(),
            acknowledged: false
          });
        }
      }
    });
    
    return alerts;
  }

  // Subscribe to inventory alerts
  subscribeToAlerts(callback: (alerts: InventoryAlert[]) => void): () => void {
    this.alertSubscribers.push(callback);
    
    // Immediately call with current alerts
    callback(this.currentAlerts);
    
    // Return unsubscribe function
    return () => {
      const index = this.alertSubscribers.indexOf(callback);
      if (index > -1) {
        this.alertSubscribers.splice(index, 1);
      }
    };
  }

  // Notify all alert subscribers
  private notifyAlertSubscribers(): void {
    this.alertSubscribers.forEach(callback => callback(this.currentAlerts));
  }

  // Track ingredient usage when order is placed
  async trackOrderIngredients(orderItems: OrderItem[], orderId?: number): Promise<void> {
    try {
      console.log('🔄 Tracking ingredient usage for order:', orderId, orderItems);
      
      const usageData: IngredientUsage[] = [];
      
      // Calculate ingredient usage for each order item
      for (const orderItem of orderItems) {
        try {
          // Get recipe/ingredient mapping for menu item
          const response = await api.get(`/menu/items/${orderItem.menu_item_id}/ingredients/`);
          const ingredients = response.data;
          
          // Calculate usage for each ingredient
          for (const ingredient of ingredients) {
            const totalUsage = ingredient.quantity_per_serving * orderItem.quantity;
            
            usageData.push({
              menuItemId: orderItem.menu_item_id,
              menuItemName: orderItem.menu_item_name,
              inventoryItemId: ingredient.inventory_item_id,
              inventoryItemName: ingredient.inventory_item_name,
              quantityUsed: totalUsage,
              unit: ingredient.unit,
              timestamp: new Date()
            });
            
            // Update inventory stock
            await this.updateInventoryStock(
              ingredient.inventory_item_id,
              totalUsage,
              'out',
              `Used for order ${orderId} - ${orderItem.menu_item_name}`
            );
          }
        } catch (error) {
          console.error(`Error processing ingredients for ${orderItem.menu_item_name}:`, error);
        }
      }
      
      // Send usage data to backend for tracking
      if (usageData.length > 0) {
        await api.post('/inventory/track-usage/', {
          order_id: orderId,
          usage: usageData,
          timestamp: new Date().toISOString()
        });
      }
      
      // Refresh inventory data to update alerts
      await this.refreshInventoryData();
      
      console.log('✅ Ingredient usage tracked successfully');
    } catch (error) {
      console.error('❌ Error tracking ingredient usage:', error);
      throw error;
    }
  }

  // Update inventory stock levels
  async updateInventoryStock(
    itemId: string,
    quantity: number,
    type: 'in' | 'out' | 'adjustment',
    reason: string
  ): Promise<void> {
    try {
      await api.post(`/inventory/items/${itemId}/movement/`, {
        type,
        quantity,
        reason,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ Stock updated: ${type} ${quantity} for item ${itemId}`);
    } catch (error) {
      console.error('❌ Error updating inventory stock:', error);
      throw error;
    }
  }

  // Check inventory availability before order placement
  async checkInventoryAvailability(orderItems: OrderItem[]): Promise<{
    available: boolean;
    unavailableItems: string[];
    lowStockWarnings: string[];
    estimatedDelay: number;
  }> {
    try {
      const response = await api.post('/inventory/check-availability/', {
        items: orderItems
      });
      
      return response.data;
    } catch (error) {
      console.error('Error checking inventory availability:', error);
      
      // Return safe defaults if check fails
      return {
        available: true,
        unavailableItems: [],
        lowStockWarnings: [],
        estimatedDelay: 0
      };
    }
  }

  // Get current inventory alerts
  getCurrentAlerts(): InventoryAlert[] {
    return this.currentAlerts;
  }

  // Get critical alerts
  getCriticalAlerts(): InventoryAlert[] {
    return this.currentAlerts.filter(alert => 
      !alert.acknowledged && (alert.severity === 'high' || alert.severity === 'critical')
    );
  }

  // Get unacknowledged alerts
  getUnacknowledgedAlerts(): InventoryAlert[] {
    return this.currentAlerts.filter(alert => !alert.acknowledged);
  }

  // Acknowledge alert
  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      // Update local state
      this.currentAlerts = this.currentAlerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      );
      
      // Notify subscribers
      this.notifyAlertSubscribers();
      
      // Send to backend if needed
      await api.post(`/inventory/alerts/${alertId}/acknowledge/`);
      
      console.log('✅ Alert acknowledged:', alertId);
    } catch (error) {
      console.error('❌ Error acknowledging alert:', error);
    }
  }

  // Restock inventory item
  async restockItem(
    itemId: string,
    quantity: number,
    supplier?: string,
    cost?: number,
    notes?: string
  ): Promise<void> {
    try {
      await api.post(`/inventory/items/${itemId}/restock/`, {
        quantity,
        supplier,
        cost,
        notes,
        timestamp: new Date().toISOString()
      });
      
      // Refresh inventory data
      await this.refreshInventoryData();
      
      console.log('✅ Item restocked successfully:', itemId, quantity);
    } catch (error) {
      console.error('❌ Error restocking item:', error);
      throw error;
    }
  }

  // Get inventory statistics
  async getInventoryStats(): Promise<any> {
    try {
      const response = await api.get('/inventory/items/stats/');
      return response.data;
    } catch (error) {
      console.error('Error getting inventory stats:', error);
      return {
        totalItems: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        totalValue: 0
      };
    }
  }
}

// Create and export singleton instance
export const inventoryIntegrationService = new InventoryIntegrationService();
export default inventoryIntegrationService;
