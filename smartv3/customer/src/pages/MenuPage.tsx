// Restaurant Menu Page - Main Hub After Login
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingCart,
  FiSearch,
  FiFilter,
  FiPlus,
  FiMinus,
  FiUser,
  FiMapPin,
  FiPackage,
  FiTruck,
  FiStar,
  FiClock,
  FiRefreshCw,
  FiWifi,
  FiWifiOff
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Types
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface MenuItem {
  id: number;
  name: string;
  price: string | number; // API returns string, but we handle both
  description?: string;
  image?: string | null;
  category: number;
  available: boolean;
  stock: number;
  low_stock_threshold: number;
}

// Service Types
type ServiceType = 'dine-in' | 'takeaway' | 'delivery';

// Category Icons Mapping
const CATEGORY_ICONS: Record<string, string> = {
  'appetizers': '🥗',
  'starters': '🥗',
  'mains': '🍖',
  'main-courses': '🍖',
  'main courses': '🍖',
  'entrees': '🍖',
  'desserts': '🍰',
  'sweets': '🍰',
  'drinks': '🥤',
  'beverages': '🥤',
  'cocktails': '🍹',
  'specials': '⭐',
  'featured': '⭐',
  'pizza': '🍕',
  'pasta': '🍝',
  'salads': '🥗',
  'soups': '🍲',
  'seafood': '🐟',
  'meat': '🥩',
  'vegetarian': '🥬',
  'vegan': '🌱'
};

// Get icon for category
const getCategoryIcon = (categoryName: string): string => {
  const key = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return CATEGORY_ICONS[key] || CATEGORY_ICONS[categoryName.toLowerCase()] || '🍽️';
};

// Fallback data in case API fails
const FALLBACK_CATEGORIES: Category[] = [
  { id: 1, name: 'Appetizers', slug: 'appetizers' },
  { id: 2, name: 'Main Courses', slug: 'main-courses' },
  { id: 3, name: 'Desserts', slug: 'desserts' },
  { id: 4, name: 'Beverages', slug: 'beverages' }
];

const FALLBACK_MENU_ITEMS: MenuItem[] = [
  {
    id: 1,
    name: 'Chicken Wings',
    price: 15.00,
    description: 'Crispy chicken wings with BBQ sauce',
    category: 1,
    available: true,
    stock: 25,
    low_stock_threshold: 5
  },
  {
    id: 2,
    name: 'Grilled Beef Steak',
    price: 35.00,
    description: 'Premium beef steak with mashed potatoes',
    category: 2,
    available: true,
    stock: 15,
    low_stock_threshold: 5
  }
];

const MenuPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addToCart, cartItems, getCartItemCount, getCartTotal } = useCart();

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [serviceType, setServiceType] = useState<ServiceType>('dine-in');
  const [showCart, setShowCart] = useState<boolean>(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [hasNewUpdates, setHasNewUpdates] = useState<boolean>(false);
  const [previousItemCount, setPreviousItemCount] = useState<number>(0);

  // API Functions
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/menu/categories/`);
      console.log('Categories API Response:', response.data); // Debug log

      // Handle different response structures
      let categories = response.data;
      if (categories && typeof categories === 'object') {
        // If response has results property (paginated)
        if (categories.results && Array.isArray(categories.results)) {
          categories = categories.results;
        }
        // If response is not an array, wrap it
        else if (!Array.isArray(categories)) {
          categories = [];
        }
      } else {
        categories = [];
      }

      setCategories(categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      console.log('Using fallback categories');
      setCategories(FALLBACK_CATEGORIES); // Use fallback data
      setError('Using offline menu data');
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch only available items for customers
      const response = await axios.get(`${API_BASE_URL}/menu/items/`, {
        params: {
          available: true,
          ordering: 'category,name'
        }
      });

      console.log('API Response:', response.data); // Debug log

      // Handle different response structures
      let items = response.data;
      if (items && typeof items === 'object') {
        // If response has results property (paginated)
        if (items.results && Array.isArray(items.results)) {
          items = items.results;
        }
        // If response is not an array, wrap it
        else if (!Array.isArray(items)) {
          items = [];
        }
      } else {
        items = [];
      }

      // Detect changes for visual feedback
      const currentItemCount = items.length;
      const hasChanges = currentItemCount !== previousItemCount ||
                        JSON.stringify(items) !== JSON.stringify(menuItems);

      if (hasChanges && menuItems.length > 0) {
        setHasNewUpdates(true);
        // Auto-hide the update notification after 3 seconds
        setTimeout(() => setHasNewUpdates(false), 3000);
      }

      setMenuItems(items);
      setPreviousItemCount(currentItemCount);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      console.log('Using fallback menu items');
      setMenuItems(FALLBACK_MENU_ITEMS); // Use fallback data
      setError('Using offline menu data');
    } finally {
      setLoading(false);
    }
  };

  // Efficient change detection
  const checkForUpdates = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/menu/items/check_updates/`);
      const { last_updated, item_count } = response.data;

      // Compare with current state to detect changes
      const hasChanges = item_count !== previousItemCount;

      if (hasChanges) {
        // Only fetch full data if changes detected
        await fetchMenuItems();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return false;
    }
  };

  const refreshMenu = async () => {
    await Promise.all([fetchCategories(), fetchMenuItems()]);
  };

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      refreshMenu(); // Refresh data when coming back online
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initial data fetch
  useEffect(() => {
    refreshMenu();
  }, []);

  // Professional real-time sync with efficient change detection
  // Temporarily disabled to avoid rate limiting during testing
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (isOnline && !loading) {
  //       // Use efficient change detection instead of full refresh
  //       checkForUpdates();
  //     }
  //   }, 60000); // 60 seconds to avoid rate limiting

  //   return () => clearInterval(interval);
  // }, [isOnline, loading, previousItemCount]);

  // Additional fast polling when user is actively browsing
  // Temporarily disabled to avoid rate limiting during testing
  // useEffect(() => {
  //   let fastInterval: NodeJS.Timeout;

  //   const handleUserActivity = () => {
  //     // Clear existing fast interval
  //     if (fastInterval) {
  //       clearInterval(fastInterval);
  //     }

  //     // Start fast polling for 2 minutes after user activity
  //     fastInterval = setInterval(() => {
  //       if (isOnline && !loading) {
  //         checkForUpdates();
  //       }
  //     }, 45000); // 45 seconds when user is active (reduced to avoid rate limiting)

  //     // Stop fast polling after 2 minutes of inactivity
  //     setTimeout(() => {
  //       if (fastInterval) {
  //         clearInterval(fastInterval);
  //       }
  //     }, 120000); // 2 minutes
  //   };

  //   // Listen for user interactions
  //   const events = ['click', 'scroll', 'keypress', 'touchstart'];
  //   events.forEach(event => {
  //     document.addEventListener(event, handleUserActivity);
  //   });

  //   return () => {
  //     if (fastInterval) {
  //       clearInterval(fastInterval);
  //     }
  //     events.forEach(event => {
  //       document.removeEventListener(event, handleUserActivity);
  //     });
  //   };
  // }, [isOnline, loading]);

  // Get category name by ID
  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown';
  };

  // Filter menu items based on category and search
  const filteredItems = (Array.isArray(menuItems) ? menuItems : []).filter(item => {
    // Only show available items
    if (!item.available) return false;

    const matchesCategory = selectedCategory === 'all' ||
                           item.category.toString() === selectedCategory ||
                           getCategoryName(item.category).toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Format price in TZS (convert from decimal to integer for display)
  const formatPrice = (price: number | string): string => {
    // Backend stores price as decimal string (e.g., "15.00"), convert to TZS integer format
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    const priceInTZS = Math.round(numericPrice * 1000); // Convert to TZS (assuming price is in thousands)
    return `TZS ${priceInTZS.toLocaleString()}`;
  };

  // Get quantity for specific item
  const getItemQuantity = (itemId: number): number => {
    return quantities[itemId] || 1;
  };

  // Update quantity for specific item
  const updateItemQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 10) newQuantity = 10; // Max quantity limit
    setQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  // Handle add to cart
  const handleAddToCart = (item: MenuItem) => {
    const quantity = getItemQuantity(item.id);
    addToCart(item, quantity);
    // Reset quantity to 1 after adding
    setQuantities(prev => ({
      ...prev,
      [item.id]: 1
    }));
    // Show brief feedback
    setShowCart(true);
    setTimeout(() => setShowCart(false), 2000);
  };

  // Handle logout with debouncing
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/');
    }
  };

  // Handle cart navigation
  const handleCartNavigation = () => {
    navigate('/cart');
  };

  // Handle checkout navigation
  const handleCheckout = () => {
    if (serviceType === 'dine-in') {
      navigate('/table-selection');
    } else {
      navigate('/checkout');
    }
  };

  // Handle search clear
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Handle category selection with feedback
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery(''); // Clear search when changing category
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    await refreshMenu();
  };

  // Handle service type change
  const handleServiceTypeChange = (type: ServiceType) => {
    if (type !== 'delivery') { // Delivery is disabled
      setServiceType(type);
    }
  };

  return (
    <div className="menu-page">
      {/* Header */}
      <motion.div
        className="menu-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-top">
          <div className="user-info">
            <FiUser />
            <span>Welcome, {user?.first_name || 'Customer'}!</span>
          </div>
          <div className="header-actions">
            <button
              className="cart-icon-btn"
              onClick={handleCartNavigation}
              title="View Cart"
            >
              <FiShoppingCart />
              {getCartItemCount() > 0 && (
                <span className="cart-badge">{getCartItemCount()}</span>
              )}
            </button>
            <button
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="header-main">
          <h1>Smart Restaurant Menu</h1>
          <div className="menu-status">
            <p>Choose your favorite dishes</p>
            <div className="status-indicators">
              <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? <FiWifi /> : <FiWifiOff />}
                <span>{isOnline ? 'Live Menu' : 'Offline'}</span>
                {lastUpdated && (
                  <span className="last-updated">
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <button
                className="refresh-btn"
                onClick={handleRefresh}
                disabled={loading}
                title="Refresh menu"
              >
                <FiRefreshCw className={loading ? 'spinning' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Service Type Selector */}
        <div className="service-selector">
          <button
            className={`service-btn ${serviceType === 'dine-in' ? 'active' : ''}`}
            onClick={() => handleServiceTypeChange('dine-in')}
            title="Dine in at the restaurant"
          >
            <FiMapPin />
            Dine-in
          </button>
          <button
            className={`service-btn ${serviceType === 'takeaway' ? 'active' : ''}`}
            onClick={() => handleServiceTypeChange('takeaway')}
            title="Order for pickup"
          >
            <FiPackage />
            Takeaway
          </button>
          <button
            className={`service-btn ${serviceType === 'delivery' ? 'active' : ''}`}
            onClick={() => handleServiceTypeChange('delivery')}
            disabled
            title="Delivery service coming soon"
          >
            <FiTruck />
            Delivery
            <span className="coming-soon">Soon</span>
          </button>
        </div>
      </motion.div>

      {/* Update Notification */}
      <AnimatePresence>
        {hasNewUpdates && (
          <motion.div
            className="update-notification"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="update-content">
              <FiRefreshCw className="spinning" />
              <span>Menu updated! New items or changes available.</span>
              <button
                className="dismiss-btn"
                onClick={() => setHasNewUpdates(false)}
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter */}
      <motion.div
        className="menu-controls"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="search-bar">
          <FiSearch />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={handleClearSearch}
              type="button"
            >
              ×
            </button>
          )}
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        className="category-tabs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* All Items Tab */}
        <button
          className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => handleCategorySelect('all')}
        >
          <span className="category-icon">🍽️</span>
          <span className="category-name">All Items</span>
        </button>

        {/* Dynamic Category Tabs */}
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${selectedCategory === category.id.toString() ? 'active' : ''}`}
            onClick={() => handleCategorySelect(category.id.toString())}
          >
            <span className="category-icon">{getCategoryIcon(category.name)}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </motion.div>

      {/* Menu Items Grid */}
      <motion.div
        className="menu-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <FiRefreshCw className="spinning" />
            <p>Loading fresh menu...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <p>{error}</p>
            <button className="retry-btn" onClick={handleRefresh}>
              <FiRefreshCw />
              Try Again
            </button>
          </div>
        )}

        {/* Menu Grid */}
        {!loading && !error && (
          <div className="menu-grid">
            <AnimatePresence>
              {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                className="menu-item"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="item-image">
                  <img
                    src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:8000${item.image}`) : '/api/placeholder/300/200'}
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/api/placeholder/300/200';
                    }}
                  />
                  {/* Low Stock Badge */}
                  {item.stock <= item.low_stock_threshold && item.stock > 0 && (
                    <div className="stock-badge low-stock">
                      <FiClock />
                      Low Stock
                    </div>
                  )}
                  {/* Special Category Badge */}
                  {getCategoryName(item.category).toLowerCase().includes('special') && (
                    <div className="special-badge">
                      <FiStar />
                      Special
                    </div>
                  )}
                </div>

                <div className="item-content">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-description">{item.description}</p>

                  <div className="item-footer">
                    <div className="item-price">
                      {formatPrice(item.price)}
                    </div>

                    <div className="item-actions">
                      <div className="quantity-selector">
                        <button
                          className="quantity-btn decrease"
                          onClick={() => updateItemQuantity(item.id, getItemQuantity(item.id) - 1)}
                          disabled={getItemQuantity(item.id) <= 1}
                          title="Decrease quantity"
                        >
                          <FiMinus />
                          <span className="symbol-text">−</span>
                        </button>
                        <span className="quantity-display">
                          {getItemQuantity(item.id)}
                        </span>
                        <button
                          className="quantity-btn increase"
                          onClick={() => updateItemQuantity(item.id, getItemQuantity(item.id) + 1)}
                          disabled={getItemQuantity(item.id) >= 10}
                          title="Increase quantity"
                        >
                          <FiPlus />
                          <span className="symbol-text">+</span>
                        </button>
                      </div>

                      <button
                        className="add-btn"
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.available || item.stock <= 0}
                        title={!item.available ? 'Item not available' : item.stock <= 0 ? 'Out of stock' : `Add ${getItemQuantity(item.id)} item(s) to cart`}
                      >
                        <FiShoppingCart />
                        <span className="add-btn-text">
                          Add {getItemQuantity(item.id) > 1 ? `(${getItemQuantity(item.id)})` : ''}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="no-items">
            <FiSearch />
            <h3>No items found</h3>
            <p>
              {searchQuery
                ? `No items match "${searchQuery}". Try a different search term.`
                : selectedCategory !== 'all'
                  ? `No items available in this category.`
                  : 'No menu items available at the moment.'
              }
            </p>
            {searchQuery && (
              <button
                className="clear-search-btn-alt"
                onClick={handleClearSearch}
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {getCartItemCount() > 0 && (
          <motion.div
            className="floating-cart"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            onClick={handleCheckout}
          >
            <div className="cart-info">
              <div className="cart-count">
                <FiShoppingCart />
                <span className="count-badge">{getCartItemCount()}</span>
              </div>
              <div className="cart-details">
                <span className="cart-items">{getCartItemCount()} items</span>
                <span className="cart-total">{formatPrice(getCartTotal())}</span>
              </div>
            </div>
            <div className="checkout-text">
              {serviceType === 'dine-in' ? 'Select Table' : 'Checkout'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Added Feedback */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            className="cart-feedback"
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
          >
            <FiShoppingCart />
            Item added to cart!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuPage;
