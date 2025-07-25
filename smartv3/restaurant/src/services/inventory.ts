// src/services/inventory.ts

// Define interfaces directly in service to avoid import issues
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

interface StockPrediction {
  itemId: string;
  itemName: string;
  currentStock: number;
  predictedStockOut: Date | null;
  recommendedReorderQuantity: number;
  confidence: number;
}

interface IngredientUsage {
  menuItemId: string;
  menuItemName: string;
  inventoryItemId: string;
  inventoryItemName: string;
  quantityUsed: number;
  unit: string;
  timestamp: Date;
}

// Mock data
const mockAlerts: InventoryAlert[] = [
  {
    id: '1',
    type: 'low_stock',
    itemId: '1',
    itemName: 'Chicken Breast',
    message: 'Stock running low - only 5kg remaining',
    severity: 'medium',
    timestamp: new Date(),
    acknowledged: false
  },
  {
    id: '2',
    type: 'out_of_stock',
    itemId: '3',
    itemName: 'Rice',
    message: 'Item is out of stock',
    severity: 'critical',
    timestamp: new Date(),
    acknowledged: false
  },
  {
    id: '3',
    type: 'expiring_soon',
    itemId: '2',
    itemName: 'Tomatoes',
    message: 'Expires in 2 days',
    severity: 'high',
    timestamp: new Date(),
    acknowledged: false
  }
];

const mockPredictions: StockPrediction[] = [
  {
    itemId: '1',
    itemName: 'Chicken Breast',
    currentStock: 5,
    predictedStockOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    recommendedReorderQuantity: 20,
    confidence: 0.85
  }
];

// Simple inventory functions
export const getInventoryAlerts = (): InventoryAlert[] => {
  return mockAlerts;
};

export const getCriticalAlerts = (): InventoryAlert[] => {
  return mockAlerts.filter(alert => 
    !alert.acknowledged && (alert.severity === 'high' || alert.severity === 'critical')
  );
};

export const getUnacknowledgedAlerts = (): InventoryAlert[] => {
  return mockAlerts.filter(alert => !alert.acknowledged);
};

export const acknowledgeAlert = (alertId: string): void => {
  const alertIndex = mockAlerts.findIndex(alert => alert.id === alertId);
  if (alertIndex !== -1) {
    mockAlerts[alertIndex].acknowledged = true;
  }
};

export const getStockPredictions = (): StockPrediction[] => {
  return mockPredictions;
};

export const trackIngredientUsage = async (orderItems: any[]): Promise<void> => {
  console.log('Tracking ingredient usage for order items:', orderItems);
};

export const checkInventoryAvailability = async (orderItems: any[]): Promise<{
  available: boolean;
  unavailableItems: string[];
  lowStockWarnings: string[];
}> => {
  const unavailableItems: string[] = [];
  const lowStockWarnings: string[] = [];
  
  for (const item of orderItems) {
    const outOfStockAlert = mockAlerts.find(alert => 
      alert.type === 'out_of_stock' && 
      alert.itemName.toLowerCase().includes(item.menu_item_name?.toLowerCase() || '')
    );
    
    if (outOfStockAlert) {
      unavailableItems.push(item.menu_item_name || `Item ${item.menu_item_id}`);
    }
    
    const lowStockAlert = mockAlerts.find(alert => 
      alert.type === 'low_stock' && 
      alert.itemName.toLowerCase().includes(item.menu_item_name?.toLowerCase() || '')
    );
    
    if (lowStockAlert) {
      lowStockWarnings.push(`${item.menu_item_name || `Item ${item.menu_item_id}`} is running low`);
    }
  }
  
  return {
    available: unavailableItems.length === 0,
    unavailableItems,
    lowStockWarnings
  };
};

export const getEstimatedDelay = async (orderItems: any[]): Promise<{
  hasDelay: boolean;
  estimatedMinutes: number;
  reason: string;
}> => {
  const hasLowStock = orderItems.some(item => 
    mockAlerts.some(alert => 
      (alert.type === 'low_stock' || alert.type === 'out_of_stock') && 
      alert.itemName.toLowerCase().includes(item.menu_item_name?.toLowerCase() || '')
    )
  );
  
  if (hasLowStock) {
    return {
      hasDelay: true,
      estimatedMinutes: 15,
      reason: 'Some ingredients are running low and may require additional preparation time'
    };
  }
  
  return {
    hasDelay: false,
    estimatedMinutes: 0,
    reason: ''
  };
};

export const exportInventoryData = async (format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> => {
  const content = 'Item,Stock,Status\nChicken Breast,5kg,Low Stock\nRice,0kg,Out of Stock\nTomatoes,25kg,In Stock';
  return new Blob([content], { type: 'text/plain' });
};

export const bulkUpdateStock = async (updates: Array<{
  itemId: string;
  quantity: number;
  type: 'in' | 'out' | 'adjustment';
  reason: string;
}>): Promise<void> => {
  console.log('Bulk updating stock:', updates);
};

export const getReorderSuggestions = async (): Promise<any[]> => {
  return [
    { itemId: '1', itemName: 'Chicken Breast', suggestedQuantity: 20, priority: 'high' },
    { itemId: '3', itemName: 'Rice', suggestedQuantity: 50, priority: 'critical' }
  ];
};

export const getInventoryAnalytics = async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> => {
  return {
    totalValue: 15000,
    lowStockItems: 2,
    outOfStockItems: 1,
    expiringItems: 1,
    period
  };
};

// Default export for convenience
const inventoryService = {
  getInventoryAlerts,
  getCriticalAlerts,
  getUnacknowledgedAlerts,
  acknowledgeAlert,
  getStockPredictions,
  trackIngredientUsage,
  checkInventoryAvailability,
  getEstimatedDelay,
  exportInventoryData,
  bulkUpdateStock,
  getReorderSuggestions,
  getInventoryAnalytics
};

export default inventoryService;
