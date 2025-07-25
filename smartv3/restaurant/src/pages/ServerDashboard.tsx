// src/pages/ServerDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  FiUsers, FiShoppingCart, FiCreditCard, FiCalendar,
  FiGrid, FiClock, FiCheckCircle, FiAlertCircle,
  FiPlus, FiEdit, FiEye, FiTrendingUp
} from 'react-icons/fi';
import { usePermissions } from '../hooks/usePermissions';
import { formatDisplayCurrency } from '../utils/currency';
import api from '../services/api';
import styles from './Dashboard.module.css';

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrder?: Order;
  estimatedFreeTime?: string;
  serverAssigned?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  customerName?: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid';
  total: number;
  createdAt: string;
  serverName?: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  specialRequests?: string;
}

interface ServerMetrics {
  tablesServed: number;
  ordersToday: number;
  totalSales: number;
  avgOrderValue: number;
  customerSatisfaction: number;
}

interface Reservation {
  id: string;
  customerName: string;
  partySize: number;
  time: string;
  tableNumber?: string;
  status: 'confirmed' | 'seated' | 'completed' | 'cancelled';
  specialRequests?: string;
}

const ServerDashboard: React.FC = () => {
  const { user, canAccessOrders, canAssignTables } = usePermissions();
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [metrics, setMetrics] = useState<ServerMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  useEffect(() => {
    fetchServerData();
    // Set up real-time updates
    const interval = setInterval(fetchServerData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchServerData = async () => {
    try {
      setLoading(true);
      
      const [tablesResponse, ordersResponse, reservationsResponse, metricsResponse] = await Promise.all([
        api.get('/tables/'),
        api.get('/orders/my-orders/'),
        api.get('/reservations/today/'),
        api.get('/server/metrics/')
      ]);

      setTables(tablesResponse.data || mockTables);
      setOrders(ordersResponse.data || mockOrders);
      setReservations(reservationsResponse.data || mockReservations);
      setMetrics(metricsResponse.data || mockMetrics);
    } catch (error) {
      console.error('Error fetching server data:', error);
      // Use mock data for development
      setTables(mockTables);
      setOrders(mockOrders);
      setReservations(mockReservations);
      setMetrics(mockMetrics);
    } finally {
      setLoading(false);
    }
  };

  const assignTable = async (tableId: string, customerId?: string) => {
    try {
      await api.patch(`/tables/${tableId}/`, { 
        status: 'occupied',
        serverAssigned: user?.id 
      });
      await fetchServerData();
    } catch (error) {
      console.error('Error assigning table:', error);
    }
  };

  const createNewOrder = (tableNumber: string) => {
    // Navigate to order creation page
    window.location.href = `/orders/new?table=${tableNumber}`;
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'occupied': return '#ef4444';
      case 'reserved': return '#f59e0b';
      case 'cleaning': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getTableStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <FiCheckCircle className="text-green-500" />;
      case 'occupied': return <FiUsers className="text-red-500" />;
      case 'reserved': return <FiCalendar className="text-yellow-500" />;
      case 'cleaning': return <FiClock className="text-gray-500" />;
      default: return <FiAlertCircle className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <FiUsers className={styles.titleIcon} />
              Service Dashboard
            </h1>
            <p className={styles.subtitle}>
              Welcome back, {user?.firstName || user?.username}!
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Shift started: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Server Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#3b82f6' }}>
              <FiGrid />
            </div>
          </div>
          <div className={styles.metricContent}>
            <h3>Tables Served</h3>
            <p className={styles.metricValue}>{metrics?.tablesServed || 0}</p>
            <span className="text-sm text-gray-500">Today</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#10b981' }}>
              <FiShoppingCart />
            </div>
          </div>
          <div className={styles.metricContent}>
            <h3>Orders Taken</h3>
            <p className={styles.metricValue}>{metrics?.ordersToday || 0}</p>
            <span className="text-sm text-gray-500">This shift</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#8b5cf6' }}>
              <FiTrendingUp />
            </div>
          </div>
          <div className={styles.metricContent}>
            <h3>Total Sales</h3>
            <p className={styles.metricValue}>{formatDisplayCurrency(metrics?.totalSales || 0)}</p>
            <span className="text-sm text-gray-500">Revenue generated</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#f59e0b' }}>
              <FiCreditCard />
            </div>
          </div>
          <div className={styles.metricContent}>
            <h3>Avg Order</h3>
            <p className={styles.metricValue}>{formatDisplayCurrency(metrics?.avgOrderValue || 0)}</p>
            <span className="text-sm text-gray-500">Per customer</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Table Layout */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <FiGrid className="mr-2 text-blue-500" />
              Table Layout
            </h2>
            <div className="flex space-x-2 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                Available
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                Occupied
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                Reserved
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {tables.map(table => (
              <TableCard 
                key={table.id} 
                table={table} 
                onSelect={() => setSelectedTable(table)}
                onAssign={() => assignTable(table.id)}
                onCreateOrder={() => createNewOrder(table.number)}
              />
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Active Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold flex items-center mb-4">
              <FiShoppingCart className="mr-2 text-green-500" />
              My Active Orders
            </h2>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>

          {/* Today's Reservations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold flex items-center mb-4">
              <FiCalendar className="mr-2 text-purple-500" />
              Today's Reservations
            </h2>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {reservations.map(reservation => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Table Card Component
const TableCard: React.FC<{
  table: Table;
  onSelect: () => void;
  onAssign: () => void;
  onCreateOrder: () => void;
}> = ({ table, onSelect, onAssign, onCreateOrder }) => {
  return (
    <div 
      className="border-2 rounded-lg p-4 text-center cursor-pointer hover:shadow-md transition-all"
      style={{ borderColor: getTableStatusColor(table.status) }}
      onClick={onSelect}
    >
      <div className="flex justify-center mb-2">
        {getTableStatusIcon(table.status)}
      </div>
      <h3 className="font-semibold">Table {table.number}</h3>
      <p className="text-sm text-gray-600">{table.capacity} seats</p>
      <p className="text-xs capitalize mt-1" style={{ color: getTableStatusColor(table.status) }}>
        {table.status}
      </p>
      
      {table.status === 'available' && (
        <button
          onClick={(e) => { e.stopPropagation(); onAssign(); }}
          className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
        >
          Assign
        </button>
      )}
      
      {table.status === 'occupied' && (
        <button
          onClick={(e) => { e.stopPropagation(); onCreateOrder(); }}
          className="mt-2 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
        >
          New Order
        </button>
      )}
    </div>
  );
};

// Order Card Component
const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <div className="border rounded-lg p-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold">Order #{order.orderNumber}</h4>
          <p className="text-sm text-gray-600">Table {order.tableNumber}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${
          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {order.status}
        </span>
      </div>
      
      <p className="text-sm text-gray-700 mb-2">
        {order.items.length} items • {formatDisplayCurrency(order.total)}
      </p>
      
      <p className="text-xs text-gray-500">
        {new Date(order.createdAt).toLocaleTimeString()}
      </p>
    </div>
  );
};

// Reservation Card Component
const ReservationCard: React.FC<{ reservation: Reservation }> = ({ reservation }) => {
  return (
    <div className="border rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold">{reservation.customerName}</h4>
          <p className="text-sm text-gray-600">{reservation.partySize} guests</p>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(reservation.time).toLocaleTimeString()}
        </span>
      </div>
      
      {reservation.tableNumber && (
        <p className="text-sm text-blue-600">Table {reservation.tableNumber}</p>
      )}
      
      {reservation.specialRequests && (
        <p className="text-xs text-gray-500 mt-1 italic">
          {reservation.specialRequests}
        </p>
      )}
    </div>
  );
};

// Mock data for development
const mockTables: Table[] = [
  { id: '1', number: '1', capacity: 2, status: 'available' },
  { id: '2', number: '2', capacity: 4, status: 'occupied' },
  { id: '3', number: '3', capacity: 6, status: 'reserved' },
  { id: '4', number: '4', capacity: 2, status: 'available' },
  { id: '5', number: '5', capacity: 4, status: 'cleaning' },
  { id: '6', number: '6', capacity: 8, status: 'occupied' },
  { id: '7', number: '7', capacity: 2, status: 'available' },
  { id: '8', number: '8', capacity: 4, status: 'available' }
];

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    tableNumber: '2',
    customerName: 'John Doe',
    status: 'preparing',
    total: 45000,
    createdAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Grilled Chicken', quantity: 1, price: 25000 },
      { id: '2', name: 'Caesar Salad', quantity: 1, price: 20000 }
    ]
  }
];

const mockReservations: Reservation[] = [
  {
    id: '1',
    customerName: 'Jane Smith',
    partySize: 4,
    time: new Date(Date.now() + 3600000).toISOString(),
    tableNumber: '3',
    status: 'confirmed',
    specialRequests: 'Birthday celebration'
  }
];

const mockMetrics: ServerMetrics = {
  tablesServed: 12,
  ordersToday: 18,
  totalSales: 850000,
  avgOrderValue: 47222,
  customerSatisfaction: 4.8
};

const getTableStatusColor = (status: string) => {
  switch (status) {
    case 'available': return '#10b981';
    case 'occupied': return '#ef4444';
    case 'reserved': return '#f59e0b';
    case 'cleaning': return '#6b7280';
    default: return '#6b7280';
  }
};

const getTableStatusIcon = (status: string) => {
  switch (status) {
    case 'available': return <FiCheckCircle className="text-green-500" />;
    case 'occupied': return <FiUsers className="text-red-500" />;
    case 'reserved': return <FiCalendar className="text-yellow-500" />;
    case 'cleaning': return <FiClock className="text-gray-500" />;
    default: return <FiAlertCircle className="text-gray-500" />;
  }
};

export default ServerDashboard;
