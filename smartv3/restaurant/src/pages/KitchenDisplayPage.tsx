// src/pages/KitchenDisplayPage.tsx
import React, { useState, useEffect } from 'react';
import {
  FiClock, FiUser, FiCheck, FiAlertCircle, FiPlay,
  FiPause, FiRefreshCw, FiChevronUp, FiChevronDown,
  FiUsers, FiMapPin, FiPhone, FiPlus, FiPackage,
  FiAlertTriangle, FiBell
} from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import { reportingService, type CompletedOrder } from '../services/reportingService';
import { dataService, type Order as PersistentOrder } from '../services/dataService';
import inventoryIntegrationService from '../services/inventoryIntegrationService';
import InventoryAlerts from '../components/InventoryAlerts';
import api from '../services/api';
import styles from './KitchenDisplay.module.css';

interface KitchenOrderItem {
  id: number;
  name: string;
  quantity: number;
  special_instructions?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  preparation_time: number; // in minutes
  started_at?: string;
  completed_at?: string;
  assigned_chef?: string;
  priority: 'normal' | 'high' | 'urgent';
}

interface KitchenOrder {
  id: number;
  order_number: string;
  customer_name: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  table_number?: number;
  customer_phone?: string;
  items: KitchenOrderItem[];
  total_prep_time: number;
  status: 'new' | 'in_progress' | 'ready' | 'completed';
  priority: 'normal' | 'high' | 'urgent';
  created_at: string;
  estimated_completion: string;
  special_instructions?: string;
}

interface KitchenStats {
  active_orders: number;
  pending_items: number;
  average_prep_time: number;
  orders_completed_today: number;
  current_wait_time: number;
}

const KitchenDisplayPage: React.FC = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [stats, setStats] = useState<KitchenStats>({
    active_orders: 0,
    pending_items: 0,
    average_prep_time: 0,
    orders_completed_today: 0,
    current_wait_time: 0
  });
  const [selectedChef, setSelectedChef] = useState('all');
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'table'>('priority');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showInventoryAlerts, setShowInventoryAlerts] = useState(false);
  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);
  const [criticalCount, setCriticalCount] = useState(0);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);

  // Inventory integration
  useEffect(() => {
    // Subscribe to inventory alerts
    const unsubscribe = inventoryIntegrationService.subscribeToAlerts((alerts) => {
      setInventoryAlerts(alerts);
      setCriticalCount(alerts.filter(alert =>
        !alert.acknowledged && (alert.severity === 'high' || alert.severity === 'critical')
      ).length);
      setUnacknowledgedCount(alerts.filter(alert => !alert.acknowledged).length);
    });

    // Start monitoring
    inventoryIntegrationService.startInventoryMonitoring();

    return unsubscribe;
  }, []);

  // Computed values
  const hasCriticalAlerts = criticalCount > 0;
  const hasUnacknowledgedAlerts = unacknowledgedCount > 0;

  // Mock kitchen staff
  const kitchenStaff = [
    { id: 1, name: 'Chef Maria', speciality: 'Main Dishes', active: true },
    { id: 2, name: 'Chef John', speciality: 'Appetizers', active: true },
    { id: 3, name: 'Chef Sarah', speciality: 'Desserts', active: true },
    { id: 4, name: 'Chef David', speciality: 'Beverages', active: true }
  ];

  // Mock kitchen orders
  const mockOrders: KitchenOrder[] = [
    {
      id: 1,
      order_number: 'ORD-001',
      customer_name: 'John Mwangi',
      order_type: 'dine_in',
      table_number: 5,
      items: [
        {
          id: 1, name: 'Nyama Choma', quantity: 2, status: 'preparing',
          preparation_time: 25, started_at: new Date(Date.now() - 10 * 60000).toISOString(),
          assigned_chef: 'Chef Maria', priority: 'normal'
        },
        {
          id: 2, name: 'Ugali', quantity: 2, status: 'ready',
          preparation_time: 10, completed_at: new Date().toISOString(),
          assigned_chef: 'Chef John', priority: 'normal'
        },
        {
          id: 3, name: 'Chai ya Tangawizi', quantity: 2, status: 'pending',
          preparation_time: 5, assigned_chef: 'Chef David', priority: 'normal'
        }
      ],
      total_prep_time: 40,
      status: 'in_progress',
      priority: 'normal',
      created_at: new Date(Date.now() - 15 * 60000).toISOString(),
      estimated_completion: new Date(Date.now() + 15 * 60000).toISOString(),
      special_instructions: 'Medium spice level'
    },
    {
      id: 2,
      order_number: 'ORD-002',
      customer_name: 'Fatuma Hassan',
      order_type: 'delivery',
      customer_phone: '+255 754 987 654',
      items: [
        {
          id: 4, name: 'Pilau', quantity: 3, status: 'pending',
          preparation_time: 30, assigned_chef: 'Chef Maria', priority: 'high'
        },
        {
          id: 5, name: 'Samosa', quantity: 6, status: 'pending',
          preparation_time: 15, assigned_chef: 'Chef John', priority: 'high'
        }
      ],
      total_prep_time: 45,
      status: 'new',
      priority: 'high',
      created_at: new Date(Date.now() - 5 * 60000).toISOString(),
      estimated_completion: new Date(Date.now() + 40 * 60000).toISOString(),
      special_instructions: 'Call when ready for pickup'
    },
    {
      id: 3,
      order_number: 'ORD-003',
      customer_name: 'David Kimani',
      order_type: 'takeaway',
      items: [
        {
          id: 6, name: 'Chapati na Mchuzi', quantity: 4, status: 'ready',
          preparation_time: 20, completed_at: new Date(Date.now() - 2 * 60000).toISOString(),
          assigned_chef: 'Chef Maria', priority: 'urgent'
        },
        {
          id: 7, name: 'Juice ya Maembe', quantity: 2, status: 'ready',
          preparation_time: 5, completed_at: new Date(Date.now() - 1 * 60000).toISOString(),
          assigned_chef: 'Chef David', priority: 'urgent'
        }
      ],
      total_prep_time: 25,
      status: 'ready',
      priority: 'urgent',
      created_at: new Date(Date.now() - 25 * 60000).toISOString(),
      estimated_completion: new Date(Date.now() - 2 * 60000).toISOString()
    }
  ];

  useEffect(() => {
    // Load orders from persistent storage
    loadOrdersFromStorage();

    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Auto-refresh orders every 30 seconds (load fresh data from storage)
    let refreshInterval: NodeJS.Timeout;
    if (autoRefresh) {
      refreshInterval = setInterval(() => {
        loadOrdersFromStorage();
      }, 30000);
    }

    return () => {
      clearInterval(timeInterval);
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [autoRefresh]);

  const loadOrdersFromStorage = async () => {
    try {
      // First, try to fetch fresh orders from the backend API
      await loadOrdersFromAPI();
    } catch (error) {
      console.error('Failed to load orders from API, falling back to storage:', error);

      // Fallback to local storage
      try {
        const persistentOrders = dataService.getOrders();
        // Convert persistent orders to kitchen orders format
        const kitchenOrders: KitchenOrder[] = persistentOrders
          .filter(order => order.status !== 'served' && order.status !== 'cancelled')
          .map(order => ({
            id: order.id,
            order_number: order.order_number,
            customer_name: order.customer_name,
            order_type: order.order_type,
            table_number: order.table_number,
            customer_phone: order.customer_phone,
            items: order.items.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              special_instructions: item.special_instructions,
              status: item.status,
              preparation_time: getItemPrepTime(item.name),
              assigned_chef: getAssignedChef(item.name),
              priority: 'normal' as const
            })),
            total_prep_time: order.items.reduce((sum, item) => sum + getItemPrepTime(item.name), 0),
            status: mapOrderStatus(order.status),
            priority: order.priority,
            created_at: order.created_at,
            estimated_completion: order.estimated_completion,
            special_instructions: order.special_instructions
          }));

        setOrders(kitchenOrders);
        updateStats(kitchenOrders);
        console.log('📋 Loaded orders from storage:', kitchenOrders.length);
      } catch (storageError) {
        console.error('Failed to load orders from storage:', storageError);
        // Final fallback to mock data
        setOrders(mockOrders);
        updateStats(mockOrders);
      }
    }
  };

  // Enhanced function to load orders from backend API
  const loadOrdersFromAPI = async () => {
    try {
      const response = await api.get('/orders/kitchen_queue/');
      const apiOrders = response.data.results || response.data;

      console.log('🔍 DEBUG: Raw API response:', response.data);
      console.log('🔍 DEBUG: API orders count:', apiOrders.length);
      console.log('🔍 DEBUG: API orders:', apiOrders.map((o: any) => ({ id: o.id, status: o.status })));

      // Filter out completed orders on frontend as additional safety
      const activeApiOrders = apiOrders.filter((order: any) =>
        !['served', 'paid', 'cancelled'].includes(order.status)
      );

      console.log('🔍 DEBUG: Active orders after filtering:', activeApiOrders.length);

      // Convert API orders to kitchen orders format
      const kitchenOrders: KitchenOrder[] = activeApiOrders.map((order: any) => ({
        id: order.id,
        order_number: `ORD-${order.id.toString().padStart(3, '0')}`,
        customer_name: order.customer_name ||
          (order.customer_first_name && order.customer_last_name ?
            `${order.customer_first_name} ${order.customer_last_name}` :
            `Customer ${order.id}`),
        order_type: order.is_takeout ? 'takeaway' : 'dine_in',
        table_number: order.table_number,
        customer_phone: order.customer?.phone || order.phone,
        items: order.items.map((item: any) => ({
          id: item.id,
          name: item.menu_item?.name || item.menu_item,
          quantity: item.quantity,
          status: mapAPIStatusToKitchen(order.status),
          preparation_time: getItemPrepTime(item.menu_item?.name || item.menu_item),
          special_instructions: item.special_instructions || order.kitchen_notes,
          assigned_chef: getAssignedChef(item.menu_item?.name || item.menu_item),
          priority: order.priority || 'normal'
        })),
        total_prep_time: order.items.reduce((total: number, item: any) =>
          total + getItemPrepTime(item.menu_item?.name || item.menu_item), 0),
        status: mapAPIStatusToKitchen(order.status),
        priority: order.priority || 'normal',
        created_at: order.created_at,
        estimated_completion: order.estimated_completion ||
          new Date(Date.now() + 30 * 60000).toISOString(), // 30 min default
        special_instructions: order.kitchen_notes
      }));

      setOrders(kitchenOrders);
      updateStats(kitchenOrders);
      console.log('🔄 Loaded orders from API:', kitchenOrders.length);
      return kitchenOrders;
    } catch (error: any) {
      console.error('API request failed:', error);

      // Check if it's an authentication error
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('🔐 Authentication required for kitchen API access');
        console.warn('💡 Tip: Login with a real backend account (not test account) for full API access');
      }

      throw error; // Re-throw to trigger fallback
    }
  };

  // Helper function to map API status to kitchen status
  const mapAPIStatusToKitchen = (apiStatus: string): 'pending' | 'preparing' | 'ready' | 'served' => {
    switch (apiStatus) {
      case 'pending': return 'pending';
      case 'preparing': return 'preparing';
      case 'ready': return 'ready';
      case 'completed': return 'served';
      default: return 'pending';
    }
  };

  const saveOrdersToStorage = (kitchenOrders: KitchenOrder[]) => {
    try {
      const persistentOrders = dataService.getOrders();

      // Update existing orders with kitchen status
      const updatedOrders = persistentOrders.map(order => {
        const kitchenOrder = kitchenOrders.find(ko => ko.id === order.id);
        if (kitchenOrder) {
          return {
            ...order,
            status: mapKitchenStatusToOrder(kitchenOrder.status),
            items: order.items.map(item => {
              const kitchenItem = kitchenOrder.items.find(ki => ki.id === item.id);
              return kitchenItem ? { ...item, status: kitchenItem.status } : item;
            })
          };
        }
        return order;
      });

      dataService.saveOrders(updatedOrders);
      console.log('💾 Orders saved to storage');
    } catch (error) {
      console.error('Failed to save orders to storage:', error);
    }
  };

  // Helper functions
  const getItemPrepTime = (itemName: string): number => {
    const prepTimes: { [key: string]: number } = {
      'Nyama Choma': 25,
      'Ugali': 10,
      'Chai ya Tangawizi': 5,
      'Pilau': 30,
      'Samosa': 15,
      'Chapati na Mchuzi': 20,
      'Juice ya Maembe': 5
    };
    return prepTimes[itemName] || 15;
  };

  const getAssignedChef = (itemName: string): string => {
    const chefAssignments: { [key: string]: string } = {
      'Nyama Choma': 'Chef Maria',
      'Ugali': 'Chef John',
      'Chai ya Tangawizi': 'Chef David',
      'Pilau': 'Chef Maria',
      'Samosa': 'Chef John',
      'Chapati na Mchuzi': 'Chef Maria',
      'Juice ya Maembe': 'Chef David'
    };
    return chefAssignments[itemName] || 'Chef Maria';
  };

  const mapOrderStatus = (orderStatus: string): KitchenOrder['status'] => {
    switch (orderStatus) {
      case 'pending': return 'new';
      case 'confirmed': return 'new';
      case 'preparing': return 'in_progress';
      case 'ready': return 'ready';
      case 'completed': return 'completed';
      default: return 'new';
    }
  };

  const mapKitchenStatusToOrder = (kitchenStatus: KitchenOrder['status']): PersistentOrder['status'] => {
    switch (kitchenStatus) {
      case 'new': return 'confirmed';
      case 'in_progress': return 'preparing';
      case 'ready': return 'ready';
      case 'completed': return 'completed';
      default: return 'confirmed';
    }
  };

  const updateStats = (orderList: KitchenOrder[]) => {
    const activeOrders = orderList.filter(order => 
      order.status === 'new' || order.status === 'in_progress'
    ).length;
    
    const pendingItems = orderList.reduce((sum, order) => 
      sum + order.items.filter(item => item.status === 'pending').length, 0
    );

    const completedToday = orderList.filter(order =>
      order.status === 'served' &&
      new Date(order.created_at).toDateString() === new Date().toDateString()
    ).length;

    setStats({
      active_orders: activeOrders,
      pending_items: pendingItems,
      average_prep_time: 18, // Mock average
      orders_completed_today: completedToday + 15, // Mock completed
      current_wait_time: 12 // Mock wait time
    });
  };

  const updateItemStatus = async (orderId: number, itemId: number, newStatus: KitchenOrderItem['status']) => {
    try {
      // Send real-time item status update to backend immediately
      await updateItemStatusAPI(orderId, itemId, newStatus);
      console.log(`🔄 Real-time update sent: Order ${orderId}, Item ${itemId} → ${newStatus}`);
    } catch (error) {
      console.error('Failed to send real-time item status update:', error);
    }

    // Update local state immediately for responsive UI
    setOrders(prev => {
      const updatedOrders = prev.map(order => {
        if (order.id === orderId) {
          const updatedOrder = {
            ...order,
            items: order.items.map(item =>
              item.id === itemId ? {
                ...item,
                status: newStatus,
                started_at: newStatus === 'preparing' ? new Date().toISOString() : item.started_at,
                completed_at: newStatus === 'ready' ? new Date().toISOString() : item.completed_at
              } : item
            )
          };

          // Auto-update order status based on item statuses
          const allItemsReady = updatedOrder.items.every(item =>
            item.status === 'ready' || item.status === 'served'
          );
          const anyItemPreparing = updatedOrder.items.some(item =>
            item.status === 'preparing'
          );

          if (allItemsReady && updatedOrder.status !== 'ready') {
            updatedOrder.status = 'ready';
            // Update backend order status to 'ready'
            updateOrderStatusAPI(orderId, 'ready');
          } else if (anyItemPreparing && updatedOrder.status === 'new') {
            updatedOrder.status = 'in_progress';
            // Update backend order status to 'preparing'
            updateOrderStatusAPI(orderId, 'preparing');
          }

          // If all items are served, mark order as completed and remove from kitchen display
          const allItemsServed = updatedOrder.items.every(item => item.status === 'served');
          if (allItemsServed) {
            updatedOrder.status = 'served';
            // Update backend order status to 'served'
            updateOrderStatusAPI(orderId, 'served');
            console.log('✅ Order served, will be removed from kitchen display:', orderId);
          }

          return updatedOrder;
        }
        return order;
      });

      // Filter out completed orders from display
      const activeOrders = updatedOrders.filter(order =>
        order.status !== 'served'
      );

      // Save to persistent storage
      saveOrdersToStorage(activeOrders);

      return activeOrders;
    });
  };

  // Function to update order status in backend API
  const updateOrderStatusAPI = async (orderId: number, status: string) => {
    try {
      // Use the correct update_status endpoint with correct field name
      await api.post(`/orders/${orderId}/update_status/`, {
        status: status,  // Changed from 'new_status' to 'status'
        notes: `Status updated by kitchen staff to ${status}`
      });
      console.log(`✅ Updated order ${orderId} status to ${status} in backend`);
    } catch (error) {
      console.error(`Failed to update order ${orderId} status in backend:`, error);
      // Don't throw error to avoid breaking the UI
    }
  };

  // Real-time item status update API for detailed customer tracking
  const updateItemStatusAPI = async (orderId: number, itemId: number, status: string) => {
    try {
      await api.post(`/orders/${orderId}/items/${itemId}/update_status/`, {
        new_status: status,
        updated_by: 'kitchen_staff',
        timestamp: new Date().toISOString(),
        notes: `Item ${status} by chef`
      });
      console.log(`🔄 Real-time: Item ${itemId} in order ${orderId} → ${status}`);
    } catch (error) {
      console.error(`❌ Failed to update item ${itemId} status:`, error);
      // Don't throw error to avoid breaking UI, but log it
    }
  };

  const assignChef = (orderId: number, itemId: number, chefName: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? {
        ...order,
        items: order.items.map(item => 
          item.id === itemId ? { ...item, assigned_chef: chefName } : item
        )
      } : order
    ));
  };

  const completeOrder = async (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      try {
        // Update backend order status to 'served' (the correct final status)
        await updateOrderStatusAPI(orderId, 'served');

        // Update order status in kitchen display
        const updatedOrders = orders.map(o =>
          o.id === orderId ? { ...o, status: 'served' as const } : o
        );
        setOrders(updatedOrders);

        // Update persistent storage - mark as served
        const persistentOrders = dataService.getOrders();
        const updatedPersistentOrders = persistentOrders.map(o =>
          o.id === orderId ? {
            ...o,
            status: 'served' as const,
            completed_at: new Date().toISOString()
          } : o
        );
        dataService.saveOrders(updatedPersistentOrders);

      // Convert kitchen order to completed order for reporting
      const completedOrder: CompletedOrder = {
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        order_type: order.order_type,
        table_number: order.table_number,
        items: order.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: getItemPrice(item.name),
          total_price: getItemPrice(item.name) * item.quantity,
          category: getItemCategory(item.name),
          preparation_time: item.preparation_time
        })),
        total_amount: calculateOrderTotal(order),
        tax_amount: calculateOrderTotal(order) * 0.15, // 15% VAT in Tanzania
        service_charge: order.order_type === 'dine_in' ? calculateOrderTotal(order) * 0.05 : 0, // 5% service charge for dine-in
        discount_amount: 0,
        payment_method: 'cash', // Default, would come from POS system
        staff_member: order.items[0]?.assigned_chef || 'Kitchen Staff',
        created_at: order.created_at,
        completed_at: new Date().toISOString(),
        preparation_time_actual: Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000),
        customer_rating: 5 // Default rating, would come from customer feedback
      };

        // Send to reporting service
        reportingService.addCompletedOrder(completedOrder);

        // Show completion notification
        alert(`✅ Order ${order.order_number} completed!\n💰 Total: ${formatCurrency(completedOrder.total_amount)}\n📊 Added to daily sales report\n💾 Status updated in real-time for customer`);

        // Remove completed orders from kitchen display after 30 seconds
        setTimeout(() => {
          setOrders(prev => prev.filter(o => o.id !== orderId));
        }, 30000);

      } catch (error) {
        console.error('Failed to complete order:', error);
        alert(`❌ Failed to complete order ${order.order_number}. Please try again.`);
      }
    }
  };

  // Helper functions for pricing and categorization
  const getItemPrice = (itemName: string): number => {
    const prices: { [key: string]: number } = {
      'Nyama Choma': 25000,
      'Ugali': 3000,
      'Chai ya Tangawizi': 2500,
      'Pilau': 22000,
      'Samosa': 2000,
      'Chapati na Mchuzi': 8000,
      'Juice ya Maembe': 4000
    };
    return prices[itemName] || 10000; // Default price
  };

  const getItemCategory = (itemName: string): string => {
    const categories: { [key: string]: string } = {
      'Nyama Choma': 'Main Dishes',
      'Ugali': 'Sides',
      'Chai ya Tangawizi': 'Beverages',
      'Pilau': 'Main Dishes',
      'Samosa': 'Appetizers',
      'Chapati na Mchuzi': 'Main Dishes',
      'Juice ya Maembe': 'Beverages'
    };
    return categories[itemName] || 'Other';
  };

  const calculateOrderTotal = (order: KitchenOrder): number => {
    return order.items.reduce((total, item) => {
      return total + (getItemPrice(item.name) * item.quantity);
    }, 0);
  };

  const addNewOrder = () => {
    // Simulate a new order coming in
    const newOrderId = Date.now();
    const newOrder: KitchenOrder = {
      id: newOrderId,
      order_number: `ORD-${String(newOrderId).slice(-3)}`,
      customer_name: 'New Customer',
      order_type: 'dine_in',
      table_number: Math.floor(Math.random() * 10) + 1,
      items: [
        {
          id: newOrderId + 1,
          name: 'Nyama Choma',
          quantity: 1,
          status: 'pending',
          preparation_time: 25,
          assigned_chef: 'Chef Maria',
          priority: 'normal'
        }
      ],
      total_prep_time: 25,
      status: 'new',
      priority: 'normal',
      created_at: new Date().toISOString(),
      estimated_completion: new Date(Date.now() + 25 * 60000).toISOString()
    };

    setOrders(prev => [...prev, newOrder]);
    alert('New order received!');
  };

  const getTimerDisplay = (item: KitchenOrderItem) => {
    if (item.status === 'pending') return `${item.preparation_time}m`;
    if (item.status === 'preparing' && item.started_at) {
      const elapsed = Math.floor((Date.now() - new Date(item.started_at).getTime()) / 60000);
      const remaining = Math.max(0, item.preparation_time - elapsed);
      if (remaining === 0) {
        return 'OVERDUE!';
      }
      return `${remaining}m left`;
    }
    if (item.status === 'ready' && item.completed_at) {
      const elapsed = Math.floor((Date.now() - new Date(item.completed_at).getTime()) / 60000);
      if (elapsed > 5) {
        return `⚠️ Ready ${elapsed}m ago`;
      }
      return `Ready ${elapsed}m ago`;
    }
    if (item.status === 'served') {
      return 'Served ✓';
    }
    return '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'preparing': return '#3b82f6';
      case 'ready': return '#10b981';
      case 'served': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'normal': return '#10b981';
      default: return '#6b7280';
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { urgent: 3, high: 2, normal: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'time':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'table':
        return (a.table_number || 999) - (b.table_number || 999);
      default:
        return 0;
    }
  });

  const filteredOrders = selectedChef === 'all' 
    ? sortedOrders 
    : sortedOrders.filter(order => 
        order.items.some(item => item.assigned_chef === selectedChef)
      );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Kitchen Display</h1>
          <div className={styles.currentTime}>
            {currentTime.toLocaleTimeString('en-TZ', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}
          </div>
        </div>
        <div className={styles.headerActions}>
          {/* Inventory Alert Indicator */}
          <button
            className={`${styles.inventoryButton} ${hasCriticalAlerts ? styles.critical : hasUnacknowledgedAlerts ? styles.warning : ''}`}
            onClick={() => setShowInventoryAlerts(!showInventoryAlerts)}
            title={`${unacknowledgedCount} inventory alerts`}
          >
            <FiPackage />
            {unacknowledgedCount > 0 && (
              <span className={styles.alertBadge}>{unacknowledgedCount}</span>
            )}
          </button>

          <label className={styles.autoRefresh}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh</span>
          </label>
          <button
            className={styles.newOrderButton}
            onClick={addNewOrder}
          >
            <FiPlus /> Simulate New Order
          </button>
          <button
            className={styles.refreshButton}
            onClick={() => {
              if (confirm('This will reset all orders to original state. Are you sure?')) {
                setOrders(mockOrders);
                updateStats(mockOrders);
              }
            }}
          >
            <FiRefreshCw /> Reset Orders
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.active_orders}</span>
          <span className={styles.statLabel}>Active Orders</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.pending_items}</span>
          <span className={styles.statLabel}>Pending Items</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.average_prep_time}m</span>
          <span className={styles.statLabel}>Avg Prep Time</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.orders_completed_today}</span>
          <span className={styles.statLabel}>Completed Today</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.current_wait_time}m</span>
          <span className={styles.statLabel}>Current Wait</span>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <label>Chef Filter:</label>
          <select
            value={selectedChef}
            onChange={(e) => setSelectedChef(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Chefs</option>
            {kitchenStaff.map(chef => (
              <option key={chef.id} value={chef.name}>{chef.name}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'time' | 'priority' | 'table')}
            className={styles.select}
          >
            <option value="priority">Priority</option>
            <option value="time">Order Time</option>
            <option value="table">Table Number</option>
          </select>
        </div>
      </div>

      {/* Inventory Alerts Panel */}
      {showInventoryAlerts && (
        <div className={styles.inventoryAlertsPanel}>
          <div className={styles.alertsPanelHeader}>
            <h3>Inventory Alerts</h3>
            <button
              onClick={() => setShowInventoryAlerts(false)}
              className={styles.closeButton}
            >
              ×
            </button>
          </div>
          <InventoryAlerts
            maxAlerts={8}
            onAlertClick={(alert) => {
              // Navigate to inventory management
              window.open('/dashboard/inventory', '_blank');
            }}
          />
        </div>
      )}

      {/* Critical Inventory Alerts Banner */}
      {hasCriticalAlerts && (
        <div className={styles.criticalAlertsBanner}>
          <FiAlertTriangle />
          <span>
            {criticalCount} critical inventory alert{criticalCount !== 1 ? 's' : ''} -
            Some ingredients may be running low!
          </span>
          <button
            onClick={() => setShowInventoryAlerts(true)}
            className={styles.viewAlertsButton}
          >
            View Details
          </button>
        </div>
      )}

      {/* Orders Grid */}
      <div className={styles.ordersGrid}>
        {filteredOrders.map(order => (
          <div key={order.id} className={`${styles.orderCard} ${styles[order.priority]}`}>
            <div className={styles.orderHeader}>
              <div className={styles.orderInfo}>
                <h3>{order.order_number}</h3>
                <div className={styles.orderMeta}>
                  <span className={styles.orderType}>
                    {order.order_type === 'dine_in' && <><FiUsers /> Table {order.table_number}</>}
                    {order.order_type === 'takeaway' && <><FiMapPin /> Takeaway</>}
                    {order.order_type === 'delivery' && <><FiPhone /> Delivery</>}
                  </span>
                  <span className={styles.customerName}>{order.customer_name}</span>
                </div>
              </div>
              <div className={styles.orderBadges}>
                <span 
                  className={styles.priorityBadge}
                  style={{ backgroundColor: getPriorityColor(order.priority) }}
                >
                  {order.priority}
                </span>
                <span className={styles.timeElapsed}>
                  {Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)}m ago
                </span>
              </div>
            </div>

            {order.special_instructions && (
              <div className={styles.specialInstructions}>
                <FiAlertCircle />
                <span>{order.special_instructions}</span>
              </div>
            )}

            <div className={styles.orderItems}>
              {order.items.map(item => (
                <div key={item.id} className={styles.orderItem}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemQuantity}>x{item.quantity}</span>
                    </div>
                    {item.special_instructions && (
                      <div className={styles.itemInstructions}>
                        {item.special_instructions}
                      </div>
                    )}
                    <div className={styles.itemMeta}>
                      <span className={styles.assignedChef}>{item.assigned_chef}</span>
                      <span className={styles.timer}>{getTimerDisplay(item)}</span>
                    </div>
                  </div>
                  
                  <div className={styles.itemActions}>
                    <span 
                      className={styles.itemStatus}
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    >
                      {item.status}
                    </span>
                    
                    <div className={styles.actionButtons}>
                      {item.status === 'pending' && (
                        <button
                          className={styles.startButton}
                          onClick={() => updateItemStatus(order.id, item.id, 'preparing')}
                        >
                          <FiPlay /> Start
                        </button>
                      )}
                      {item.status === 'preparing' && (
                        <button
                          className={styles.readyButton}
                          onClick={() => updateItemStatus(order.id, item.id, 'ready')}
                        >
                          <FiCheck /> Ready
                        </button>
                      )}
                      {item.status === 'ready' && (
                        <button
                          className={styles.servedButton}
                          onClick={() => updateItemStatus(order.id, item.id, 'served')}
                        >
                          <FiCheck /> Served
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {order.items.every(item => item.status === 'ready' || item.status === 'served') && (
              <div className={styles.orderFooter}>
                <button
                  className={styles.completeOrderButton}
                  onClick={() => completeOrder(order.id)}
                >
                  <FiCheck /> Complete Order
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className={styles.emptyState}>
          <FiClock size={48} />
          <h3>No orders in kitchen</h3>
          <p>All orders are completed or no orders match the current filter</p>
        </div>
      )}
    </div>
  );
};

export default KitchenDisplayPage;
