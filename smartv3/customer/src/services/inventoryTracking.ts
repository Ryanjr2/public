// customer/src/services/inventoryTracking.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface OrderItem {
  menu_item_id: number;
  menu_item_name?: string;
  quantity: number;
}

export interface InventoryUsage {
  menuItemId: number;
  menuItemName: string;
  inventoryItemId: string;
  inventoryItemName: string;
  quantityUsed: number;
  unit: string;
  timestamp: Date;
}

class InventoryTrackingService {
  // Track ingredient usage when order is placed
  async trackOrderIngredients(orderItems: OrderItem[], orderId?: number): Promise<void> {
    try {
      // Get authentication token
      const token = localStorage.getItem('customerToken');
      
      if (!token) {
        console.warn('No authentication token found for inventory tracking');
        return;
      }

      // Calculate ingredient usage
      const usageData = await this.calculateIngredientUsage(orderItems);
      
      // Send usage data to backend
      await axios.post(`${API_BASE_URL}/inventory/track-usage/`, {
        order_id: orderId,
        usage: usageData,
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Inventory usage tracked successfully for order:', orderId);
    } catch (error) {
      console.error('Error tracking inventory usage:', error);
      // Don't throw error to avoid breaking order placement
    }
  }

  // Calculate ingredient usage from order items
  private async calculateIngredientUsage(orderItems: OrderItem[]): Promise<InventoryUsage[]> {
    const usage: InventoryUsage[] = [];
    const token = localStorage.getItem('customerToken');

    for (const item of orderItems) {
      try {
        // Get recipe/ingredient mapping for menu item
        const response = await axios.get(`${API_BASE_URL}/menu/items/${item.menu_item_id}/ingredients/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const ingredients = response.data;

        for (const ingredient of ingredients) {
          usage.push({
            menuItemId: item.menu_item_id,
            menuItemName: item.menu_item_name || `Menu Item ${item.menu_item_id}`,
            inventoryItemId: ingredient.inventory_item_id,
            inventoryItemName: ingredient.inventory_item_name,
            quantityUsed: ingredient.quantity_per_serving * item.quantity,
            unit: ingredient.unit,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error(`Error getting ingredients for menu item ${item.menu_item_id}:`, error);
        // Continue with other items even if one fails
      }
    }

    return usage;
  }

  // Check inventory availability before order placement
  async checkInventoryAvailability(orderItems: OrderItem[]): Promise<{
    available: boolean;
    unavailableItems: string[];
    lowStockWarnings: string[];
  }> {
    try {
      const token = localStorage.getItem('customerToken');
      
      const response = await axios.post(`${API_BASE_URL}/inventory/check-availability/`, {
        items: orderItems
      }, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error checking inventory availability:', error);
      // Return safe defaults if check fails
      return {
        available: true,
        unavailableItems: [],
        lowStockWarnings: []
      };
    }
  }

  // Get low stock alerts for customer-facing warnings
  async getLowStockAlerts(): Promise<string[]> {
    try {
      const token = localStorage.getItem('customerToken');
      
      const response = await axios.get(`${API_BASE_URL}/inventory/customer-alerts/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.alerts || [];
    } catch (error) {
      console.error('Error getting low stock alerts:', error);
      return [];
    }
  }

  // Notify about potential delays due to inventory issues
  async getEstimatedDelay(orderItems: OrderItem[]): Promise<{
    hasDelay: boolean;
    estimatedMinutes: number;
    reason: string;
  }> {
    try {
      const token = localStorage.getItem('customerToken');
      
      const response = await axios.post(`${API_BASE_URL}/inventory/estimate-delay/`, {
        items: orderItems
      }, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error estimating delay:', error);
      return {
        hasDelay: false,
        estimatedMinutes: 0,
        reason: ''
      };
    }
  }

  // Get menu items that are currently unavailable due to inventory
  async getUnavailableMenuItems(): Promise<number[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory/unavailable-menu-items/`);
      return response.data.unavailable_items || [];
    } catch (error) {
      console.error('Error getting unavailable menu items:', error);
      return [];
    }
  }

  // Real-time inventory status for menu items
  async getMenuItemInventoryStatus(menuItemIds: number[]): Promise<{
    [key: number]: {
      available: boolean;
      stockLevel: 'high' | 'medium' | 'low' | 'out';
      estimatedServings: number;
    }
  }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/inventory/menu-item-status/`, {
        menu_item_ids: menuItemIds
      });

      return response.data.status || {};
    } catch (error) {
      console.error('Error getting menu item inventory status:', error);
      return {};
    }
  }
}

export const inventoryTrackingService = new InventoryTrackingService();
export default inventoryTrackingService;
