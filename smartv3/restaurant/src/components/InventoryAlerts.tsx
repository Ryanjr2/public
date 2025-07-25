// src/components/InventoryAlerts.tsx
import React, { useState, useEffect } from 'react';
import {
  FiAlertTriangle, FiAlertCircle, FiX, FiCheck,
  FiPackage, FiClock, FiTrendingDown, FiBell
} from 'react-icons/fi';

// Define interface directly in component to avoid import issues
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

// Mock inventory service for now
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

interface InventoryAlertsProps {
  showAll?: boolean;
  maxAlerts?: number;
  onAlertClick?: (alert: InventoryAlert) => void;
}

const InventoryAlerts: React.FC<InventoryAlertsProps> = ({
  showAll = false,
  maxAlerts = 5,
  onAlertClick
}) => {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use mock data for now to avoid import issues
    setTimeout(() => {
      setAlerts(mockAlerts);
      setLoading(false);
    }, 1000);
  }, []);

  const getAlertIcon = (type: InventoryAlert['type']) => {
    switch (type) {
      case 'low_stock':
        return <FiTrendingDown className="h-4 w-4" />;
      case 'out_of_stock':
        return <FiPackage className="h-4 w-4" />;
      case 'expiring_soon':
        return <FiClock className="h-4 w-4" />;
      case 'expired':
        return <FiAlertTriangle className="h-4 w-4" />;
      default:
        return <FiBell className="h-4 w-4" />;
    }
  };

  const getAlertColor = (severity: InventoryAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'low':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const handleAcknowledge = async (alertId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      // Update local state to acknowledge the alert
      setAlerts(prevAlerts =>
        prevAlerts.map(alert =>
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleAlertClick = (alert: InventoryAlert) => {
    if (onAlertClick) {
      onAlertClick(alert);
    }
  };

  const displayAlerts = showAll ? alerts : alerts.slice(0, maxAlerts);
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiAlertCircle className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
            {unacknowledgedAlerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unacknowledgedAlerts.length}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="max-h-96 overflow-y-auto">
        {displayAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <FiCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500">No inventory alerts</p>
            <p className="text-sm text-gray-400">All items are properly stocked</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {displayAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  alert.acknowledged ? 'opacity-60' : ''
                }`}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="flex items-start space-x-3">
                  {/* Alert Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-full ${getAlertColor(alert.severity)}`}>
                    {getAlertIcon(alert.type)}
                  </div>

                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {alert.itemName}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAlertColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        {!alert.acknowledged && (
                          <button
                            onClick={(e) => handleAcknowledge(alert.id, e)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Acknowledge alert"
                          >
                            <FiCheck className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {alert.timestamp.toLocaleString()}
                      </span>
                      {alert.acknowledged && (
                        <span className="text-xs text-green-600 flex items-center space-x-1">
                          <FiCheck className="h-3 w-3" />
                          <span>Acknowledged</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {alerts.length > maxAlerts && !showAll && (
        <div className="p-4 border-t border-gray-200 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View all {alerts.length} alerts
          </button>
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;
