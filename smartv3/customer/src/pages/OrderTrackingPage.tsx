// Professional Real-time Order Tracking System
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FiClock, FiCheckCircle, FiTruck, FiMapPin, FiPhone,
  FiUser, FiShoppingBag, FiArrowLeft, FiRefreshCw,
  FiAlertCircle, FiEye, FiMessageCircle, FiStar,
  FiCalendar, FiTrendingUp, FiHome, FiCheck,
  FiPlay, FiPause, FiBell, FiActivity, FiCoffee
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import '../styles/RealTimeOrderTracking.css';
import FeedbackModal from '../components/FeedbackModal';
import type { FeedbackFormData } from '../types/feedback';
// Temporarily define interfaces locally to avoid import issues
interface OrderStatus {
  id: number;
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total: string;
  created_at: string;
  confirmed_at?: string;
  kitchen_started_at?: string;
  ready_at?: string;
  completed_at?: string;
  estimated_completion?: string;
  is_takeout: boolean;
  table_number?: number;
  customer_phone?: string;
  special_instructions?: string;
  items: OrderItem[];
  kitchen_notes?: string;
  preparation_time?: number;
  priority: 'normal' | 'high' | 'urgent';
  assigned_chef?: string;
  server?: string;
}

interface OrderItem {
  id: number;
  menu_item: string;
  menu_item_name?: string;
  quantity: number;
  unit_price: string;
  line_total: string;
  // Note: OrderItems don't have individual status - they inherit from the parent Order
  // Note: special_instructions are not implemented in the backend yet
}

interface OrderStatusUpdate {
  status: OrderStatus['status'];
  timestamp: string;
  message: string;
  estimated_time?: number;
}

// Simplified order tracking service
const createOrderTrackingService = () => {
  // Configure axios for authenticated requests
  const apiClient = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,  // Include session cookies
    headers: {
      'Content-Type': 'application/json',
    }
  });

  return {
    getOrderStatus: async (orderId: number): Promise<OrderStatus> => {
      try {
        console.log(`🔍 Fetching order ${orderId} from backend...`);
        const response = await apiClient.get(`/api/orders/${orderId}/`);
        console.log(`✅ Order ${orderId} fetched successfully:`, response.data);
        return response.data;
      } catch (error: any) {
        console.error(`❌ Failed to fetch order ${orderId}:`, error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        throw error;
      }
    },

    getEstimatedTime: (orderData: OrderStatus): string => {
      switch (orderData.status) {
        case 'pending':
          return '5-10 minutes';
        case 'confirmed':
          return '15-25 minutes';
        case 'preparing':
          return '10-20 minutes';
        case 'ready':
          return 'Ready now!';
        case 'completed':
          return 'Completed';
        default:
          return 'Unknown';
      }
    },

    getProgressPercentage: (status: string): number => {
      switch (status) {
        case 'pending':
          return 10;
        case 'confirmed':
          return 25;
        case 'preparing':
          return 60;
        case 'ready':
          return 90;
        case 'completed':
          return 100;
        default:
          return 0;
      }
    }
  };
};

const orderTrackingService = createOrderTrackingService();

interface OrderStatusStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
  estimatedTime?: string;
}

const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Professional state management
  const [orderData, setOrderData] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statusHistory, setStatusHistory] = useState<OrderStatusUpdate[]>([]);
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showDetails, setShowDetails] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedOrderForFeedback, setSelectedOrderForFeedback] = useState<any>(null);

  // Professional utility functions
  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `TZS ${(numPrice * 1000).toLocaleString()}`;
  };

  // Real-time item status display helpers
  const getItemStatusDisplay = (status?: string): string => {
    if (!status) return '⏳ Waiting';

    switch (status) {
      case 'pending': return '⏳ Waiting';
      case 'preparing': return '👨‍🍳 Cooking';
      case 'ready': return '✅ Ready';
      case 'served': return '🍽️ Served';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getItemProgressPercentage = (status?: string): number => {
    if (!status) return 10;

    switch (status) {
      case 'pending': return 10;
      case 'preparing': return 60;
      case 'ready': return 90;
      case 'served': return 100;
      default: return 0;
    }
  };

  const getItemProgressLabel = (status?: string): string => {
    if (!status) return 'Order received';

    switch (status) {
      case 'pending': return 'Order received';
      case 'preparing': return 'Chef is cooking';
      case 'ready': return 'Ready for pickup';
      case 'served': return 'Completed';
      default: return 'Processing';
    }
  };

  const getItemStatusIcon = (status?: string): React.ReactElement => {
    if (!status) return <FiClock />;

    switch (status) {
      case 'pending': return <FiClock />;
      case 'preparing': return <FiCoffee />;
      case 'ready': return <FiCheckCircle />;
      case 'served': return <FiCheck />;
      default: return <FiClock />;
    }
  };

  const getItemTimingDisplay = (orderStatus?: string): string => {
    if (!orderStatus) return 'Waiting to start';

    switch (orderStatus) {
      case 'pending': return 'Waiting to start';
      case 'preparing': return 'Being prepared now';
      case 'ready': return 'Ready for pickup';
      case 'served': return 'Completed';
      default: return '';
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-TZ', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadStatusHistory = async () => {
    // Mock status history for now
    setStatusHistory([
      {
        status: 'pending',
        timestamp: new Date().toISOString(),
        message: 'Order received'
      }
    ]);
  };

  // Simplified real-time polling
  const pollOrderStatus = useCallback(async () => {
    if (!orderId || !isRealTimeActive) return;

    try {
      const orderIdNum = parseInt(orderId);
      const updatedOrder = await orderTrackingService.getOrderStatus(orderIdNum);

      // Only update if status changed
      if (!orderData || updatedOrder.status !== orderData.status) {
        console.log('🔄 Order status changed:', updatedOrder.status);
        setOrderData(updatedOrder);
        setLastUpdate(new Date());

        // Show notification for important status changes
        if (updatedOrder.status === 'ready') {
          console.log('🔔 Order is ready!');
        } else if (updatedOrder.status === 'completed') {
          console.log('✅ Order completed!');
        }
      }
    } catch (error) {
      console.error('Failed to poll order status:', error);
    }
  }, [orderId, isRealTimeActive, orderData]);

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-TZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Simplified order tracking initialization
  const initializeOrderTracking = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const orderIdNum = parseInt(orderId);

      // Get initial order status
      const initialOrder = await orderTrackingService.getOrderStatus(orderIdNum);
      setOrderData(initialOrder);
      setError(null);
    } catch (err: any) {
      console.error('Failed to initialize order tracking:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });

      // Professional error handling with specific messages
      if (err.response?.status === 404) {
        setError(`Order #${orderId} not found. Please check your order number.`);
        console.log('🔍 Order not found - this might be because:');
        console.log('1. Order ID is incorrect');
        console.log('2. Order belongs to a different customer');
        console.log('3. Order was deleted from the system');
      } else if (err.response?.status === 401) {
        setError('Please log in to view your order.');
        console.log('🔒 Authentication required - customer needs to log in');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this order.');
        console.log('🚫 Permission denied - order belongs to different customer');
      } else {
        // Show actual error instead of falling back to mock data
        setError(`Failed to load order: ${err.message}`);
        console.log('⚠️ API Error - showing actual error instead of mock data');
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Manual refresh function
  const refreshOrderData = async () => {
    if (!orderId) return;

    try {
      setRefreshing(true);
      const orderIdNum = parseInt(orderId);
      const updatedOrder = await orderTrackingService.getOrderStatus(orderIdNum);
      setOrderData(updatedOrder);
      setLastUpdate(new Date());
      await loadStatusHistory();
    } catch (error) {
      console.error('Failed to refresh order data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Professional mock data for demonstration
  const getMockOrderData = (): OrderStatus => ({
    id: parseInt(orderId || '1'),
    order_number: `ORD-${orderId?.padStart(3, '0') || '001'}`,
    status: 'preparing',
    total: '61.00',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    estimated_completion: new Date(Date.now() + 10 * 60000).toISOString(),
    is_takeout: false,
    table_number: 5,
    customer_phone: '+255 712 345 678',
    special_instructions: 'Medium spice level, extra sauce on the side',
    preparation_time: 25,
    priority: 'normal',
    items: [
      {
        id: 1,
        menu_item: 'Nyama Choma',
        quantity: 2,
        unit_price: '25.00',
        line_total: '50.00'
      },
      {
        id: 2,
        menu_item: 'Ugali',
        quantity: 2,
        unit_price: '3.00',
        line_total: '6.00'
      },
      {
        id: 3,
        menu_item: 'Chai ya Tangawizi',
        quantity: 2,
        unit_price: '2.50',
        line_total: '5.00'
      }
    ]
  });

  // Professional status step generation
  const getOrderStatusSteps = (): OrderStatusStep[] => {
    if (!orderData) return [];

    const steps: OrderStatusStep[] = [
      {
        id: 'placed',
        title: 'Order Placed',
        description: 'Your order has been received',
        icon: FiCheckCircle,
        status: 'completed',
        timestamp: orderData.created_at
      },
      {
        id: 'confirmed',
        title: 'Order Confirmed',
        description: 'Restaurant has confirmed your order',
        icon: FiUser,
        status: ['confirmed', 'preparing', 'ready', 'completed'].includes(orderData.status) ? 'completed' : 'pending',
        timestamp: orderData.created_at
      },
      {
        id: 'preparing',
        title: 'Preparing',
        description: 'Your food is being prepared',
        icon: FiClock,
        status: orderData.status === 'preparing' ? 'current' :
               ['ready', 'completed'].includes(orderData.status) ? 'completed' : 'pending',
        estimatedTime: orderData.estimated_completion
      },
      {
        id: 'ready',
        title: orderData.is_takeout ? 'Ready for Pickup' : 'Ready to Serve',
        description: orderData.is_takeout ? 'Your order is ready for collection' : 'Your order is ready to be served',
        icon: orderData.is_takeout ? FiShoppingBag : FiTruck,
        status: orderData.status === 'ready' ? 'current' :
               orderData.status === 'completed' ? 'completed' : 'pending'
      },
      {
        id: 'completed',
        title: 'Completed',
        description: orderData.is_takeout ? 'Order collected' : 'Enjoy your meal!',
        icon: FiStar,
        status: orderData.status === 'completed' ? 'completed' : 'pending',
        timestamp: orderData.completed_at
      }
    ];

    return steps;
  };

  // Check authentication first
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (!user) {
      console.log('🔒 User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
  }, [user, authLoading, navigate]);

  // Initialize order tracking
  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }

    if (!user || authLoading) return; // Wait for authentication

    console.log(`🔍 Initializing order tracking for order ${orderId} by user:`, user.email);
    initializeOrderTracking();
  }, [orderId, initializeOrderTracking, user, authLoading]);

  // Set up real-time polling
  useEffect(() => {
    if (!isRealTimeActive || !orderData) return;

    const interval = setInterval(() => {
      pollOrderStatus();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [isRealTimeActive, orderData, pollOrderStatus]);

  // Add this useEffect to show feedback modal when order is completed
  useEffect(() => {
    if (orderData?.status === 'completed' && !showFeedbackModal) {
      // Show feedback modal after a short delay when order is completed
      const timer = setTimeout(() => {
        setSelectedOrderForFeedback(orderData);
        setShowFeedbackModal(true);
      }, 2000); // 2 second delay after completion

      return () => clearTimeout(timer);
    }
  }, [orderData?.status, showFeedbackModal]);

  // Professional event handlers
  const handleRefresh = () => {
    refreshOrderData();
  };

  const handleToggleRealTime = () => {
    setIsRealTimeActive(!isRealTimeActive);
  };

  const handleBackToMenu = () => {
    navigate('/menu');
  };

  const handleBackToOrders = () => {
    navigate('/orders');
  };

  const handleContactRestaurant = () => {
    if (orderData?.customer_phone) {
      window.open(`tel:${orderData.customer_phone}`);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleFeedbackSubmit = async (feedbackData: FeedbackFormData) => {
    try {
      const feedback = {
        id: Date.now(),
        order_id: selectedOrderForFeedback.id,
        customer_id: 1, // Get from auth context
        ...feedbackData,
        created_at: new Date().toISOString(),
        status: 'submitted' as const
      };

      // Save to localStorage (replace with API call)
      const existingFeedbacks = JSON.parse(localStorage.getItem('customer_feedbacks') || '[]');
      existingFeedbacks.push(feedback);
      localStorage.setItem('customer_feedbacks', JSON.stringify(existingFeedbacks));

      alert('Thank you for your feedback!');
      setShowFeedbackModal(false);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  // Professional loading state
  if (loading) {
    return (
      <motion.div
        className="order-tracking-page"
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
          <p>Loading your order details...</p>
        </div>
      </motion.div>
    );
  }

  // Professional error state
  if (error && !orderData) {
    return (
      <motion.div
        className="order-tracking-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="error-container">
          <FiAlertCircle size={48} className="error-icon" />
          <h2>Unable to Load Order</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button className="btn-primary" onClick={handleRefresh}>
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

  if (!orderData) return null;

  const statusSteps = getOrderStatusSteps();
  const currentStepIndex = statusSteps.findIndex(step => step.status === 'current');
  const completedSteps = statusSteps.filter(step => step.status === 'completed').length;

  return (
    <div className="order-tracking-container">
      {/* Header */}
      <div className="tracking-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <FiArrowLeft /> Back to Homepage
        </button>
        <h1>Order Tracking</h1>
        <div className="live-indicator">
          <div className={`status-dot ${isRealTimeActive ? 'active' : ''}`}></div>
          Live Updates
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="order-summary">
        <div className="order-header">
          <div className="order-info">
            <h2>Order #{orderData.order_number}</h2>
            <p className="order-time">
              <FiClock /> Placed at {formatTime(orderData.created_at)}
            </p>
          </div>
          <div className={`status-badge ${orderData.status}`}>
            {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
          </div>
        </div>
        
        <div className="order-details">
          <div className="detail-item">
            <FiMapPin />
            <span>
              {orderData.is_takeout 
                ? 'Takeout' 
                : `Table ${orderData.table_number || 'Not assigned'}`
              }
            </span>
          </div>
          <div className="detail-item">
            <FiTrendingUp />
            <span>Total: {formatPrice(orderData.total)}</span>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="progress-timeline">
        <h3>Order Progress</h3>
        <div className="timeline">
          {getOrderStatusSteps().map((step, index) => (
            <div key={step.id} className={`timeline-item ${step.status}`}>
              <div className="timeline-icon">
                <step.icon />
              </div>
              <div className="timeline-content">
                <h4>{step.title}</h4>
                <p>{step.description}</p>
                {step.timestamp && (
                  <span className="timestamp">{formatTime(step.timestamp)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Items */}
      <div className="order-items">
        <h3>
          <FiCoffee /> Your Items
        </h3>
        <div className="items-grid">
          {orderData.items.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-info">
                <h4>{item.menu_item}</h4>
                <p>Quantity: {item.quantity}</p>
                <div className="item-status">
                  {getItemStatusIcon(orderData.status)}
                  <span>{getItemStatusDisplay(orderData.status)}</span>
                </div>
              </div>
              <div className="item-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${getItemProgressPercentage(orderData.status)}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {getItemProgressPercentage(orderData.status)}%
                </span>
              </div>
              <div className="item-price">
                {formatPrice(item.line_total)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estimated Time */}
      <div className="estimated-time">
        <FiClock />
        <div>
          <h4>Estimated Time</h4>
          <p>{orderTrackingService.getEstimatedTime(orderData)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="refresh-btn" onClick={refreshOrderData} disabled={refreshing}>
          <FiRefreshCw className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
        <button className="toggle-btn" onClick={handleToggleRealTime}>
          {isRealTimeActive ? <FiPause /> : <FiPlay />}
          {isRealTimeActive ? 'Pause Updates' : 'Resume Updates'}
        </button>
      </div>

      {/* Add feedback button in completed state */}
      {orderData.status === 'completed' && (
        <div className="feedback-section">
          <button 
            className="feedback-btn"
            onClick={() => {
              setSelectedOrderForFeedback(orderData);
              setShowFeedbackModal(true);
            }}
          >
            <FiStar /> Rate Your Experience
          </button>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedOrderForFeedback && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          order={selectedOrderForFeedback}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
};

export default OrderTrackingPage;
