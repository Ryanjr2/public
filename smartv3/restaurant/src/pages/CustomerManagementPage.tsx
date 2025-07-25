// src/pages/CustomerManagementPage.tsx
import React, { useState, useEffect } from 'react';
import {
  FiPlus, FiSearch, FiFilter, FiEdit, FiEye, FiUsers, FiMail,
  FiPhone, FiMapPin, FiCalendar, FiShoppingCart, FiTrendingUp,
  FiTrendingUp as FiRevenue, FiRefreshCw, FiDownload, FiStar, FiClock,
  FiHeart, FiGift, FiTag, FiBarChart2
} from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import CustomerModal from '../components/CustomerModal';
import CustomerDetailsModal from '../components/CustomerDetailsModal';
import CustomerAnalyticsModal from '../components/CustomerAnalyticsModal';
import CustomerOrdersModal from '../components/CustomerOrdersModal';
import styles from './CustomerManagement.module.css';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  date_joined: string;
  last_visit: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  favorite_items: string[];
  loyalty_points: number;
  status: 'active' | 'inactive' | 'vip';
  preferences: {
    dietary_restrictions: string[];
    preferred_table: string;
    special_occasions: string[];
  };
  visit_frequency: 'regular' | 'occasional' | 'rare';
  customer_segment: 'new' | 'returning' | 'loyal' | 'vip';
}

const CustomerManagementPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'total_spent' | 'last_visit' | 'total_orders'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Mock data for demonstration
  const mockCustomers: Customer[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+255123456789',
      address: '123 Main St, Dar es Salaam',
      date_joined: '2024-01-15',
      last_visit: '2024-06-28',
      total_orders: 45,
      total_spent: 2850000, // TZS
      average_order_value: 63333,
      favorite_items: ['Nyama Choma', 'Ugali', 'Pilau'],
      loyalty_points: 285,
      status: 'vip',
      preferences: {
        dietary_restrictions: [],
        preferred_table: 'Window seat',
        special_occasions: ['Birthday: March 15']
      },
      visit_frequency: 'regular',
      customer_segment: 'vip'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+255987654321',
      address: '456 Oak Ave, Arusha',
      date_joined: '2024-03-20',
      last_visit: '2024-06-25',
      total_orders: 12,
      total_spent: 780000,
      average_order_value: 65000,
      favorite_items: ['Fish Curry', 'Rice'],
      loyalty_points: 78,
      status: 'active',
      preferences: {
        dietary_restrictions: ['Vegetarian'],
        preferred_table: 'Quiet corner',
        special_occasions: []
      },
      visit_frequency: 'occasional',
      customer_segment: 'returning'
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'mike.brown@email.com',
      phone: '+255456789123',
      address: '789 Pine St, Mwanza',
      date_joined: '2024-06-01',
      last_visit: '2024-06-30',
      total_orders: 3,
      total_spent: 195000,
      average_order_value: 65000,
      favorite_items: ['Chicken Tikka'],
      loyalty_points: 19,
      status: 'active',
      preferences: {
        dietary_restrictions: [],
        preferred_table: '',
        special_occasions: []
      },
      visit_frequency: 'rare',
      customer_segment: 'new'
    }
  ];

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCustomers(mockCustomers);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsEditing(false);
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditing(true);
    setShowCustomerModal(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const handleViewAnalytics = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowAnalyticsModal(true);
  };

  const handleViewOrders = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowOrdersModal(true);
  };

  const handleCustomerSaved = (customer: Customer) => {
    if (isEditing) {
      setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
    } else {
      setCustomers(prev => [...prev, { ...customer, id: Date.now() }]);
    }
    setShowCustomerModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip': return '#f59e0b';
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'vip': return '#8b5cf6';
      case 'loyal': return '#3b82f6';
      case 'returning': return '#10b981';
      case 'new': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.includes(searchTerm);
      const matchesSegment = selectedSegment === 'all' || customer.customer_segment === selectedSegment;
      const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
      return matchesSearch && matchesSegment && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const modifier = sortOrder === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * modifier;
      }
      return (aValue > bValue ? 1 : -1) * modifier;
    });

  const customerStats = {
    total: customers.length,
    new: customers.filter(c => c.customer_segment === 'new').length,
    returning: customers.filter(c => c.customer_segment === 'returning').length,
    loyal: customers.filter(c => c.customer_segment === 'loyal').length,
    vip: customers.filter(c => c.customer_segment === 'vip').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.total_spent, 0),
    averageOrderValue: customers.reduce((sum, c) => sum + c.average_order_value, 0) / customers.length || 0
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading customers...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Customer Management</h1>
          <p className={styles.subtitle}>
            Manage customer relationships and analyze dining patterns
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} onClick={() => window.location.reload()}>
            <FiRefreshCw />
          </button>
          <button className={styles.exportButton}>
            <FiDownload /> Export
          </button>
          <button className={styles.addButton} onClick={handleAddCustomer}>
            <FiPlus /> Add Customer
          </button>
        </div>
      </div>

      {/* Customer Analytics */}
      <div className={styles.analyticsGrid}>
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsIcon} style={{ backgroundColor: '#3b82f6' }}>
            <FiUsers />
          </div>
          <div className={styles.analyticsInfo}>
            <h3>Total Customers</h3>
            <p className={styles.analyticsValue}>{customerStats.total}</p>
            <span className={styles.analyticsLabel}>Registered customers</span>
          </div>
        </div>

        <div className={styles.analyticsCard}>
          <div className={styles.analyticsIcon} style={{ backgroundColor: '#10b981' }}>
            <FiTrendingUp />
          </div>
          <div className={styles.analyticsInfo}>
            <h3>Total Revenue</h3>
            <p className={styles.analyticsValue}>{formatCurrency(customerStats.totalRevenue)}</p>
            <span className={styles.analyticsLabel}>From all customers</span>
          </div>
        </div>

        <div className={styles.analyticsCard}>
          <div className={styles.analyticsIcon} style={{ backgroundColor: '#f59e0b' }}>
            <FiTrendingUp />
          </div>
          <div className={styles.analyticsInfo}>
            <h3>Avg Order Value</h3>
            <p className={styles.analyticsValue}>{formatCurrency(customerStats.averageOrderValue)}</p>
            <span className={styles.analyticsLabel}>Per transaction</span>
          </div>
        </div>

        <div className={styles.analyticsCard}>
          <div className={styles.analyticsIcon} style={{ backgroundColor: '#8b5cf6' }}>
            <FiStar />
          </div>
          <div className={styles.analyticsInfo}>
            <h3>VIP Customers</h3>
            <p className={styles.analyticsValue}>{customerStats.vip}</p>
            <span className={styles.analyticsLabel}>Premium members</span>
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className={styles.segmentCards}>
        <div className={styles.segmentCard}>
          <div className={styles.segmentIcon} style={{ backgroundColor: '#f59e0b' }}>
            <FiGift />
          </div>
          <div className={styles.segmentInfo}>
            <h4>New Customers</h4>
            <span className={styles.segmentCount}>{customerStats.new}</span>
          </div>
        </div>
        <div className={styles.segmentCard}>
          <div className={styles.segmentIcon} style={{ backgroundColor: '#10b981' }}>
            <FiHeart />
          </div>
          <div className={styles.segmentInfo}>
            <h4>Returning</h4>
            <span className={styles.segmentCount}>{customerStats.returning}</span>
          </div>
        </div>
        <div className={styles.segmentCard}>
          <div className={styles.segmentIcon} style={{ backgroundColor: '#3b82f6' }}>
            <FiTag />
          </div>
          <div className={styles.segmentInfo}>
            <h4>Loyal</h4>
            <span className={styles.segmentCount}>{customerStats.loyal}</span>
          </div>
        </div>
        <div className={styles.segmentCard}>
          <div className={styles.segmentIcon} style={{ backgroundColor: '#8b5cf6' }}>
            <FiStar />
          </div>
          <div className={styles.segmentInfo}>
            <h4>VIP</h4>
            <span className={styles.segmentCount}>{customerStats.vip}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filters}>
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Segments</option>
            <option value="new">New</option>
            <option value="returning">Returning</option>
            <option value="loyal">Loyal</option>
            <option value="vip">VIP</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="vip">VIP</option>
          </select>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className={styles.filterSelect}
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="total_spent-desc">Highest Spender</option>
            <option value="total_spent-asc">Lowest Spender</option>
            <option value="last_visit-desc">Recent Visit</option>
            <option value="total_orders-desc">Most Orders</option>
          </select>
        </div>
      </div>

      {/* Customers Grid */}
      <div className={styles.customersGrid}>
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className={styles.customerCard}>
            <div className={styles.cardHeader}>
              <div className={styles.customerInfo}>
                <h3 className={styles.customerName}>{customer.name}</h3>
                <div className={styles.customerBadges}>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(customer.status) }}
                  >
                    {customer.status}
                  </span>
                  <span 
                    className={styles.segmentBadge}
                    style={{ backgroundColor: getSegmentColor(customer.customer_segment) }}
                  >
                    {customer.customer_segment}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <FiMail className={styles.contactIcon} />
                  <span>{customer.email}</span>
                </div>
                <div className={styles.contactItem}>
                  <FiPhone className={styles.contactIcon} />
                  <span>{customer.phone}</span>
                </div>
                <div className={styles.contactItem}>
                  <FiMapPin className={styles.contactIcon} />
                  <span>{customer.address}</span>
                </div>
              </div>

              <div className={styles.customerMetrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Total Orders</span>
                  <span className={styles.metricValue}>{customer.total_orders}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Total Spent</span>
                  <span className={styles.metricValue}>{formatCurrency(customer.total_spent)}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Loyalty Points</span>
                  <span className={styles.metricValue}>{customer.loyalty_points}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Last Visit</span>
                  <span className={styles.metricValue}>{new Date(customer.last_visit).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button
                className={styles.actionButton}
                onClick={() => handleViewCustomer(customer)}
                title="View Details"
              >
                <FiEye />
              </button>
              <button
                className={styles.actionButton}
                onClick={() => handleEditCustomer(customer)}
                title="Edit Customer"
              >
                <FiEdit />
              </button>
              <button
                className={styles.actionButton}
                onClick={() => handleViewOrders(customer)}
                title="View Orders"
              >
                <FiShoppingCart />
              </button>
              <button
                className={styles.actionButton}
                onClick={() => handleViewAnalytics(customer)}
                title="Analytics"
              >
                <FiBarChart2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className={styles.emptyState}>
          <FiUsers size={64} />
          <h3>No customers found</h3>
          <p>Try adjusting your search criteria or add a new customer</p>
          <button className={styles.addButton} onClick={handleAddCustomer}>
            <FiPlus /> Add First Customer
          </button>
        </div>
      )}

      {/* Modals */}
      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        customer={selectedCustomer}
        isEditing={isEditing}
        onSave={handleCustomerSaved}
      />

      <CustomerDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        customer={selectedCustomer}
      />

      <CustomerAnalyticsModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        customer={selectedCustomer}
      />

      <CustomerOrdersModal
        isOpen={showOrdersModal}
        onClose={() => setShowOrdersModal(false)}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default CustomerManagementPage;
