// Professional Customer Profile System
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiEdit3, FiSave,
  FiX, FiCamera, FiHeart, FiClock, FiShoppingBag,
  FiStar, FiTrendingUp, FiCalendar, FiEye, FiSettings,
  FiLogOut, FiArrowLeft, FiRefreshCw, FiAward, FiTarget,
  FiGift, FiCreditCard, FiBell, FiLock, FiTrash2
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Professional TypeScript interfaces
interface CustomerProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  avatar?: string;
  preferences: {
    dietary_restrictions: string[];
    favorite_cuisine: string[];
    spice_level: 'mild' | 'medium' | 'hot' | 'extra_hot';
    notifications_enabled: boolean;
    marketing_emails: boolean;
  };
  loyalty: {
    points: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    total_spent: number;
    visits_count: number;
    next_reward_points: number;
  };
  stats: {
    total_orders: number;
    favorite_items: string[];
    last_order_date?: string;
    average_order_value: number;
  };
}

interface OrderHistory {
  id: number;
  order_number: string;
  date: string;
  total: number;
  status: string;
  items_count: number;
  restaurant_rating?: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  unlocked: boolean;
  progress?: number;
  max_progress?: number;
  reward_points?: number;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Professional state management
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'loyalty' | 'settings'>('profile');
  const [editedProfile, setEditedProfile] = useState<Partial<CustomerProfile>>({});
  const [saving, setSaving] = useState(false);

  // Professional utility functions
  const formatPrice = (price: number): string => {
    return `TZS ${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-TZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'bronze': return '#cd7f32';
      case 'silver': return '#c0c0c0';
      case 'gold': return '#ffd700';
      case 'platinum': return '#e5e4e2';
      default: return '#cd7f32';
    }
  };

  const getTierIcon = (tier: string): React.ComponentType<any> => {
    switch (tier) {
      case 'bronze': return FiAward;
      case 'silver': return FiStar;
      case 'gold': return FiTarget;
      case 'platinum': return FiGift;
      default: return FiAward;
    }
  };

  // Professional API integration
  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // In a real app, these would be separate API calls
      const [profileResponse, ordersResponse, achievementsResponse] = await Promise.allSettled([
        axios.get(`http://localhost:8000/api/customers/profile/`),
        axios.get(`http://localhost:8000/api/customers/orders/`),
        axios.get(`http://localhost:8000/api/customers/achievements/`)
      ]);

      // Handle responses or fallback to mock data
      if (profileResponse.status === 'fulfilled') {
        setProfile(profileResponse.value.data);
      } else {
        setProfile(getMockProfile());
      }

      if (ordersResponse.status === 'fulfilled') {
        setOrderHistory(ordersResponse.value.data);
      } else {
        setOrderHistory(getMockOrderHistory());
      }

      if (achievementsResponse.status === 'fulfilled') {
        setAchievements(achievementsResponse.value.data);
      } else {
        setAchievements(getMockAchievements());
      }

      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch profile data:', err);

      // Fallback to mock data for demonstration
      setProfile(getMockProfile());
      setOrderHistory(getMockOrderHistory());
      setAchievements(getMockAchievements());
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Professional mock data for demonstration
  const getMockProfile = (): CustomerProfile => ({
    id: 1,
    first_name: user?.first_name || 'John',
    last_name: user?.last_name || 'Mwangi',
    email: user?.email || 'john.mwangi@example.com',
    phone: '+255 712 345 678',
    date_of_birth: '1990-05-15',
    address: 'Mikocheni, House No. 45',
    city: 'Dar es Salaam',
    avatar: '/api/placeholder/150/150',
    preferences: {
      dietary_restrictions: ['halal'],
      favorite_cuisine: ['tanzanian', 'indian'],
      spice_level: 'medium',
      notifications_enabled: true,
      marketing_emails: false
    },
    loyalty: {
      points: 2450,
      tier: 'gold',
      total_spent: 125.50,
      visits_count: 23,
      next_reward_points: 550
    },
    stats: {
      total_orders: 23,
      favorite_items: ['Nyama Choma', 'Pilau', 'Chai ya Tangawizi'],
      last_order_date: '2024-01-10T14:30:00Z',
      average_order_value: 45.50
    }
  });

  const getMockOrderHistory = (): OrderHistory[] => [
    {
      id: 1,
      order_number: 'ORD-001',
      date: '2024-01-10T14:30:00Z',
      total: 61.00,
      status: 'completed',
      items_count: 3,
      restaurant_rating: 5,
      items: [
        { name: 'Nyama Choma', quantity: 2, price: 25.00 },
        { name: 'Ugali', quantity: 2, price: 3.00 },
        { name: 'Chai ya Tangawizi', quantity: 2, price: 2.50 }
      ]
    },
    {
      id: 2,
      order_number: 'ORD-002',
      date: '2024-01-08T19:15:00Z',
      total: 78.00,
      status: 'completed',
      items_count: 2,
      restaurant_rating: 4,
      items: [
        { name: 'Pilau', quantity: 3, price: 22.00 },
        { name: 'Samosa', quantity: 6, price: 2.00 }
      ]
    },
    {
      id: 3,
      order_number: 'ORD-003',
      date: '2024-01-05T12:45:00Z',
      total: 40.00,
      status: 'completed',
      items_count: 2,
      restaurant_rating: 5,
      items: [
        { name: 'Chapati na Mchuzi', quantity: 4, price: 8.00 },
        { name: 'Juice ya Maembe', quantity: 2, price: 4.00 }
      ]
    }
  ];

  const getMockAchievements = (): Achievement[] => [
    {
      id: 'first_order',
      title: 'First Order',
      description: 'Placed your first order',
      icon: FiShoppingBag,
      unlocked: true,
      reward_points: 100
    },
    {
      id: 'loyal_customer',
      title: 'Loyal Customer',
      description: 'Made 10 orders',
      icon: FiHeart,
      unlocked: true,
      reward_points: 500
    },
    {
      id: 'big_spender',
      title: 'Big Spender',
      description: 'Spent over TZS 100,000',
      icon: FiTrendingUp,
      unlocked: true,
      reward_points: 1000
    },
    {
      id: 'food_explorer',
      title: 'Food Explorer',
      description: 'Tried 20 different dishes',
      icon: FiStar,
      unlocked: false,
      progress: 15,
      max_progress: 20,
      reward_points: 750
    },
    {
      id: 'review_master',
      title: 'Review Master',
      description: 'Left 10 reviews',
      icon: FiEye,
      unlocked: false,
      progress: 6,
      max_progress: 10,
      reward_points: 300
    }
  ];

  // Professional lifecycle management
  useEffect(() => {
    fetchProfileData();
  }, []);

  // Professional event handlers
  const handleEditProfile = () => {
    setEditedProfile({ ...profile });
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    if (!profile || !editedProfile) return;

    try {
      setSaving(true);

      // In a real app, this would be an API call
      const response = await axios.put(
        `http://localhost:8000/api/customers/profile/`,
        editedProfile
      );

      setProfile({ ...profile, ...editedProfile });
      setEditMode(false);
      setEditedProfile({});
    } catch (error) {
      console.error('Failed to save profile:', error);
      // For demo, just update locally
      setProfile({ ...profile, ...editedProfile });
      setEditMode(false);
      setEditedProfile({});
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedProfile({});
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      preferences: {
        dietary_restrictions: [],
        favorite_cuisine: [],
        spice_level: 'medium' as const,
        notifications_enabled: true,
        marketing_emails: false,
        ...profile?.preferences,
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/');
    }
  };

  const handleViewOrder = (orderId: number) => {
    navigate(`/order-tracking/${orderId}`);
  };

  const handleReorderItems = (order: OrderHistory) => {
    // Add items to cart and navigate to cart
    console.log('Reordering items from order:', order.order_number);
    navigate('/cart');
  };

  const handleBackToMenu = () => {
    navigate('/menu');
  };

  // Professional loading state
  if (loading) {
    return (
      <motion.div
        className="profile-page"
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
          <p>Loading your profile...</p>
        </div>
      </motion.div>
    );
  }

  // Professional error state
  if (error && !profile) {
    return (
      <motion.div
        className="profile-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="error-container">
          <FiUser size={48} className="error-icon" />
          <h2>Unable to Load Profile</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button className="btn-primary" onClick={fetchProfileData}>
              <FiRefreshCw /> Try Again
            </button>
            <button className="btn-secondary" onClick={handleBackToMenu}>
              <FiArrowLeft /> Back to Menu
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!profile) return null;

  const TierIcon: React.FC<{ tier: string; style?: React.CSSProperties } & React.HTMLAttributes<HTMLElement>> = ({ tier, style, ...props }) => {
    const IconComponent = getTierIcon(tier);
    return <IconComponent {...props} style={{ ...style, color: getTierColor(tier) }} />;
  };

  return (
    <motion.div
      className="profile-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Professional Header */}
      <div className="profile-header">
        <div className="header-content">
          <button className="back-btn" onClick={handleBackToMenu}>
            <FiArrowLeft /> Back to Menu
          </button>
          <div className="header-info">
            <h1>My Profile</h1>
            <p>Manage your account and preferences</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
          </button>
        </div>
      </div>

      {/* Professional Profile Summary Card */}
      <motion.div
        className="profile-summary-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="profile-avatar-section">
          <div className="avatar-container">
            <img
              src={profile.avatar || '/api/placeholder/120/120'}
              alt="Profile"
              className="profile-avatar"
            />
            <button className="avatar-edit-btn">
              <FiCamera />
            </button>
          </div>
          <div className="profile-basic-info">
            <h2>{profile.first_name} {profile.last_name}</h2>
            <p className="profile-email">{profile.email}</p>
            <div className="loyalty-tier">
              <span className="tier-icon">
                <TierIcon tier={profile.loyalty.tier} />
              </span>
              <span style={{ color: getTierColor(profile.loyalty.tier) }}>
                <TierIcon tier={profile.loyalty.tier} />
              </span>
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <FiShoppingBag className="stat-icon" />
            <div className="stat-details">
              <span className="stat-value">{profile.stats.total_orders}</span>
              <span className="stat-label">Orders</span>
            </div>
          </div>
          <div className="stat-item">
            <FiTrendingUp className="stat-icon" />
            <div className="stat-details">
              <span className="stat-value">{formatPrice(profile.loyalty.total_spent)}</span>
              <span className="stat-label">Total Spent</span>
            </div>
          </div>
          <div className="stat-item">
            <FiStar className="stat-icon" />
            <div className="stat-details">
              <span className="stat-value">{profile.loyalty.points}</span>
              <span className="stat-label">Points</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Professional Tab Navigation */}
      <motion.div
        className="tab-navigation"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FiUser /> Profile
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <FiShoppingBag /> Orders
        </button>
        <button
          className={`tab-btn ${activeTab === 'loyalty' ? 'active' : ''}`}
          onClick={() => setActiveTab('loyalty')}
        >
          <FiStar /> Loyalty
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FiSettings /> Settings
        </button>
      </motion.div>

      {/* Professional Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            className="tab-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="profile-details-card">
              <div className="card-header">
                <h3>Personal Information</h3>
                {!editMode ? (
                  <button className="edit-btn" onClick={handleEditProfile}>
                    <FiEdit3 /> Edit
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button
                      className="save-btn"
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? <FiRefreshCw className="spinning" /> : <FiSave />}
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="cancel-btn" onClick={handleCancelEdit}>
                      <FiX /> Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-input"
                        value={editedProfile.first_name || profile.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                      />
                    ) : (
                      <div className="form-display">{profile.first_name}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-input"
                        value={editedProfile.last_name || profile.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                      />
                    ) : (
                      <div className="form-display">{profile.last_name}</div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  {editMode ? (
                    <input
                      type="email"
                      className="form-input"
                      value={editedProfile.email || profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  ) : (
                    <div className="form-display">
                      <FiMail className="display-icon" />
                      {profile.email}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  {editMode ? (
                    <input
                      type="tel"
                      className="form-input"
                      value={editedProfile.phone || profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  ) : (
                    <div className="form-display">
                      <FiPhone className="display-icon" />
                      {profile.phone}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  {editMode ? (
                    <input
                      type="date"
                      className="form-input"
                      value={editedProfile.date_of_birth || profile.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    />
                  ) : (
                    <div className="form-display">
                      <FiCalendar className="display-icon" />
                      {profile.date_of_birth ? formatDate(profile.date_of_birth) : 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  {editMode ? (
                    <textarea
                      className="form-input"
                      rows={3}
                      value={editedProfile.address || profile.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter your address"
                    />
                  ) : (
                    <div className="form-display">
                      <FiMapPin className="display-icon" />
                      {profile.address || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  {editMode ? (
                    <input
                      type="text"
                      className="form-input"
                      value={editedProfile.city || profile.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter your city"
                    />
                  ) : (
                    <div className="form-display">
                      <FiMapPin className="display-icon" />
                      {profile.city || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Food Preferences Card */}
            <div className="preferences-card">
              <h3>Food Preferences</h3>
              <div className="preferences-grid">
                <div className="preference-item">
                  <label className="preference-label">Dietary Restrictions</label>
                  <div className="preference-tags">
                    {profile.preferences.dietary_restrictions.map((restriction, index) => (
                      <span key={index} className="preference-tag">
                        {restriction}
                      </span>
                    ))}
                    {profile.preferences.dietary_restrictions.length === 0 && (
                      <span className="no-preferences">None specified</span>
                    )}
                  </div>
                </div>
                <div className="preference-item">
                  <label className="preference-label">Favorite Cuisine</label>
                  <div className="preference-tags">
                    {profile.preferences.favorite_cuisine.map((cuisine, index) => (
                      <span key={index} className="preference-tag">
                        {cuisine}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="preference-item">
                  <label className="preference-label">Spice Level</label>
                  <div className="spice-level">
                    <span className={`spice-indicator ${profile.preferences.spice_level}`}>
                      {profile.preferences.spice_level.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            className="tab-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="orders-card">
              <div className="card-header">
                <h3>Order History</h3>
                <span className="orders-count">{orderHistory.length} orders</span>
              </div>

              <div className="orders-list">
                {orderHistory.map((order, index) => (
                  <motion.div
                    key={order.id}
                    className="order-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="order-header">
                      <div className="order-info">
                        <h4>Order #{order.order_number}</h4>
                        <p className="order-date">{formatDate(order.date)}</p>
                      </div>
                      <div className="order-status">
                        <span className={`status-badge ${order.status}`}>
                          {order.status}
                        </span>
                        <span className="order-total">{formatPrice(order.total)}</span>
                      </div>
                    </div>

                    <div className="order-items">
                      {order.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="order-item-detail">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">×{item.quantity}</span>
                          <span className="item-price">{formatPrice(item.price)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <FiEye /> View Details
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => handleReorderItems(order)}
                      >
                        <FiRefreshCw /> Reorder
                      </button>
                      {order.restaurant_rating && (
                        <div className="order-rating">
                          <FiStar className="rating-star" />
                          <span>{order.restaurant_rating}/5</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {orderHistory.length === 0 && (
                <div className="no-orders">
                  <FiShoppingBag size={48} />
                  <h4>No Orders Yet</h4>
                  <p>Start exploring our menu and place your first order!</p>
                  <button className="btn-primary" onClick={handleBackToMenu}>
                    <FiShoppingBag /> Browse Menu
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'loyalty' && (
          <motion.div
            key="loyalty"
            className="tab-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Loyalty Status Card */}
            <div className="loyalty-status-card">
              <div className="loyalty-header">
                <div className="tier-info">
                  <TierIcon
                    tier={profile.loyalty.tier}
                    style={{ color: getTierColor(profile.loyalty.tier) }}
                  />
                  <div>
                    <h3>{profile.loyalty.tier.charAt(0).toUpperCase() + profile.loyalty.tier.slice(1)} Member</h3>
                    <p>You have {profile.loyalty.points} loyalty points</p>
                  </div>
                </div>
                <div className="points-display">
                  <span className="points-value">{profile.loyalty.points}</span>
                  <span className="points-label">Points</span>
                </div>
              </div>

              <div className="loyalty-progress">
                <div className="progress-info">
                  <span>Progress to next reward</span>
                  <span>{profile.loyalty.next_reward_points} points to go</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${((3000 - profile.loyalty.next_reward_points) / 3000) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div className="loyalty-stats">
                <div className="loyalty-stat">
                  <FiTrendingUp className="stat-icon" />
                  <div>
                    <span className="stat-value">{formatPrice(profile.loyalty.total_spent)}</span>
                    <span className="stat-label">Total Spent</span>
                  </div>
                </div>
                <div className="loyalty-stat">
                  <FiCalendar className="stat-icon" />
                  <div>
                    <span className="stat-value">{profile.loyalty.visits_count}</span>
                    <span className="stat-label">Visits</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements Card */}
            <div className="achievements-card">
              <h3>Achievements</h3>
              <div className="achievements-grid">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="achievement-icon">
                      <achievement.icon />
                    </div>
                    <div className="achievement-info">
                      <h4>{achievement.title}</h4>
                      <p>{achievement.description}</p>
                      {achievement.progress !== undefined && (
                        <div className="achievement-progress">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${(achievement.progress / (achievement.max_progress || 1)) * 100}%`
                              }}
                            />
                          </div>
                          <span className="progress-text">
                            {achievement.progress}/{achievement.max_progress}
                          </span>
                        </div>
                      )}
                      {achievement.reward_points && (
                        <div className="achievement-reward">
                          <FiGift />
                          <span>{achievement.reward_points} points</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            className="tab-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Notification Settings */}
            <div className="settings-card">
              <h3>Notification Preferences</h3>
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <FiBell className="setting-icon" />
                    <div>
                      <h4>Push Notifications</h4>
                      <p>Receive notifications about order updates</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={profile.preferences.notifications_enabled}
                      onChange={(e) => handlePreferenceChange('notifications_enabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <FiMail className="setting-icon" />
                    <div>
                      <h4>Marketing Emails</h4>
                      <p>Receive promotional offers and updates</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={profile.preferences.marketing_emails}
                      onChange={(e) => handlePreferenceChange('marketing_emails', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="settings-card">
              <h3>Account Settings</h3>
              <div className="settings-list">
                <button className="setting-button">
                  <FiLock className="setting-icon" />
                  <div className="setting-info">
                    <h4>Change Password</h4>
                    <p>Update your account password</p>
                  </div>
                  <FiEdit3 className="setting-arrow" />
                </button>

                <button className="setting-button">
                  <FiCreditCard className="setting-icon" />
                  <div className="setting-info">
                    <h4>Payment Methods</h4>
                    <p>Manage your payment options</p>
                  </div>
                  <FiEdit3 className="setting-arrow" />
                </button>

                <button className="setting-button">
                  <FiMapPin className="setting-icon" />
                  <div className="setting-info">
                    <h4>Delivery Addresses</h4>
                    <p>Manage your saved addresses</p>
                  </div>
                  <FiEdit3 className="setting-arrow" />
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="settings-card danger-zone">
              <h3>Danger Zone</h3>
              <div className="settings-list">
                <button className="setting-button danger">
                  <FiTrash2 className="setting-icon" />
                  <div className="setting-info">
                    <h4>Delete Account</h4>
                    <p>Permanently delete your account and data</p>
                  </div>
                  <FiEdit3 className="setting-arrow" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfilePage;
