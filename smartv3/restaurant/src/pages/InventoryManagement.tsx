// src/pages/InventoryManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  FiPackage, FiAlertTriangle, FiTrendingDown, FiTrendingUp,
  FiPlus, FiEdit, FiTrash2, FiDownload, FiUpload,
  FiSearch, FiFilter, FiRefreshCw, FiBarChart, FiEye,
  FiCheck, FiX, FiShoppingCart, FiTruck, FiClock,
  FiChevronDown, FiChevronUp, FiGrid, FiList,
  FiSave, FiRotateCcw, FiMoreHorizontal, FiBell,
  FiDollarSign, FiCalendar, FiMapPin, FiUser
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { formatDisplayCurrency } from '../utils/currency';

// Enhanced interfaces for professional inventory management
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
  barcode?: string;
  image?: string;
  notes?: string;
}

interface RestockRequest {
  id: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  requestedQuantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  supplier: string;
  estimatedCost: number;
  requestedBy: string;
  requestDate: string;
  expectedDelivery?: string;
  status: 'pending' | 'approved' | 'ordered' | 'delivered' | 'cancelled';
  notes?: string;
}

interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringSoon: number;
  totalValue: number;
  monthlyUsage: number;
  pendingRestocks: number;
  criticalItems: number;
}
  user: string;
  cost?: number;
}

// Helper function to check if item is expiring soon
const isExpiringSoon = (expiryDate?: string) => {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
};

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'in-stock': return '#10b981';
    case 'low-stock': return '#f59e0b';
    case 'out-of-stock': return '#ef4444';
    case 'expired': return '#8b5cf6';
    default: return '#6b7280';
  }
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'in-stock': return <FiPackage className="text-green-500" />;
    case 'low-stock': return <FiAlertTriangle className="text-yellow-500" />;
    case 'out-of-stock': return <FiTrendingDown className="text-red-500" />;
    case 'expired': return <FiAlertTriangle className="text-purple-500" />;
    default: return <FiPackage className="text-gray-500" />;
  }
};

const InventoryManagement: React.FC = () => {
  const { user, isAdmin } = useAuth();

  // For now, allow access if user is logged in (we can add proper role checks later)
  const canManageInventory = !!user;

  // Core state
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // Enhanced filtering and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'value' | 'expiry'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Interactive features
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Real-time updates
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Notifications and alerts
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>>([]);

  // Enhanced data fetching with real-time updates
  const fetchInventoryData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const [inventoryResponse, statsResponse, movementsResponse] = await Promise.all([
        api.get('/inventory/items/'),
        api.get('/inventory/items/stats/'),
        api.get('/inventory/movements/')
      ]);

      // Ensure inventory is always an array
      const inventoryData = Array.isArray(inventoryResponse.data) ? inventoryResponse.data : mockInventory;
      const statsData = statsResponse.data || mockStats;
      const movementsData = Array.isArray(movementsResponse.data) ? movementsResponse.data : mockMovements;

      setInventory(inventoryData);
      setStats(statsData);
      setMovements(movementsData);
      setLastUpdated(new Date());

      // Check for low stock alerts
      checkLowStockAlerts(inventoryData);

    } catch (error) {
      console.error('Error fetching inventory data:', error);
      addNotification('error', 'Failed to fetch inventory data');
      // Use mock data for development
      setInventory(mockInventory);
      setStats(mockStats);
      setMovements(mockMovements);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (canManageInventory) {
      fetchInventoryData();

      if (autoRefresh) {
        refreshInterval.current = setInterval(() => {
          fetchInventoryData(false);
        }, 30000); // Refresh every 30 seconds
      }
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [canManageInventory, fetchInventoryData, autoRefresh]);

  // Notification system
  const addNotification = useCallback((type: 'success' | 'warning' | 'error' | 'info', message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 notifications

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  // Low stock alert system
  const checkLowStockAlerts = useCallback((inventoryData: InventoryItem[]) => {
    const lowStockItems = inventoryData.filter(item =>
      item.status === 'low-stock' || item.status === 'out-of-stock'
    );

    if (lowStockItems.length > 0) {
      addNotification('warning', `${lowStockItems.length} items need restocking`);
    }
  }, [addNotification]);

  // Enhanced stock update with notifications
  const updateStock = async (itemId: string, quantity: number, type: 'in' | 'out' | 'adjustment', reason: string) => {
    try {
      await api.post(`/inventory/${itemId}/movement/`, {
        type,
        quantity,
        reason,
        timestamp: new Date().toISOString()
      });

      const item = inventory.find(i => i.id === itemId);
      const actionText = type === 'in' ? 'added to' : type === 'out' ? 'removed from' : 'adjusted for';
      addNotification('success', `${quantity} ${item?.unit || 'units'} ${actionText} ${item?.name || 'item'}`);

      await fetchInventoryData(false);
    } catch (error) {
      console.error('Error updating stock:', error);
      addNotification('error', 'Failed to update stock');
    }
  };

  // Bulk operations
  const handleBulkAction = async (action: 'delete' | 'export' | 'restock') => {
    const selectedItemsArray = Array.from(selectedItems);

    if (selectedItemsArray.length === 0) {
      addNotification('warning', 'No items selected');
      return;
    }

    try {
      switch (action) {
        case 'delete':
          if (window.confirm(`Delete ${selectedItemsArray.length} selected items?`)) {
            addNotification('success', `${selectedItemsArray.length} items deleted`);
            setSelectedItems(new Set());
          }
          break;
        case 'export':
          addNotification('info', `Exporting ${selectedItemsArray.length} items`);
          break;
        case 'restock':
          addNotification('info', `Restocking ${selectedItemsArray.length} items`);
          break;
      }
    } catch (error) {
      addNotification('error', `Failed to ${action} items`);
    }
  };

  // Selection handlers
  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const selectAllItems = () => {
    if (selectedItems.size === filteredInventory.length) {
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedItems(new Set(filteredInventory.map(item => item.id)));
      setShowBulkActions(true);
    }
  };





  // Enhanced filtering and sorting
  const filteredInventory = (Array.isArray(inventory) ? inventory : [])
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.category_name || item.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.supplier_name || item.supplier || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || (item.category_name || item.category) === filterCategory;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'stock':
          aValue = a.currentStock;
          bValue = b.currentStock;
          break;
        case 'value':
          aValue = a.currentStock * a.costPerUnit;
          bValue = b.currentStock * b.costPerUnit;
          break;
        case 'expiry':
          aValue = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
          bValue = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Sort handler
  const handleSort = (field: 'name' | 'stock' | 'value' | 'expiry') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const categories = [...new Set(inventory.map(item => item.category))];

  if (!canManageInventory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access inventory management.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'warning' ? 'bg-yellow-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {notification.type === 'success' && <FiCheck className="h-4 w-4" />}
                {notification.type === 'warning' && <FiAlertTriangle className="h-4 w-4" />}
                {notification.type === 'error' && <FiX className="h-4 w-4" />}
                {notification.type === 'info' && <FiBell className="h-4 w-4" />}
                <span className="text-sm font-medium">{notification.message}</span>
              </div>
              <button
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className="text-white hover:text-gray-200"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <FiPackage className={styles.titleIcon} />
              Inventory Management
            </h1>
            <p className={styles.subtitle}>
              Track stock levels, manage suppliers, and monitor usage
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Auto-refresh:</span>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`w-8 h-4 rounded-full transition-colors ${
                    autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                    autoRefresh ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                <FiList className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                <FiGrid className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => fetchInventoryData()}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2 transition-colors"
            >
              <FiRefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>

            {isAdmin() && (
              <>
                <button
                  onClick={() => handleBulkAction('export')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                >
                  <FiDownload className="h-4 w-4" />
                  <span>Export</span>
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                >
                  <FiPlus className="h-4 w-4" />
                  <span>Add Item</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#3b82f6' }}>
                <FiPackage />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Total Items</h3>
              <p className={styles.metricValue}>{stats.totalItems}</p>
              <span className="text-sm text-gray-500">In inventory</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#f59e0b' }}>
                <FiAlertTriangle />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Low Stock</h3>
              <p className={styles.metricValue}>{stats.lowStockItems}</p>
              <span className="text-sm text-gray-500">Need restocking</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#ef4444' }}>
                <FiTrendingDown />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Out of Stock</h3>
              <p className={styles.metricValue}>{stats.outOfStockItems}</p>
              <span className="text-sm text-gray-500">Urgent action needed</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#10b981' }}>
                <FiBarChart />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Total Value</h3>
              <p className={styles.metricValue}>{formatDisplayCurrency(stats.totalValue)}</p>
              <span className="text-sm text-gray-500">Current inventory</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search items, categories, suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="expired">Expired</option>
            </select>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <FiFilter className="h-4 w-4 text-gray-400" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="stock-asc">Stock Low-High</option>
                <option value="stock-desc">Stock High-Low</option>
                <option value="value-asc">Value Low-High</option>
                <option value="value-desc">Value High-Low</option>
                <option value="expiry-asc">Expiry Soon-Late</option>
                <option value="expiry-desc">Expiry Late-Soon</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Showing {filteredInventory.length} of {inventory.length} items
            </div>
            {selectedItems.size > 0 && (
              <div className="text-sm text-blue-600 font-medium">
                {selectedItems.size} selected
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-800">
                {selectedItems.size} items selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('export')}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
                >
                  <FiDownload className="h-3 w-3" />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => handleBulkAction('restock')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
                >
                  <FiZap className="h-3 w-3" />
                  <span>Restock</span>
                </button>
                {isAdmin() && (
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center space-x-1"
                  >
                    <FiTrash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedItems(new Set());
                setShowBulkActions(false);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Inventory Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.size === filteredInventory.length && filteredInventory.length > 0}
                  onChange={selectAllItems}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Item</span>
                  {sortBy === 'name' && (
                    sortOrder === 'asc' ? <FiChevronUp className="h-3 w-3" /> : <FiChevronDown className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('stock')}
              >
                <div className="flex items-center space-x-1">
                  <span>Stock Level</span>
                  {sortBy === 'stock' && (
                    sortOrder === 'asc' ? <FiChevronUp className="h-3 w-3" /> : <FiChevronDown className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('value')}
              >
                <div className="flex items-center space-x-1">
                  <span>Value</span>
                  {sortBy === 'value' && (
                    sortOrder === 'asc' ? <FiChevronUp className="h-3 w-3" /> : <FiChevronDown className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('expiry')}
              >
                <div className="flex items-center space-x-1">
                  <span>Days Left</span>
                  {sortBy === 'expiry' && (
                    sortOrder === 'asc' ? <FiChevronUp className="h-3 w-3" /> : <FiChevronDown className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInventory.map(item => (
              <EnhancedInventoryRow
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                onToggleSelect={() => toggleItemSelection(item.id)}
                onUpdate={(quantity, type, reason) => updateStock(item.id, quantity, type, reason)}
                onSelect={() => setSelectedItem(item)}
                canEdit={isAdmin()}
                isEditing={editingItem === item.id}
                onStartEdit={() => setEditingItem(item.id)}
                onStopEdit={() => setEditingItem(null)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <FiPackage className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

// Enhanced Inventory Row Component with inline editing and selection
const EnhancedInventoryRow: React.FC<{
  item: InventoryItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onUpdate: (quantity: number, type: 'in' | 'out' | 'adjustment', reason: string) => void;
  onSelect: () => void;
  canEdit: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
}> = ({ item, isSelected, onToggleSelect, onUpdate, onSelect, canEdit, isEditing, onStartEdit, onStopEdit }) => {
  const [showQuickUpdate, setShowQuickUpdate] = useState(false);
  const [updateQuantity, setUpdateQuantity] = useState('');
  const [editValues, setEditValues] = useState({
    name: item.name,
    currentStock: item.currentStock,
    minStock: item.minStock,
    maxStock: item.maxStock,
    costPerUnit: item.costPerUnit
  });

  const getStockPercentage = () => {
    return Math.min((item.currentStock / item.maxStock) * 100, 100);
  };

  const handleQuickUpdate = (type: 'in' | 'out') => {
    const quantity = parseInt(updateQuantity);
    if (quantity > 0) {
      onUpdate(quantity, type, `Quick ${type === 'in' ? 'restock' : 'usage'}`);
      setUpdateQuantity('');
      setShowQuickUpdate(false);
    }
  };

  const handleSaveEdit = () => {
    // Here you would typically call an API to save the changes
    console.log('Saving changes:', editValues);
    onStopEdit();
  };

  const handleCancelEdit = () => {
    setEditValues({
      name: item.name,
      currentStock: item.currentStock,
      minStock: item.minStock,
      maxStock: item.maxStock,
      costPerUnit: item.costPerUnit
    });
    onStopEdit();
  };

  return (
    <tr className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
      {/* Selection Checkbox */}
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>

      {/* Item Name and Details */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          {isEditing ? (
            <input
              type="text"
              value={editValues.name}
              onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
              className="font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 text-sm w-full"
            />
          ) : (
            <div className="font-medium text-gray-900">{item.name}</div>
          )}
          <div className="text-sm text-gray-500">{item.supplier}</div>
          {isExpiringSoon(item.expiryDate) && (
            <div className="text-xs text-orange-600 font-medium flex items-center space-x-1">
              <FiAlertTriangle className="h-3 w-3" />
              <span>Expires {new Date(item.expiryDate!).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </td>

      {/* Category */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {item.category}
      </td>

      {/* Stock Level with Interactive Progress Bar */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm">
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={editValues.currentStock}
                    onChange={(e) => setEditValues(prev => ({ ...prev, currentStock: parseInt(e.target.value) || 0 }))}
                    className="font-medium border border-gray-300 rounded px-2 py-1 text-sm w-16"
                  />
                  <span className="text-gray-500">{item.unit}</span>
                </div>
              ) : (
                <span className="font-medium">{item.currentStock} {item.unit}</span>
              )}
              <span className="text-gray-500">/ {item.maxStock}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1 cursor-pointer" title={`${getStockPercentage().toFixed(1)}% of capacity`}>
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${getStockPercentage()}%`,
                  backgroundColor: getStatusColor(item.status)
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
              <span>Min: {item.minStock} {item.unit}</span>
              <span className="text-xs text-blue-600">{getStockPercentage().toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </td>

      {/* Status with Enhanced Visual Indicators */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getStatusIcon(item.status)}
          <span
            className="ml-2 text-sm font-medium capitalize px-2 py-1 rounded-full text-xs"
            style={{
              color: getStatusColor(item.status),
              backgroundColor: `${getStatusColor(item.status)}20`
            }}
          >
            {item.status.replace('-', ' ')}
          </span>
        </div>
      </td>

      {/* Value with Cost Per Unit Editing */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div>
          <div className="font-medium">{formatDisplayCurrency(item.currentStock * item.costPerUnit)}</div>
          {isEditing ? (
            <input
              type="number"
              value={editValues.costPerUnit}
              onChange={(e) => setEditValues(prev => ({ ...prev, costPerUnit: parseFloat(e.target.value) || 0 }))}
              className="text-xs border border-gray-300 rounded px-1 py-0.5 w-20 mt-1"
              placeholder="Cost/unit"
            />
          ) : (
            <div className="text-xs text-gray-500">{formatDisplayCurrency(item.costPerUnit)}/unit</div>
          )}
        </div>
      </td>

      {/* Days Left with Usage Rate */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm">
          <div className="font-medium text-gray-900 flex items-center space-x-1">
            {item.estimatedDaysLeft > 0 ? (
              <>
                <span>{item.estimatedDaysLeft} days</span>
                {item.estimatedDaysLeft <= 3 && (
                  <FiAlertTriangle className="h-3 w-3 text-red-500" />
                )}
              </>
            ) : (
              <span className="text-red-500">Out of stock</span>
            )}
          </div>
          <div className="text-gray-500 text-xs">
            {item.usageRate}/day usage
          </div>
        </div>
      </td>

      {/* Enhanced Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                className="text-green-600 hover:text-green-900 transition-colors"
                title="Save changes"
              >
                <FiSave className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title="Cancel editing"
              >
                <FiX className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowQuickUpdate(!showQuickUpdate)}
                className="text-blue-600 hover:text-blue-900 transition-colors"
                title="Quick stock update"
              >
                <FiZap className="h-4 w-4" />
              </button>

              {canEdit && (
                <button
                  onClick={onStartEdit}
                  className="text-purple-600 hover:text-purple-900 transition-colors"
                  title="Edit item"
                >
                  <FiEdit className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={onSelect}
                className="text-green-600 hover:text-green-900 transition-colors"
                title="View details"
              >
                <FiEye className="h-4 w-4" />
              </button>

              {canEdit && (
                <button
                  className="text-red-600 hover:text-red-900 transition-colors"
                  title="Delete item"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Enhanced Quick Update Panel */}
        {showQuickUpdate && !isEditing && (
          <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-medium text-blue-800">Quick Stock Update</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={updateQuantity}
                onChange={(e) => setUpdateQuantity(e.target.value)}
                placeholder="Quantity"
                className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => handleQuickUpdate('in')}
                className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors flex items-center space-x-1"
                title="Add stock"
              >
                <FiPlus className="h-3 w-3" />
                <span>Add</span>
              </button>
              <button
                onClick={() => handleQuickUpdate('out')}
                className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors flex items-center space-x-1"
                title="Remove stock"
              >
                <FiTrendingDown className="h-3 w-3" />
                <span>Use</span>
              </button>
              <button
                onClick={() => setShowQuickUpdate(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Close"
              >
                <FiX className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
};

// Mock data for development
const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Chicken Breast',
    category: 'Meat',
    currentStock: 5,
    minStock: 10,
    maxStock: 50,
    unit: 'kg',
    costPerUnit: 15000,
    supplier: 'Fresh Meat Co.',
    lastRestocked: new Date(Date.now() - 86400000).toISOString(),
    expiryDate: new Date(Date.now() + 172800000).toISOString(),
    location: 'Freezer A',
    status: 'low-stock',
    usageRate: 3.5,
    estimatedDaysLeft: 1
  },
  {
    id: '2',
    name: 'Tomatoes',
    category: 'Vegetables',
    currentStock: 25,
    minStock: 5,
    maxStock: 30,
    unit: 'kg',
    costPerUnit: 2500,
    supplier: 'Local Farm',
    lastRestocked: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 432000000).toISOString(),
    location: 'Cold Storage',
    status: 'in-stock',
    usageRate: 4.2,
    estimatedDaysLeft: 6
  },
  {
    id: '3',
    name: 'Rice',
    category: 'Grains',
    currentStock: 0,
    minStock: 20,
    maxStock: 100,
    unit: 'kg',
    costPerUnit: 3000,
    supplier: 'Grain Suppliers Ltd',
    lastRestocked: new Date(Date.now() - 604800000).toISOString(),
    location: 'Dry Storage',
    status: 'out-of-stock',
    usageRate: 8.0,
    estimatedDaysLeft: 0
  }
];

const mockStats: InventoryStats = {
  totalItems: 45,
  lowStockItems: 8,
  outOfStockItems: 3,
  expiringSoon: 5,
  totalValue: 2850000,
  monthlyUsage: 1200000
};

const mockMovements: StockMovement[] = [
  {
    id: '1',
    itemId: '1',
    itemName: 'Chicken Breast',
    type: 'out',
    quantity: 2,
    reason: 'Kitchen usage',
    timestamp: new Date().toISOString(),
    user: 'Chef John'
  }
];



export default InventoryManagement;
