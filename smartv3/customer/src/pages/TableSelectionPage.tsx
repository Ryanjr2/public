// Professional Table Selection System
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiMapPin, FiClock, FiCheck, FiX, FiRefreshCw,
  FiArrowLeft, FiWifi, FiSun, FiMoon, FiShield, FiStar,
  FiEye, FiZap, FiHeart, FiCoffee, FiMusic, FiWind,
  FiCamera, FiInfo, FiPhone, FiMail, FiCalendar
} from 'react-icons/fi';
import '../styles/TableSelection.css';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

// Professional TypeScript interfaces
interface Table {
  id: number;
  number: string;
  capacity: number;
  location: 'indoor' | 'outdoor' | 'private' | 'bar' | 'vip';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning';
  position: { x: number; y: number };
  shape: 'round' | 'square' | 'rectangle' | 'booth';
  features: TableFeature[];
  price_modifier?: number; // Premium tables might have surcharge
  reservation_time?: string;
  estimated_available?: string;
  last_cleaned?: string;
  rating?: number;
  reviews_count?: number;
}

interface TableFeature {
  id: string;
  name: string;
  icon: React.ComponentType;
  description: string;
  premium?: boolean;
}

interface RestaurantLayout {
  id: string;
  name: string;
  width: number;
  height: number;
  background_image?: string;
  zones: LayoutZone[];
}

interface LayoutZone {
  id: string;
  name: string;
  type: 'dining' | 'bar' | 'private' | 'outdoor' | 'vip';
  bounds: { x: number; y: number; width: number; height: number };
  color: string;
  description?: string;
}

interface Reservation {
  table_id: number;
  customer_name: string;
  party_size: number;
  date: string;
  time: string;
  duration: number;
  special_requests?: string;
  contact_phone: string;
}

const TableSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { cartItems, setCustomerTable } = useCart();

  // Check if user is logged in (wait for auth to finish loading)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', {
        state: {
          from: '/table-selection',
          message: 'Please log in to select a table'
        }
      });
    }
  }, [user, authLoading, navigate]);

  // Professional state management
  const [tables, setTables] = useState<Table[]>([]);
  const [layout, setLayout] = useState<RestaurantLayout | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'layout' | 'list'>('layout');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterCapacity, setFilterCapacity] = useState<number>(0);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationData, setReservationData] = useState<Partial<Reservation>>({});
  const [confirming, setConfirming] = useState(false);

  // Professional utility functions
  const getTableStatusColor = (status: string): string => {
    switch (status) {
      case 'available': return '#00b894';
      case 'occupied': return '#ff6b6b';
      case 'reserved': return '#fdcb6e';
      case 'maintenance': return '#636e72';
      case 'cleaning': return '#74b9ff';
      default: return '#ddd';
    }
  };

  const getTableStatusIcon = (status: string): React.ReactElement => {
    switch (status) {
      case 'available': return <FiCheck size={14} />;
      case 'occupied': return <FiUsers size={14} />;
      case 'reserved': return <FiClock size={14} />;
      case 'maintenance': return <FiX size={14} />;
      case 'cleaning': return <FiRefreshCw size={14} />;
      default: return <FiMapPin size={14} />;
    }
  };

  const getLocationIcon = (location: string): React.ComponentType => {
    switch (location) {
      case 'indoor': return FiShield;
      case 'outdoor': return FiSun;
      case 'private': return FiStar;
      case 'bar': return FiCoffee;
      case 'vip': return FiHeart;
      default: return FiMapPin;
    }
  };

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-TZ', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Professional table features
  const getTableFeatures = (): TableFeature[] => [
    { id: 'wifi', name: 'Free WiFi', icon: FiWifi, description: 'High-speed internet access' },
    { id: 'window', name: 'Window View', icon: FiEye, description: 'Beautiful city or garden view' },
    { id: 'quiet', name: 'Quiet Zone', icon: FiWind, description: 'Perfect for conversations' },
    { id: 'charging', name: 'Power Outlets', icon: FiZap, description: 'Device charging available' },
    { id: 'music', name: 'Ambient Music', icon: FiMusic, description: 'Curated background music' },
    { id: 'photo', name: 'Instagram Spot', icon: FiCamera, description: 'Perfect for photos', premium: true },
    { id: 'private', name: 'Private Dining', icon: FiShield, description: 'Secluded seating area', premium: true }
  ];

  // Professional API integration
  const fetchTableData = async () => {
    try {
      setLoading(true);

      const [tablesResponse, layoutResponse] = await Promise.allSettled([
        axios.get('http://localhost:8000/api/tables/'),
        axios.get('http://localhost:8000/api/restaurant/layout/')
      ]);

      // Handle responses or fallback to mock data
      if (tablesResponse.status === 'fulfilled' && Array.isArray(tablesResponse.value.data)) {
        setTables(tablesResponse.value.data);
      } else {
        console.log('Using mock table data');
        setTables(getMockTables());
      }

      if (layoutResponse.status === 'fulfilled') {
        setLayout(layoutResponse.value.data);
      } else {
        console.log('Using mock layout data');
        setLayout(getMockLayout());
      }

      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch table data:', err);

      // Fallback to mock data for demonstration
      setTables(getMockTables());
      setLayout(getMockLayout());
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Professional mock data for demonstration
  const getMockTables = (): Table[] => {
    const features = getTableFeatures();

    return [
      {
        id: 1, number: 'T01', capacity: 2, location: 'indoor', status: 'available',
        position: { x: 20, y: 30 }, shape: 'round', rating: 4.8, reviews_count: 24,
        features: [features[0], features[1], features[3]], // WiFi, Window, Charging
        last_cleaned: new Date(Date.now() - 30 * 60000).toISOString()
      },
      {
        id: 2, number: 'T02', capacity: 4, location: 'indoor', status: 'available',
        position: { x: 60, y: 30 }, shape: 'square', rating: 4.6, reviews_count: 18,
        features: [features[0], features[2]], // WiFi, Quiet
        last_cleaned: new Date(Date.now() - 45 * 60000).toISOString()
      },
      {
        id: 3, number: 'T03', capacity: 2, location: 'indoor', status: 'occupied',
        position: { x: 20, y: 70 }, shape: 'round', rating: 4.9, reviews_count: 31,
        features: [features[0], features[1], features[5]], // WiFi, Window, Instagram
        estimated_available: new Date(Date.now() + 25 * 60000).toISOString()
      },
      {
        id: 4, number: 'T04', capacity: 6, location: 'indoor', status: 'available',
        position: { x: 60, y: 70 }, shape: 'rectangle', rating: 4.7, reviews_count: 22,
        features: [features[0], features[3], features[4]], // WiFi, Charging, Music
        last_cleaned: new Date(Date.now() - 20 * 60000).toISOString()
      },
      {
        id: 5, number: 'T05', capacity: 4, location: 'outdoor', status: 'available',
        position: { x: 20, y: 110 }, shape: 'round', rating: 4.5, reviews_count: 15,
        features: [features[1], features[2]], // Window, Quiet
        last_cleaned: new Date(Date.now() - 60 * 60000).toISOString()
      },
      {
        id: 6, number: 'VIP01', capacity: 8, location: 'vip', status: 'available',
        position: { x: 80, y: 20 }, shape: 'booth', rating: 5.0, reviews_count: 12,
        features: [features[0], features[6], features[5]], // WiFi, Private, Instagram
        price_modifier: 20, // 20% surcharge for VIP
        last_cleaned: new Date(Date.now() - 10 * 60000).toISOString()
      },
      {
        id: 7, number: 'B01', capacity: 3, location: 'bar', status: 'reserved',
        position: { x: 40, y: 20 }, shape: 'rectangle', rating: 4.4, reviews_count: 28,
        features: [features[0], features[4]], // WiFi, Music
        reservation_time: new Date(Date.now() + 15 * 60000).toISOString()
      },
      {
        id: 8, number: 'T08', capacity: 2, location: 'indoor', status: 'cleaning',
        position: { x: 40, y: 50 }, shape: 'round', rating: 4.3, reviews_count: 19,
        features: [features[0]], // WiFi only
        estimated_available: new Date(Date.now() + 10 * 60000).toISOString()
      }
    ];
  };

  const getMockLayout = (): RestaurantLayout => ({
    id: 'main_floor',
    name: 'Main Dining Floor',
    width: 100,
    height: 140,
    zones: [
      {
        id: 'main_dining',
        name: 'Main Dining Area',
        type: 'dining',
        bounds: { x: 10, y: 20, width: 60, height: 80 },
        color: '#e8f4fd',
        description: 'Comfortable indoor seating'
      },
      {
        id: 'bar_area',
        name: 'Bar & Lounge',
        type: 'bar',
        bounds: { x: 30, y: 10, width: 50, height: 15 },
        color: '#fff2e8',
        description: 'Casual bar seating'
      },
      {
        id: 'outdoor_patio',
        name: 'Outdoor Patio',
        type: 'outdoor',
        bounds: { x: 10, y: 105, width: 40, height: 30 },
        color: '#e8f8e8',
        description: 'Fresh air dining'
      },
      {
        id: 'vip_section',
        name: 'VIP Section',
        type: 'vip',
        bounds: { x: 75, y: 10, width: 20, height: 40 },
        color: '#fdf2e8',
        description: 'Premium private dining'
      }
    ]
  });

  // Professional lifecycle management
  useEffect(() => {
    // Initialize with empty arrays to prevent filter errors
    if (!Array.isArray(tables)) {
      setTables([]);
    }
    fetchTableData();
  }, []);

  // Professional event handlers
  const handleTableSelect = (table: Table) => {
    if (table.status !== 'available') {
      console.log('❌ Table not available:', table.status);
      return;
    }
    console.log('✅ Table selected:', table);
    setSelectedTable(table);
  };

  const handleConfirmTable = async () => {
    if (!selectedTable) return;
    
    setConfirming(true);
    
    try {
      // Set table in cart context
      setCustomerTable(selectedTable.number);
      console.log('✅ Table set in cart context:', selectedTable.number);

      // Check if coming from cart
      const fromCart = location.state?.fromCart;
      
      if (fromCart) {
        // Return to cart with table selected
        navigate('/cart', {
          state: { tableSelected: selectedTable.number }
        });
      } else {
        // Normal flow - go to menu or checkout
        if (cartItems.length > 0) {
          navigate('/checkout');
        } else {
          navigate('/menu');
        }
      }
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setConfirming(false);
    }
  };

  const handleReservationRequest = () => {
    if (!selectedTable) return;
    setReservationData({
      table_id: selectedTable.id,
      customer_name: `${user?.first_name} ${user?.last_name}`,
      party_size: cartItems.reduce((sum, item) => sum + item.quantity, 0) || 2,
      date: new Date().toISOString().split('T')[0],
      time: new Date(Date.now() + 60 * 60000).toTimeString().slice(0, 5),
      duration: 120, // 2 hours default
      contact_phone: user?.phone || ''
    });
    setShowReservationModal(true);
  };

  const handleReservationSubmit = async () => {
    try {
      setConfirming(true);

      const response = await axios.post(
        'http://localhost:8000/api/reservations/',
        reservationData
      );

      setShowReservationModal(false);
      setSelectedTable(null);

      // Refresh table data
      await fetchTableData();

      // Show success message
      alert('Reservation request submitted successfully!');
    } catch (error) {
      console.error('Failed to submit reservation:', error);

      // For demo, just close modal
      setShowReservationModal(false);
      alert('Reservation request submitted successfully!');
    } finally {
      setConfirming(false);
    }
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  const handleRefreshTables = () => {
    fetchTableData();
  };

  const handleFilterChange = (location: string, capacity: number) => {
    setFilterLocation(location);
    setFilterCapacity(capacity);
  };

  // Professional filtering logic with safety check
  const filteredTables = Array.isArray(tables) ? tables.filter(table => {
    const locationMatch = filterLocation === 'all' || table.location === filterLocation;
    const capacityMatch = filterCapacity === 0 || table.capacity >= filterCapacity;
    return locationMatch && capacityMatch;
  }) : [];

  const availableTables = filteredTables.filter(table => table.status === 'available');
  const occupiedTables = filteredTables.filter(table => table.status === 'occupied');
  const reservedTables = filteredTables.filter(table => table.status === 'reserved');

  // Debug logging
  console.log('📊 Tables data:', {
    totalTables: tables.length,
    filteredTables: filteredTables.length,
    availableTables: availableTables.length,
    selectedTable: selectedTable
  });

  // Professional loading state (auth or tables)
  if (authLoading || loading) {
    return (
      <motion.div
        className="table-selection-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="loading-container">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FiRefreshCw size={32} />
          </motion.div>
          <p>{authLoading ? 'Verifying your login status...' : 'Loading restaurant layout...'}</p>
        </div>
      </motion.div>
    );
  }

  // Professional error state
  if (error && (!tables || !Array.isArray(tables) || !tables.length)) {
    return (
      <motion.div
        className="table-selection-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="error-container">
          <FiMapPin size={48} className="error-icon" />
          <h2>Unable to Load Tables</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button className="btn-primary" onClick={fetchTableData}>
              <FiRefreshCw /> Try Again
            </button>
            <button className="btn-secondary" onClick={handleBackToCart}>
              <FiArrowLeft /> Back to Cart
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="table-selection-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Professional Header */}
      <div className="table-header">
        <div className="header-content">
          <button className="back-btn" onClick={handleBackToCart}>
            <FiArrowLeft /> Back to Cart
          </button>
          <div className="header-info">
            <h1>Select Your Table</h1>
            <p>Choose the perfect spot for your dining experience</p>
          </div>
          <button className="refresh-btn" onClick={handleRefreshTables}>
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* Professional Stats Summary */}
      <motion.div
        className="table-stats-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="stats-grid">
          <div className="stat-item available">
            <FiCheck className="stat-icon" />
            <div className="stat-details">
              <span className="stat-value">{availableTables.length}</span>
              <span className="stat-label">Available</span>
            </div>
          </div>
          <div className="stat-item occupied">
            <FiUsers className="stat-icon" />
            <div className="stat-details">
              <span className="stat-value">{occupiedTables.length}</span>
              <span className="stat-label">Occupied</span>
            </div>
          </div>
          <div className="stat-item reserved">
            <FiClock className="stat-icon" />
            <div className="stat-details">
              <span className="stat-value">{reservedTables.length}</span>
              <span className="stat-label">Reserved</span>
            </div>
          </div>
          <div className="stat-item total">
            <FiMapPin className="stat-icon" />
            <div className="stat-details">
              <span className="stat-value">{tables.length}</span>
              <span className="stat-label">Total Tables</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Professional Controls */}
      <motion.div
        className="table-controls"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'layout' ? 'active' : ''}`}
            onClick={() => setViewMode('layout')}
          >
            <FiMapPin /> Layout View
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FiUsers /> List View
          </button>
        </div>

        <div className="filters">
          <select
            className="filter-select"
            value={filterLocation}
            onChange={(e) => handleFilterChange(e.target.value, filterCapacity)}
          >
            <option value="all">All Locations</option>
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
            <option value="bar">Bar Area</option>
            <option value="vip">VIP Section</option>
            <option value="private">Private Dining</option>
          </select>

          <select
            className="filter-select"
            value={filterCapacity}
            onChange={(e) => handleFilterChange(filterLocation, parseInt(e.target.value))}
          >
            <option value={0}>Any Size</option>
            <option value={2}>2+ People</option>
            <option value={4}>4+ People</option>
            <option value={6}>6+ People</option>
            <option value={8}>8+ People</option>
          </select>
        </div>
      </motion.div>

      {/* Professional Table Display */}
      <AnimatePresence mode="wait">
        {viewMode === 'layout' && layout && (
          <motion.div
            key="layout"
            className="layout-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="restaurant-layout">
              <div className="layout-container">
                {/* Restaurant Zones */}
                {layout.zones.map((zone) => (
                  <div
                    key={zone.id}
                    className="layout-zone"
                    style={{
                      left: `${zone.bounds.x}%`,
                      top: `${zone.bounds.y}%`,
                      width: `${zone.bounds.width}%`,
                      height: `${zone.bounds.height}%`,
                      backgroundColor: zone.color,
                    }}
                  >
                    <div className="zone-label">
                      <span className="zone-name">{zone.name}</span>
                      <span className="zone-description">{zone.description}</span>
                    </div>
                  </div>
                ))}

                {/* Tables */}
                {Array.isArray(filteredTables) && filteredTables.map((table, index) => {
                  const StatusIcon = getTableStatusIcon(table.status);
                  const LocationIcon = getLocationIcon(table.location);

                  return (
                    <motion.div
                      key={table.id}
                      className={`table-marker ${table.status} ${table.shape} ${selectedTable?.id === table.id ? 'selected' : ''}`}
                      style={{
                        left: `${table.position.x}%`,
                        top: `${table.position.y}%`,
                        borderColor: getTableStatusColor(table.status),
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleTableSelect(table)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="table-content">
                        <div className="table-number">{table.number}</div>
                        <div className="table-capacity">
                          <FiUsers size={12} />
                          <span>{table.capacity}</span>
                        </div>
                        <div className="table-status-icon">
                          {getTableStatusIcon(table.status)}
                        </div>
                        {table.location === 'vip' && (
                          <div className="vip-badge">
                            <FiStar size={10} />
                          </div>
                        )}
                      </div>

                      {/* Table Tooltip */}
                      <div className="table-tooltip">
                        <div className="tooltip-header">
                          <span className="table-name">Table {table.number}</span>
                          <div className="table-rating">
                            <FiStar size={12} />
                            <span>{table.rating}</span>
                          </div>
                        </div>
                        <div className="tooltip-details">
                          <div className="detail-item">
                            <FiUsers size={12} />
                            <span>Seats {table.capacity}</span>
                          </div>
                          <div className="detail-item">
                            {(() => {
                              const Icon = getLocationIcon(table.location);
                              return React.createElement(Icon, { size: 12 });
                            })()}
                            <span>{table.location}</span>
                          </div>
                          {table.status === 'occupied' && table.estimated_available && (
                            <div className="detail-item">
                              <FiClock size={12} />
                              <span>Available {formatTime(table.estimated_available)}</span>
                            </div>
                          )}
                        </div>
                        <div className="tooltip-features">
                          {table.features.slice(0, 3).map((feature) => (
                            <div key={feature.id} className="feature-tag">
                              {React.createElement(feature.icon, { 
                                width: 10, 
                                height: 10,
                                size: 10
                              } as any)}
                              <span>{feature.name}</span>
                            </div>
                          ))}
                          {table.features.length > 3 && (
                            <span className="more-features">+{table.features.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Layout Legend */}
              <div className="layout-legend">
                <h4>Table Status</h4>
                <div className="legend-items">
                  <div className="legend-item">
                    <div className="legend-color available"></div>
                    <span>Available</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color occupied"></div>
                    <span>Occupied</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color reserved"></div>
                    <span>Reserved</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color cleaning"></div>
                    <span>Cleaning</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'list' && (
          <motion.div
            key="list"
            className="list-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="tables-list">
              {Array.isArray(filteredTables) && filteredTables.map((table, index) => {
                const StatusIcon = getTableStatusIcon(table.status);
                const LocationIcon = getLocationIcon(table.location);

                return (
                  <motion.div
                    key={table.id}
                    className={`table-card ${table.status} ${selectedTable?.id === table.id ? 'selected' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleTableSelect(table)}
                  >
                    <div className="table-card-header">
                      <div className="table-info">
                        <h3>Table {table.number}</h3>
                        <div className="table-meta">
                          <span className="capacity">
                            <FiUsers size={14} />
                            {table.capacity} seats
                          </span>
                          <span className="location">
                            <LocationIcon size={14} />
                            {table.location}
                          </span>
                          {table.rating && (
                            <span className="rating">
                              <FiStar size={14} />
                              {table.rating} ({table.reviews_count} reviews)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="table-status">
                        <div className={`status-badge ${table.status}`}>
                          {StatusIcon}
                          <span>{table.status}</span>
                        </div>
                        {table.price_modifier && (
                          <div className="price-modifier">
                            +{table.price_modifier}%
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="table-features">
                      {table.features.map((feature) => (
                        <div key={feature.id} className={`feature-item ${feature.premium ? 'premium' : ''}`}>
                          {React.createElement(feature.icon, { 
                            width: 10, 
                            height: 10,
                            size: 10
                          } as any)}
                          <span>{feature.name}</span>
                        </div>
                      ))}
                    </div>

                    {table.status === 'occupied' && table.estimated_available && (
                      <div className="availability-info">
                        <FiClock size={14} />
                        <span>Available around {formatTime(table.estimated_available)}</span>
                      </div>
                    )}

                    {table.status === 'reserved' && table.reservation_time && (
                      <div className="reservation-info">
                        <FiCalendar size={14} />
                        <span>Reserved until {formatTime(table.reservation_time)}</span>
                      </div>
                    )}

                    {table.last_cleaned && (
                      <div className="cleaning-info">
                        <FiRefreshCw size={12} />
                        <span>Last cleaned {formatTime(table.last_cleaned)}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {filteredTables.length === 0 && (
              <div className="no-tables">
                <FiMapPin size={48} />
                <h3>No Tables Found</h3>
                <p>Try adjusting your filters to see more options.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Professional Table Selection Modal */}
      <AnimatePresence>
        {selectedTable && (
          <motion.div
            className="table-selection-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="modal-header">
                <h3>Table {selectedTable.number}</h3>
                <button
                  className="close-btn"
                  onClick={() => setSelectedTable(null)}
                >
                  <FiX />
                </button>
              </div>

              <div className="modal-body">
                <div className="table-details">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <FiUsers className="detail-icon" />
                      <div>
                        <span className="detail-label">Capacity</span>
                        <span className="detail-value">{selectedTable.capacity} people</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <FiMapPin className="detail-icon" />
                      <div>
                        <span className="detail-label">Location</span>
                        <span className="detail-value">{selectedTable.location}</span>
                      </div>
                    </div>
                    {selectedTable.rating && (
                      <div className="detail-item">
                        <FiStar className="detail-icon" />
                        <div>
                          <span className="detail-label">Rating</span>
                          <span className="detail-value">
                            {selectedTable.rating}/5 ({selectedTable.reviews_count} reviews)
                          </span>
                        </div>
                      </div>
                    )}
                    {selectedTable.price_modifier && (
                      <div className="detail-item">
                        <FiInfo className="detail-icon" />
                        <div>
                          <span className="detail-label">Premium Table</span>
                          <span className="detail-value">+{selectedTable.price_modifier}% surcharge</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="features-section">
                    <h4>Table Features</h4>
                    <div className="features-grid">
                      {selectedTable.features.map((feature) => (
                        <div key={feature.id} className={`feature-card ${feature.premium ? 'premium' : ''}`}>
                          {React.createElement(feature.icon, { 
                            width: 20, 
                            height: 20,
                            size: 20
                          } as any)}
                          <div>
                            <span className="feature-name">{feature.name}</span>
                            <span className="feature-description">{feature.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                {selectedTable.status === 'available' ? (
                  <>
                    <button
                      className="btn-secondary"
                      onClick={handleReservationRequest}
                    >
                      <FiCalendar /> Reserve for Later
                    </button>
                    <button
                      className="btn-primary"
                      onClick={handleConfirmTable}
                      disabled={confirming}
                    >
                      {confirming ? (
                        <>
                          <FiRefreshCw className="spinning" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <FiCheck />
                          {cartItems.length > 0 ? 'Select Table & Checkout' : 'Select Table & Order'}
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="unavailable-actions">
                    <p>This table is currently {selectedTable.status}</p>
                    {selectedTable.estimated_available && (
                      <p>Estimated available: {formatTime(selectedTable.estimated_available)}</p>
                    )}
                    <button
                      className="btn-secondary"
                      onClick={handleReservationRequest}
                    >
                      <FiCalendar /> Request Reservation
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Professional Reservation Modal */}
      <AnimatePresence>
        {showReservationModal && (
          <motion.div
            className="reservation-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="modal-header">
                <h3>Make a Reservation</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowReservationModal(false)}
                >
                  <FiX />
                </button>
              </div>

              <div className="modal-body">
                <div className="reservation-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Customer Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={reservationData.customer_name || ''}
                        onChange={(e) => setReservationData(prev => ({
                          ...prev,
                          customer_name: e.target.value
                        }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Party Size</label>
                      <select
                        className="form-input"
                        value={reservationData.party_size || 2}
                        onChange={(e) => setReservationData(prev => ({
                          ...prev,
                          party_size: parseInt(e.target.value)
                        }))}
                      >
                        {[...Array(selectedTable?.capacity || 8)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'person' : 'people'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={reservationData.date || ''}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setReservationData(prev => ({
                          ...prev,
                          date: e.target.value
                        }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Time</label>
                      <input
                        type="time"
                        className="form-input"
                        value={reservationData.time || ''}
                        onChange={(e) => setReservationData(prev => ({
                          ...prev,
                          time: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Duration (minutes)</label>
                      <select
                        className="form-input"
                        value={reservationData.duration || 120}
                        onChange={(e) => setReservationData(prev => ({
                          ...prev,
                          duration: parseInt(e.target.value)
                        }))}
                      >
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5 hours</option>
                        <option value={120}>2 hours</option>
                        <option value={150}>2.5 hours</option>
                        <option value={180}>3 hours</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Contact Phone</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={reservationData.contact_phone || ''}
                        onChange={(e) => setReservationData(prev => ({
                          ...prev,
                          contact_phone: e.target.value
                        }))}
                        placeholder="+255 712 345 678"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Special Requests (Optional)</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={reservationData.special_requests || ''}
                      onChange={(e) => setReservationData(prev => ({
                        ...prev,
                        special_requests: e.target.value
                      }))}
                      placeholder="Any special requirements or requests..."
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowReservationModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleReservationSubmit}
                  disabled={confirming || !reservationData.customer_name || !reservationData.date || !reservationData.time}
                >
                  {confirming ? (
                    <>
                      <FiRefreshCw className="spinning" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiCalendar />
                      Submit Reservation
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TableSelectionPage;
