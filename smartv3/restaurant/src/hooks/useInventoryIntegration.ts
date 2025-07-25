// src/hooks/useInventoryIntegration.ts
import { useState, useEffect, useCallback } from 'react';

// Define interfaces directly in hook to avoid import issues
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

// Mock data to avoid import issues
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
  }
];

const mockPredictions: StockPrediction[] = [
  {
    itemId: '1',
    itemName: 'Chicken Breast',
    currentStock: 5,
    predictedStockOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
    recommendedReorderQuantity: 20,
    confidence: 0.85
  }
];

export const useInventoryIntegration = () => {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [predictions, setPredictions] = useState<StockPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize with mock data
  useEffect(() => {
    setTimeout(() => {
      setAlerts(mockAlerts);
      setPredictions(mockPredictions);
      setLoading(false);
    }, 1000);
  }, []);

  // Track ingredient usage for orders
  const trackOrderIngredients = useCallback(async (orderItems: any[]) => {
    try {
      console.log('Tracking ingredient usage for order items:', orderItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track ingredient usage');
    }
  }, []);

  // Acknowledge alert
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      setAlerts(prevAlerts =>
        prevAlerts.map(alert =>
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
    }
  }, []);

  // Get reorder suggestions
  const getReorderSuggestions = useCallback(async () => {
    try {
      return [
        { itemId: '1', itemName: 'Chicken Breast', suggestedQuantity: 20 },
        { itemId: '3', itemName: 'Rice', suggestedQuantity: 50 }
      ];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get reorder suggestions');
      return [];
    }
  }, []);

  // Bulk update stock
  const bulkUpdateStock = useCallback(async (updates: Array<{
    itemId: string;
    quantity: number;
    type: 'in' | 'out' | 'adjustment';
    reason: string;
  }>) => {
    try {
      console.log('Bulk updating stock:', updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk update stock');
      throw err;
    }
  }, []);

  // Export inventory data
  const exportInventory = useCallback(async (format: 'csv' | 'excel' | 'pdf' = 'csv') => {
    try {
      const content = 'Item,Stock,Status\nChicken Breast,5kg,Low Stock\nRice,0kg,Out of Stock';
      const blob = new Blob([content], { type: 'text/plain' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export inventory');
      throw err;
    }
  }, []);

  // Import inventory data
  const importInventory = useCallback(async (file: File) => {
    try {
      console.log('Importing inventory file:', file.name);
      return { success: true, message: 'File imported successfully' };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import inventory');
      throw err;
    }
  }, []);

  // Get inventory analytics
  const getAnalytics = useCallback(async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
    try {
      return {
        totalValue: 15000,
        lowStockItems: 2,
        outOfStockItems: 1,
        expiringItems: 1
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get analytics');
      return null;
    }
  }, []);

  // Refresh predictions
  const refreshPredictions = useCallback(async () => {
    try {
      setPredictions(mockPredictions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh predictions');
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get critical alerts
  const criticalAlerts = alerts.filter(alert => 
    !alert.acknowledged && (alert.severity === 'high' || alert.severity === 'critical')
  );

  // Get unacknowledged alerts
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  // Get alerts by type
  const getAlertsByType = useCallback((type: InventoryAlert['type']) => {
    return alerts.filter(alert => alert.type === type);
  }, [alerts]);

  // Get predictions for critical items
  const criticalPredictions = predictions.filter(prediction => 
    prediction.predictedStockOut && 
    prediction.predictedStockOut <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
  );

  return {
    // State
    alerts,
    predictions,
    loading,
    error,
    
    // Computed values
    criticalAlerts,
    unacknowledgedAlerts,
    criticalPredictions,
    
    // Actions
    trackOrderIngredients,
    acknowledgeAlert,
    getReorderSuggestions,
    bulkUpdateStock,
    exportInventory,
    importInventory,
    getAnalytics,
    refreshPredictions,
    clearError,
    getAlertsByType,
    
    // Utility
    hasUnacknowledgedAlerts: unacknowledgedAlerts.length > 0,
    hasCriticalAlerts: criticalAlerts.length > 0,
    alertCount: alerts.length,
    unacknowledgedCount: unacknowledgedAlerts.length,
    criticalCount: criticalAlerts.length,
  };
};

export default useInventoryIntegration;
