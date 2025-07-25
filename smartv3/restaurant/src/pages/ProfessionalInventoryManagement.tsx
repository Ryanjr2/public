// src/pages/ProfessionalInventoryManagement.tsx
import React, { useState, useEffect, useRef } from 'react';
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
import { formatDisplayCurrency } from '../utils/currency';
import inventoryIntegrationService from '../services/inventoryIntegrationService';
import api from '../services/api';
import '../styles/ProfessionalInventory.css';

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

const ProfessionalInventoryManagement: React.FC = () => {
  const { user } = useAuth();
  
  // Core state
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    expiringSoon: 0,
    totalValue: 0,
    monthlyUsage: 0,
    pendingRestocks: 0,
    criticalItems: 0
  });
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'inventory' | 'restock' | 'analytics'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'value' | 'expiry'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showBulkRestockModal, setShowBulkRestockModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  // Mock data for demonstration
  const mockItems: InventoryItem[] = [
    {
      id: '1',
      name: 'Chicken Breast',
      category: 'Meat & Poultry',
      currentStock: 5,
      minStock: 10,
      maxStock: 50,
      unit: 'kg',
      costPerUnit: 12000,
      supplier: 'Fresh Meat Suppliers Ltd',
      supplierContact: '+255 123 456 789',
      lastRestocked: '2024-01-05',
      expiryDate: '2024-01-15',
      location: 'Freezer A1',
      status: 'low-stock',
      usageRate: 3,
      estimatedDaysLeft: 2,
      reorderPoint: 10,
      reorderQuantity: 30,
      barcode: '1234567890123',
      notes: 'Premium quality chicken breast'
    },
    {
      id: '2',
      name: 'Rice (Basmati)',
      category: 'Grains & Cereals',
      currentStock: 0,
      minStock: 25,
      maxStock: 100,
      unit: 'kg',
      costPerUnit: 3500,
      supplier: 'Grain Masters Co.',
      supplierContact: '+255 987 654 321',
      lastRestocked: '2023-12-28',
      location: 'Storage Room B2',
      status: 'out-of-stock',
      usageRate: 8,
      estimatedDaysLeft: 0,
      reorderPoint: 25,
      reorderQuantity: 75,
      barcode: '2345678901234',
      notes: 'High-quality basmati rice'
    },
    {
      id: '3',
      name: 'Tomatoes',
      category: 'Vegetables',
      currentStock: 25,
      minStock: 15,
      maxStock: 40,
      unit: 'kg',
      costPerUnit: 2500,
      supplier: 'Fresh Vegetables Market',
      supplierContact: '+255 555 123 456',
      lastRestocked: '2024-01-07',
      expiryDate: '2024-01-12',
      location: 'Cold Storage C1',
      status: 'in-stock',
      usageRate: 5,
      estimatedDaysLeft: 5,
      reorderPoint: 15,
      reorderQuantity: 25,
      barcode: '3456789012345',
      notes: 'Fresh organic tomatoes'
    },
    {
      id: '4',
      name: 'Cooking Oil',
      category: 'Oils & Condiments',
      currentStock: 8,
      minStock: 12,
      maxStock: 30,
      unit: 'liters',
      costPerUnit: 4500,
      supplier: 'Oil Distributors Ltd',
      supplierContact: '+255 777 888 999',
      lastRestocked: '2024-01-03',
      location: 'Storage Room A3',
      status: 'low-stock',
      usageRate: 2,
      estimatedDaysLeft: 4,
      reorderPoint: 12,
      reorderQuantity: 20,
      barcode: '4567890123456',
      notes: 'Premium sunflower oil'
    },
    {
      id: '5',
      name: 'Onions',
      category: 'Vegetables',
      currentStock: 30,
      minStock: 20,
      maxStock: 50,
      unit: 'kg',
      costPerUnit: 1800,
      supplier: 'Local Farmers Market',
      supplierContact: '+255 666 777 888',
      lastRestocked: '2024-01-06',
      location: 'Storage Room C2',
      status: 'in-stock',
      usageRate: 4,
      estimatedDaysLeft: 7,
      reorderPoint: 20,
      reorderQuantity: 30,
      barcode: '5678901234567',
      notes: 'Fresh red onions'
    }
  ];

  const mockRestockRequests: RestockRequest[] = [
    {
      id: 'req-1',
      itemId: '2',
      itemName: 'Rice (Basmati)',
      currentStock: 0,
      requestedQuantity: 75,
      urgency: 'critical',
      supplier: 'Grain Masters Co.',
      estimatedCost: 262500,
      requestedBy: 'Chef Maria',
      requestDate: '2024-01-08',
      expectedDelivery: '2024-01-10',
      status: 'pending',
      notes: 'Urgent - completely out of stock'
    },
    {
      id: 'req-2',
      itemId: '1',
      itemName: 'Chicken Breast',
      currentStock: 5,
      requestedQuantity: 30,
      urgency: 'high',
      supplier: 'Fresh Meat Suppliers Ltd',
      estimatedCost: 360000,
      requestedBy: 'Admin',
      requestDate: '2024-01-08',
      expectedDelivery: '2024-01-09',
      status: 'approved',
      notes: 'Running low, need fresh stock'
    }
  ];

  // Initialize with real data from API
  useEffect(() => {
    const initializeInventory = async () => {
      try {
        setLoading(true);

        // Start inventory monitoring
        await inventoryIntegrationService.startInventoryMonitoring();

        // Load inventory items
        const itemsResponse = await api.get('/inventory/items/');
        const inventoryItems = itemsResponse.data;

        // Transform API data to component format
        const transformedItems = inventoryItems.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          category: item.category?.name || 'Uncategorized',
          currentStock: parseFloat(item.current_stock || 0),
          minStock: parseFloat(item.min_stock || 0),
          maxStock: parseFloat(item.max_stock || 100),
          unit: item.unit || 'units',
          costPerUnit: parseFloat(item.cost_per_unit || 0),
          supplier: item.supplier?.name || 'Unknown Supplier',
          supplierContact: item.supplier?.contact_info || 'No contact info',
          lastRestocked: item.last_restocked || new Date().toISOString().split('T')[0],
          expiryDate: item.expiry_date,
          location: item.location || 'Storage',
          status: getItemStatus(item),
          usageRate: parseFloat(item.usage_rate || 1),
          estimatedDaysLeft: calculateDaysLeft(item),
          reorderPoint: parseFloat(item.reorder_point || item.min_stock || 10),
          reorderQuantity: parseFloat(item.reorder_quantity || 20),
          barcode: item.barcode,
          notes: item.notes
        }));

        setItems(transformedItems);

        // Load restock requests (mock for now, can be replaced with real API)
        setRestockRequests(mockRestockRequests);

        // Get real stats from API
        const statsResponse = await api.get('/inventory/items/stats/');
        const apiStats = statsResponse.data;

        const newStats = {
          totalItems: apiStats.total_items || transformedItems.length,
          lowStockItems: apiStats.low_stock_items || transformedItems.filter(item => item.status === 'low-stock').length,
          outOfStockItems: apiStats.out_of_stock_items || transformedItems.filter(item => item.status === 'out-of-stock').length,
          expiringSoon: apiStats.expiring_soon || transformedItems.filter(item => item.expiryDate && isExpiringSoon(item.expiryDate)).length,
          totalValue: apiStats.total_value || transformedItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0),
          monthlyUsage: apiStats.monthly_usage || transformedItems.reduce((sum, item) => sum + (item.usageRate * 30 * item.costPerUnit), 0),
          pendingRestocks: mockRestockRequests.filter(req => req.status === 'pending').length,
          criticalItems: transformedItems.filter(item => item.status === 'out-of-stock' || (item.status === 'low-stock' && item.estimatedDaysLeft <= 1)).length
        };

        setStats(newStats);
        setLoading(false);

        console.log('✅ Professional Inventory Management initialized with real data');
      } catch (error) {
        console.error('❌ Error initializing inventory:', error);

        // Fallback to mock data if API fails
        setItems(mockItems);
        setRestockRequests(mockRestockRequests);

        const fallbackStats = {
          totalItems: mockItems.length,
          lowStockItems: mockItems.filter(item => item.status === 'low-stock').length,
          outOfStockItems: mockItems.filter(item => item.status === 'out-of-stock').length,
          expiringSoon: mockItems.filter(item => item.expiryDate && isExpiringSoon(item.expiryDate)).length,
          totalValue: mockItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0),
          monthlyUsage: mockItems.reduce((sum, item) => sum + (item.usageRate * 30 * item.costPerUnit), 0),
          pendingRestocks: mockRestockRequests.filter(req => req.status === 'pending').length,
          criticalItems: mockItems.filter(item => item.status === 'out-of-stock' || (item.status === 'low-stock' && item.estimatedDaysLeft <= 1)).length
        };

        setStats(fallbackStats);
        setLoading(false);

        showNotification('warning', 'Using demo data - API connection failed');
      }
    };

    initializeInventory();
  }, []);

  // Helper function to check if item is expiring soon
  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  // Helper function to determine item status from API data
  const getItemStatus = (item: any): 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired' | 'discontinued' => {
    const currentStock = parseFloat(item.current_stock || 0);
    const minStock = parseFloat(item.min_stock || 0);

    if (currentStock === 0) return 'out-of-stock';
    if (currentStock <= minStock) return 'low-stock';

    // Check if expired
    if (item.expiry_date) {
      const expiryDate = new Date(item.expiry_date);
      const now = new Date();
      if (expiryDate < now) return 'expired';
    }

    return 'in-stock';
  };

  // Helper function to calculate days left
  const calculateDaysLeft = (item: any): number => {
    const currentStock = parseFloat(item.current_stock || 0);
    const usageRate = parseFloat(item.usage_rate || 1);

    if (usageRate === 0) return 999;
    return Math.floor(currentStock / usageRate);
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return '#10b981';
      case 'low-stock': return '#f59e0b';
      case 'out-of-stock': return '#ef4444';
      case 'expired': return '#8b5cf6';
      case 'discontinued': return '#6b7280';
      default: return '#6b7280';
    }
  };

  // Helper function to get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#f97316';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Show notification
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle restock item
  const handleRestockItem = (item: InventoryItem) => {
    setRestockingItem(item);
    setShowRestockModal(true);
  };

  // Handle quick restock (add reorder quantity)
  const handleQuickRestock = async (item: InventoryItem) => {
    try {
      setLoading(true);

      // Call real API to restock item
      await inventoryIntegrationService.restockItem(
        item.id,
        item.reorderQuantity,
        item.supplier,
        item.reorderQuantity * item.costPerUnit,
        `Quick restock - added ${item.reorderQuantity} ${item.unit}`
      );

      // Update local state
      const newStock = item.currentStock + item.reorderQuantity;
      const updatedItem = {
        ...item,
        currentStock: newStock,
        status: newStock >= item.minStock ? 'in-stock' as const : 'low-stock' as const,
        lastRestocked: new Date().toISOString().split('T')[0],
        estimatedDaysLeft: Math.floor(newStock / item.usageRate)
      };

      setItems(prevItems =>
        prevItems.map(i => i.id === item.id ? updatedItem : i)
      );

      // Update stats
      const updatedStats = {
        ...stats,
        lowStockItems: stats.lowStockItems - (item.status === 'low-stock' && updatedItem.status === 'in-stock' ? 1 : 0),
        outOfStockItems: stats.outOfStockItems - (item.status === 'out-of-stock' ? 1 : 0),
        totalValue: stats.totalValue + (item.reorderQuantity * item.costPerUnit)
      };
      setStats(updatedStats);

      showNotification('success', `Successfully restocked ${item.name} with ${item.reorderQuantity} ${item.unit}`);
      setLoading(false);
    } catch (error) {
      console.error('Error during quick restock:', error);
      showNotification('error', `Failed to restock ${item.name}. Please try again.`);
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
              marginBottom: '0.5rem'
            }}>
              Professional Inventory Management
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: 0 }}>
              Comprehensive stock management with intelligent restocking
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{
                background: autoRefresh ? '#10b981' : '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              <FiRefreshCw />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
            
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              <FiPlus />
              Add New Item
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '16px',
            padding: '1.5rem',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <FiPackage size={24} />
                <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Items</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalItems}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                Value: {formatDisplayCurrency(stats.totalValue)}
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '16px',
            padding: '1.5rem',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <FiAlertTriangle size={24} />
                <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Low Stock</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.lowStockItems}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Need attention</div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            borderRadius: '16px',
            padding: '1.5rem',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <FiTrendingDown size={24} />
                <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Out of Stock</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.outOfStockItems}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Critical items</div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            borderRadius: '16px',
            padding: '1.5rem',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <FiShoppingCart size={24} />
                <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Pending Restocks</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.pendingRestocks}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Awaiting approval</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          background: notification.type === 'success' ? '#10b981' : 
                     notification.type === 'error' ? '#ef4444' :
                     notification.type === 'warning' ? '#f59e0b' : '#3b82f6',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <FiBell />
          {notification.message}
        </div>
      )}

      {/* Main Content */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '2px solid #f3f4f6',
          paddingBottom: '1rem'
        }}>
          {[
            { id: 'inventory', label: 'Inventory Items', icon: FiPackage },
            { id: 'restock', label: 'Restock Requests', icon: FiShoppingCart },
            { id: 'analytics', label: 'Analytics', icon: FiBarChart }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div>
            {/* Search and Filters */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
                <FiSearch style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
                }} />
                <input
                  type="text"
                  placeholder="Search inventory items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'white'
                }}
              >
                <option value="all">All Categories</option>
                <option value="Meat & Poultry">Meat & Poultry</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Grains & Cereals">Grains & Cereals</option>
                <option value="Oils & Condiments">Oils & Condiments</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'white'
                }}
              >
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="expired">Expired</option>
              </select>

              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  color: '#374151'
                }}
              >
                {viewMode === 'table' ? <FiGrid /> : <FiList />}
              </button>
            </div>

            {/* Inventory Items */}
            {loading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '300px',
                fontSize: '1.1rem',
                color: '#6b7280'
              }}>
                Loading inventory items...
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr',
                gap: '1.5rem'
              }}>
                {items
                  .filter(item =>
                    (selectedCategory === 'all' || item.category === selectedCategory) &&
                    (selectedStatus === 'all' || item.status === selectedStatus) &&
                    (searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map(item => (
                    <div
                      key={item.id}
                      className="inventory-card"
                      style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        border: `2px solid ${getStatusColor(item.status)}20`,
                        position: 'relative'
                      }}
                    >
                      {/* Status Badge */}
                      <div
                        className={`status-badge ${item.status === 'out-of-stock' ? 'critical' : item.status === 'low-stock' ? 'low-stock' : ''}`}
                        style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          background: getStatusColor(item.status),
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}
                      >
                        {item.status.replace('-', ' ')}
                      </div>

                      {/* Item Header */}
                      <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          color: '#1f2937',
                          margin: '0 0 0.5rem 0'
                        }}>
                          {item.name}
                        </h3>
                        <p style={{
                          color: '#6b7280',
                          fontSize: '0.9rem',
                          margin: 0
                        }}>
                          {item.category} • {item.location}
                        </p>
                      </div>

                      {/* Stock Information */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                            Current Stock
                          </div>
                          <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: item.currentStock <= item.minStock ? '#ef4444' : '#10b981'
                          }}>
                            {item.currentStock} {item.unit}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                            Min Stock
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151' }}>
                            {item.minStock} {item.unit}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Stock Level</span>
                          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                            {Math.round((item.currentStock / item.maxStock) * 100)}%
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: '#f3f4f6',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%`,
                            height: '100%',
                            background: item.currentStock <= item.minStock ?
                              'linear-gradient(90deg, #ef4444, #dc2626)' :
                              'linear-gradient(90deg, #10b981, #059669)',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.8rem',
                        color: '#6b7280'
                      }}>
                        <div>
                          <FiDollarSign style={{ display: 'inline', marginRight: '0.25rem' }} />
                          {formatDisplayCurrency(item.costPerUnit)}/{item.unit}
                        </div>
                        <div>
                          <FiClock style={{ display: 'inline', marginRight: '0.25rem' }} />
                          {item.estimatedDaysLeft} days left
                        </div>
                        <div>
                          <FiTruck style={{ display: 'inline', marginRight: '0.25rem' }} />
                          {item.supplier}
                        </div>
                        <div>
                          <FiCalendar style={{ display: 'inline', marginRight: '0.25rem' }} />
                          Last: {new Date(item.lastRestocked).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleQuickRestock(item)}
                          disabled={item.status === 'in-stock'}
                          className="professional-button"
                          style={{
                            background: item.status === 'in-stock' ? '#e5e7eb' : 'linear-gradient(135deg, #10b981, #059669)',
                            color: item.status === 'in-stock' ? '#9ca3af' : 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem 1rem',
                            cursor: item.status === 'in-stock' ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            flex: 1,
                            justifyContent: 'center'
                          }}
                        >
                          <FiPlus />
                          Quick Restock ({item.reorderQuantity})
                        </button>

                        <button
                          onClick={() => handleRestockItem(item)}
                          className="professional-button"
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            flex: 1,
                            justifyContent: 'center'
                          }}
                        >
                          <FiShoppingCart />
                          Custom Restock
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Restock Requests Tab */}
        {activeTab === 'restock' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                Restock Requests
              </h2>
              <button
                onClick={() => setShowBulkRestockModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                <FiPlus />
                Bulk Restock Request
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {restockRequests.map(request => (
                <div
                  key={request.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: `2px solid ${getUrgencyColor(request.urgency)}20`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                          {request.itemName}
                        </h3>
                        <div style={{
                          background: getUrgencyColor(request.urgency),
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {request.urgency}
                        </div>
                        <div style={{
                          background: request.status === 'pending' ? '#f59e0b' :
                                     request.status === 'approved' ? '#10b981' :
                                     request.status === 'ordered' ? '#3b82f6' :
                                     request.status === 'delivered' ? '#059669' : '#6b7280',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {request.status}
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                            Current Stock
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ef4444' }}>
                            {request.currentStock} units
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                            Requested Quantity
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#10b981' }}>
                            {request.requestedQuantity} units
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                            Estimated Cost
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151' }}>
                            {formatDisplayCurrency(request.estimatedCost)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                            Expected Delivery
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151' }}>
                            {request.expectedDelivery ? new Date(request.expectedDelivery).toLocaleDateString() : 'TBD'}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
                        <strong>Supplier:</strong> {request.supplier} |
                        <strong> Requested by:</strong> {request.requestedBy} |
                        <strong> Date:</strong> {new Date(request.requestDate).toLocaleDateString()}
                      </div>

                      {request.notes && (
                        <div style={{
                          background: '#f9fafb',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          color: '#374151',
                          marginBottom: '1rem'
                        }}>
                          <strong>Notes:</strong> {request.notes}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                      {request.status === 'pending' && (
                        <>
                          <button
                            style={{
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.5rem 1rem',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: '500'
                            }}
                          >
                            <FiCheck /> Approve
                          </button>
                          <button
                            style={{
                              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.5rem 1rem',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: '500'
                            }}
                          >
                            <FiX /> Reject
                          </button>
                        </>
                      )}
                      <button
                        style={{
                          background: '#f3f4f6',
                          color: '#374151',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}
                      >
                        <FiEye /> Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '2rem' }}>
              Inventory Analytics
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  Monthly Usage Trends
                </h3>
                <div style={{
                  height: '200px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280'
                }}>
                  Usage trends chart will be displayed here
                </div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  Cost Analysis
                </h3>
                <div style={{
                  height: '200px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280'
                }}>
                  Cost breakdown chart will be displayed here
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalInventoryManagement;
