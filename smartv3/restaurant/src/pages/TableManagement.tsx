// src/pages/TableManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
  FiGrid, FiPlus, FiEdit, FiTrash2, FiUsers, FiClock, 
  FiCheckCircle, FiAlertCircle, FiRefreshCw, FiEye,
  FiMapPin, FiSettings
} from 'react-icons/fi';
import { usePermissions } from '../hooks/usePermissions';
import api from '../services/api';
import { TableLoader } from '../components/LoadingSpinner';
import styles from './Dashboard.module.css';

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance';
  location: string;
  currentOrder?: {
    id: string;
    orderNumber: string;
    customerName?: string;
    startTime: string;
    estimatedEndTime?: string;
    total: number;
  };
  reservation?: {
    id: string;
    customerName: string;
    partySize: number;
    time: string;
    contactNumber?: string;
  };
  serverAssigned?: {
    id: string;
    name: string;
  };
  lastCleaned?: string;
  notes?: string;
}

interface TableStats {
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  reservedTables: number;
  occupancyRate: number;
  avgTurnoverTime: number;
}

const TableManagement: React.FC = () => {
  const { canManageTables, canAssignTables, isServer } = usePermissions();
  const [tables, setTables] = useState<Table[]>([]);
  const [stats, setStats] = useState<TableStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchTables();
    // Set up real-time updates
    const interval = setInterval(fetchTables, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const [tablesResponse, statsResponse] = await Promise.all([
        api.get('/tables/'),
        api.get('/tables/stats/')
      ]);
      
      setTables(tablesResponse.data || mockTables);
      setStats(statsResponse.data || mockStats);
    } catch (error) {
      console.error('Error fetching tables:', error);
      // Use mock data for development
      setTables(mockTables);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const updateTableStatus = async (tableId: string, newStatus: string) => {
    try {
      await api.patch(`/tables/${tableId}/`, { status: newStatus });
      await fetchTables();
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  };

  const assignServer = async (tableId: string, serverId: string) => {
    try {
      await api.patch(`/tables/${tableId}/assign-server/`, { serverId });
      await fetchTables();
    } catch (error) {
      console.error('Error assigning server:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'occupied': return '#ef4444';
      case 'reserved': return '#f59e0b';
      case 'cleaning': return '#6b7280';
      case 'maintenance': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <FiCheckCircle className="text-green-500" />;
      case 'occupied': return <FiUsers className="text-red-500" />;
      case 'reserved': return <FiClock className="text-yellow-500" />;
      case 'cleaning': return <FiRefreshCw className="text-gray-500" />;
      case 'maintenance': return <FiSettings className="text-purple-500" />;
      default: return <FiAlertCircle className="text-gray-500" />;
    }
  };

  const filteredTables = tables.filter(table => 
    filterStatus === 'all' || table.status === filterStatus
  );

  if (loading) {
    return <TableLoader />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <FiGrid className={styles.titleIcon} />
              Table Management
            </h1>
            <p className={styles.subtitle}>
              Manage restaurant seating and table assignments
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-md text-sm ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                <FiGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-sm ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                <FiEye className="h-4 w-4" />
              </button>
            </div>

            {canManageTables() && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <FiPlus className="h-4 w-4" />
                <span>Add Table</span>
              </button>
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
                <FiGrid />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Total Tables</h3>
              <p className={styles.metricValue}>{stats.totalTables}</p>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#10b981' }}>
                <FiCheckCircle />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Available</h3>
              <p className={styles.metricValue}>{stats.availableTables}</p>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#ef4444' }}>
                <FiUsers />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Occupied</h3>
              <p className={styles.metricValue}>{stats.occupiedTables}</p>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#f59e0b' }}>
                <FiClock />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Occupancy Rate</h3>
              <p className={styles.metricValue}>{stats.occupancyRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tables</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 text-sm">
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
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-500 rounded-full mr-1"></div>
              Cleaning
            </div>
          </div>
        </div>
      </div>

      {/* Tables Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredTables.map(table => (
            <TableCard 
              key={table.id} 
              table={table} 
              onSelect={() => setSelectedTable(table)}
              onStatusChange={(status) => updateTableStatus(table.id, status)}
              canManage={canManageTables()}
              canAssign={canAssignTables()}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Server
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTables.map(table => (
                <TableRow 
                  key={table.id} 
                  table={table}
                  onSelect={() => setSelectedTable(table)}
                  onStatusChange={(status) => updateTableStatus(table.id, status)}
                  canManage={canManageTables()}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Table Card Component for Grid View
const TableCard: React.FC<{
  table: Table;
  onSelect: () => void;
  onStatusChange: (status: string) => void;
  canManage: boolean;
  canAssign: boolean;
}> = ({ table, onSelect, onStatusChange, canManage, canAssign }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow border-l-4"
      style={{ borderLeftColor: getStatusColor(table.status) }}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">Table {table.number}</h3>
        {getStatusIcon(table.status)}
      </div>
      
      <div className="space-y-1 text-sm text-gray-600">
        <p className="flex items-center">
          <FiUsers className="h-4 w-4 mr-1" />
          {table.capacity} seats
        </p>
        <p className="flex items-center">
          <FiMapPin className="h-4 w-4 mr-1" />
          {table.location}
        </p>
        <p className="capitalize font-medium" style={{ color: getStatusColor(table.status) }}>
          {table.status}
        </p>
      </div>

      {table.currentOrder && (
        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
          <p className="font-medium">Order #{table.currentOrder.orderNumber}</p>
          <p className="text-gray-600">{table.currentOrder.customerName}</p>
        </div>
      )}

      {table.reservation && (
        <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
          <p className="font-medium">Reserved: {table.reservation.customerName}</p>
          <p className="text-gray-600">{new Date(table.reservation.time).toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
};

// Table Row Component for List View
const TableRow: React.FC<{
  table: Table;
  onSelect: () => void;
  onStatusChange: (status: string) => void;
  canManage: boolean;
}> = ({ table, onSelect, onStatusChange, canManage }) => {
  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={onSelect}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">Table {table.number}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getStatusIcon(table.status)}
          <span className="ml-2 capitalize" style={{ color: getStatusColor(table.status) }}>
            {table.status}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {table.capacity} seats
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {table.location}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {table.serverAssigned?.name || 'Unassigned'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="text-blue-600 hover:text-blue-900"
          >
            <FiEye className="h-4 w-4" />
          </button>
          {canManage && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); /* Edit logic */ }}
                className="text-green-600 hover:text-green-900"
              >
                <FiEdit className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); /* Delete logic */ }}
                className="text-red-600 hover:text-red-900"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

// Mock data for development
const mockTables: Table[] = [
  {
    id: '1',
    number: '1',
    capacity: 2,
    status: 'available',
    location: 'Main Dining'
  },
  {
    id: '2',
    number: '2',
    capacity: 4,
    status: 'occupied',
    location: 'Main Dining',
    currentOrder: {
      id: '1',
      orderNumber: 'ORD-001',
      customerName: 'John Doe',
      startTime: new Date().toISOString(),
      total: 45000
    },
    serverAssigned: {
      id: '1',
      name: 'Alice Johnson'
    }
  },
  {
    id: '3',
    number: '3',
    capacity: 6,
    status: 'reserved',
    location: 'Private Room',
    reservation: {
      id: '1',
      customerName: 'Jane Smith',
      partySize: 4,
      time: new Date(Date.now() + 3600000).toISOString(),
      contactNumber: '+255 123 456 789'
    }
  },
  {
    id: '4',
    number: '4',
    capacity: 2,
    status: 'cleaning',
    location: 'Terrace'
  }
];

const mockStats: TableStats = {
  totalTables: 20,
  availableTables: 12,
  occupiedTables: 6,
  reservedTables: 2,
  occupancyRate: 40,
  avgTurnoverTime: 75
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return '#10b981';
    case 'occupied': return '#ef4444';
    case 'reserved': return '#f59e0b';
    case 'cleaning': return '#6b7280';
    case 'maintenance': return '#8b5cf6';
    default: return '#6b7280';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'available': return <FiCheckCircle className="text-green-500" />;
    case 'occupied': return <FiUsers className="text-red-500" />;
    case 'reserved': return <FiClock className="text-yellow-500" />;
    case 'cleaning': return <FiRefreshCw className="text-gray-500" />;
    case 'maintenance': return <FiSettings className="text-purple-500" />;
    default: return <FiAlertCircle className="text-gray-500" />;
  }
};

export default TableManagement;
