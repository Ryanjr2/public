// Order Confirmation Page
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiShoppingBag,
  FiArrowRight,
  FiHome,
  FiEye
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

interface OrderData {
  id: number;
  status: string;
  total: string;
  created_at: string;
  estimated_prep_time?: number;
  is_takeout: boolean;
  items: Array<{
    id: number;
    menu_item: string;
    quantity: number;
    unit_price: string;
    line_total: string;
  }>;
}

const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get order data from navigation state
  const orderData = location.state?.orderData as OrderData;
  const orderId = location.state?.orderId;

  // State
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format price in TZS
  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `TZS ${(numPrice * 1000).toLocaleString()}`; // Convert from backend decimal to TZS
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle navigation
  const handleTrackOrder = () => {
    navigate(`/order-tracking/${orderId}`);
  };

  const handleBackToMenu = () => {
    navigate('/menu');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // If no order data, redirect to menu
  if (!orderData) {
    return (
      <motion.div
        className="confirmation-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="error-state">
          <h2>Order not found</h2>
          <p>We couldn't find your order details.</p>
          <button className="btn-primary" onClick={handleBackToMenu}>
            Back to Menu
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="confirmation-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Success Header */}
      <motion.div
        className="success-header"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <div className="success-icon">
          <FiCheckCircle size={64} />
        </div>
        <h1>Order Confirmed!</h1>
        <p>Thank you, {user?.first_name || 'Customer'}! Your order has been placed successfully.</p>
      </motion.div>

      {/* Order Details */}
      <motion.div
        className="order-details"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="order-header">
          <h2>Order #{orderData.id}</h2>
          <div className="order-meta">
            <div className="meta-item">
              <FiClock />
              <span>Placed {formatTime(timeElapsed)} ago</span>
            </div>
            <div className="meta-item">
              <FiMapPin />
              <span>{orderData.is_takeout ? 'Takeout' : 'Dine In'}</span>
            </div>
            <div className="meta-item">
              <FiShoppingBag />
              <span>{orderData.items.length} items</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="order-items">
          <h3>Your Order</h3>
          {orderData.items.map((item, index) => (
            <motion.div
              key={item.id}
              className="order-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <div className="item-info">
                <span className="item-name">{item.menu_item}</span>
                <span className="item-quantity">×{item.quantity}</span>
              </div>
              <span className="item-price">{formatPrice(item.line_total)}</span>
            </motion.div>
          ))}

          <div className="order-total">
            <span>Total: {formatPrice(orderData.total)}</span>
          </div>
        </div>

        {/* Status Info */}
        <div className="status-info">
          <div className="status-badge pending">
            <FiClock />
            <span>Order Received</span>
          </div>
          <p>Your order is being prepared. We'll notify you when it's ready!</p>
          {orderData.estimated_prep_time && (
            <p className="prep-time">
              Estimated preparation time: {orderData.estimated_prep_time} minutes
            </p>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="action-buttons"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <button
          className="btn-primary track-btn"
          onClick={handleTrackOrder}
        >
          <FiEye />
          Track Order
          <FiArrowRight />
        </button>

        <div className="secondary-actions">
          <button
            className="btn-secondary"
            onClick={handleBackToMenu}
          >
            Order More
          </button>
          <button
            className="btn-secondary"
            onClick={handleGoHome}
          >
            <FiHome />
            Home
          </button>
        </div>
      </motion.div>

      {/* Celebration Animation */}
      <motion.div
        className="celebration"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="confetti">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="confetti-piece"
              initial={{
                y: -100,
                x: Math.random() * 400 - 200,
                rotate: 0,
                opacity: 1
              }}
              animate={{
                y: 600,
                rotate: 360,
                opacity: 0
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrderConfirmationPage;
